import 'server-only';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MAX_FILE_SIZE = 120_000;
const PROPOSAL_TTL_MS = 15 * 60 * 1000;
const allowedRoots = [
  'content/docs/lessons',
  'src/components/study',
  'src/lib/study',
] as const;
const allowedFiles = new Set(['src/app/global.css']);
const allowedExtensions = new Set(['.mdx', '.tsx', '.ts', '.css']);

export type EditProposal = {
  id: string;
  path: string;
  originalHash: string;
  originalContent: string;
  proposedContent: string;
  explanation: string;
  diff: string;
  createdAt: number;
};

declare global {
  var __studyEditProposals: Map<string, EditProposal> | undefined;
}

const proposals = globalThis.__studyEditProposals ?? new Map<string, EditProposal>();
globalThis.__studyEditProposals = proposals;

export function editModeAvailable() {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.EDIT_MODE_ENABLED === 'true' &&
    Boolean(process.env.EDIT_MODE_TOKEN?.trim())
  );
}

export function verifyEditToken(value: string | null) {
  const expected = process.env.EDIT_MODE_TOKEN?.trim();
  if (!editModeAvailable() || !expected || !value) return false;
  const actualHash = createHash('sha256').update(value).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}

function normalizeRelativePath(value: string) {
  const normalized = value.trim().replaceAll('\\', '/').replace(/^\.\//, '');
  if (
    !normalized ||
    normalized.startsWith('/') ||
    normalized.includes('\0') ||
    normalized.includes(':') ||
    normalized.split('/').some((segment) => segment === '..' || segment === '.')
  ) {
    throw new Error('Niedozwolona ścieżka.');
  }
  return normalized;
}

function isAllowlisted(relativePath: string) {
  if (allowedFiles.has(relativePath)) return true;
  return allowedRoots.some((root) => relativePath.startsWith(`${root}/`));
}

export async function resolveAllowedFile(value: string) {
  const relativePath = normalizeRelativePath(value);
  if (!isAllowlisted(relativePath) || !allowedExtensions.has(path.extname(relativePath))) {
    throw new Error('Plik nie znajduje się na liście dozwolonych ścieżek.');
  }
  const projectRoot = await realpath(process.cwd());
  const candidate = path.resolve(projectRoot, ...relativePath.split('/'));
  const resolved = await realpath(candidate);
  if (resolved !== projectRoot && !resolved.startsWith(`${projectRoot}${path.sep}`)) {
    throw new Error('Ścieżka wychodzi poza repozytorium.');
  }
  return { relativePath, absolutePath: resolved, projectRoot };
}

export async function readAllowedRepoFile(value: string) {
  const resolved = await resolveAllowedFile(value);
  const content = await readFile(resolved.absolutePath, 'utf8');
  if (content.length > MAX_FILE_SIZE) throw new Error('Plik jest zbyt duży dla Edit Mode.');
  return { ...resolved, content, hash: hashContent(content) };
}

export function hashContent(content: string) {
  return createHash('sha256').update(content).digest('hex');
}

async function walk(relativeDirectory: string): Promise<string[]> {
  const absoluteDirectory = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    ...relativeDirectory.split('/'),
  );
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = `${relativeDirectory}/${entry.name}`;
      if (entry.isDirectory()) return walk(relativePath);
      return allowedExtensions.has(path.extname(entry.name)) ? [relativePath] : [];
    }),
  );
  return nested.flat();
}

export async function listAllowedRepoFiles() {
  const roots = await Promise.all(allowedRoots.map((root) => walk(root)));
  return [...allowedFiles, ...roots.flat()].sort();
}

export async function searchAllowedRepo(query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase('pl-PL').slice(0, 100);
  if (!normalizedQuery) return [];
  const files = await listAllowedRepoFiles();
  const results: Array<{ path: string; line: number; excerpt: string }> = [];
  for (const file of files) {
    const { content } = await readAllowedRepoFile(file);
    for (const [index, line] of content.split('\n').entries()) {
      if (line.toLocaleLowerCase('pl-PL').includes(normalizedQuery)) {
        results.push({ path: file, line: index + 1, excerpt: line.trim().slice(0, 220) });
        if (results.length >= 40) return results;
      }
    }
  }
  return results;
}

export function buildCompactDiff(relativePath: string, original: string, proposed: string) {
  const before = original.split('\n');
  const after = proposed.split('\n');
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix += 1;
  let suffix = 0;
  while (
    suffix < before.length - prefix &&
    suffix < after.length - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  const contextStart = Math.max(0, prefix - 3);
  const beforeEnd = before.length - suffix;
  const afterEnd = after.length - suffix;
  const contextSuffix = Math.min(3, suffix);
  const lines = [
    `--- a/${relativePath}`,
    `+++ b/${relativePath}`,
    `@@ -${contextStart + 1},${beforeEnd - contextStart + contextSuffix} +${contextStart + 1},${afterEnd - contextStart + contextSuffix} @@`,
    ...before.slice(contextStart, prefix).map((line) => ` ${line}`),
    ...before.slice(prefix, beforeEnd).map((line) => `-${line}`),
    ...after.slice(prefix, afterEnd).map((line) => `+${line}`),
    ...after.slice(afterEnd, afterEnd + contextSuffix).map((line) => ` ${line}`),
  ];
  return lines.join('\n');
}

export function saveProposal(input: Omit<EditProposal, 'id' | 'createdAt' | 'diff'>) {
  pruneProposals();
  const proposal: EditProposal = {
    ...input,
    id: randomUUID(),
    createdAt: Date.now(),
    diff: buildCompactDiff(input.path, input.originalContent, input.proposedContent),
  };
  proposals.set(proposal.id, proposal);
  return proposal;
}

export function discardProposal(id: string) {
  proposals.delete(id);
}

export async function applyStoredProposal(id: string) {
  pruneProposals();
  const proposal = proposals.get(id);
  if (!proposal) throw new Error('Propozycja wygasła albo nie istnieje.');
  const current = await readAllowedRepoFile(proposal.path);
  if (current.hash !== proposal.originalHash) {
    throw new Error('Plik zmienił się od wygenerowania podglądu. Utwórz nową propozycję.');
  }

  const backupRelative = path.join(
    '.codex-backups',
    new Date().toISOString().replaceAll(':', '-'),
    ...proposal.path.split('/'),
  );
  const backupAbsolute = path.join(current.projectRoot, backupRelative);
  await mkdir(path.dirname(backupAbsolute), { recursive: true });
  await writeFile(backupAbsolute, current.content, 'utf8');
  await writeFile(current.absolutePath, proposal.proposedContent, 'utf8');
  proposals.delete(id);
  return { path: proposal.path, backupPath: backupRelative.replaceAll('\\', '/') };
}

function pruneProposals() {
  const cutoff = Date.now() - PROPOSAL_TTL_MS;
  for (const [id, proposal] of proposals) {
    if (proposal.createdAt < cutoff) proposals.delete(id);
  }
}
