import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import OpenAI, { toFile } from 'openai';

const projectRoot = process.cwd();
const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey) {
  throw new Error('Ustaw OPENAI_API_KEY przed uruchomieniem ingestu.');
}

const client = new OpenAI({ apiKey });
const requestedStoreId = process.env.OPENAI_VECTOR_STORE_ID?.trim();
const vectorStore = requestedStoreId
  ? await client.vectorStores.retrieve(requestedStoreId)
  : await client.vectorStores.create({
      name: 'Momente A1.2 — Lektion 13–18',
      metadata: { scope: 'lektion-13-18', project: 'niemiecki-poprawka-2026' },
    });

const requiredFiles = [
  'docs/study-audit.md',
  ...[13, 14, 15, 16, 17, 18].map((lesson) => `content/docs/lessons/${lesson}.mdx`),
];

const optionalFiles = [
  'materials/book/Momente_A1.2_Lektion_13-18_ONLY.pdf',
  ...[
    'materials/22052026_GIE_Kap18.pdf',
    'materials/26052026_GiE.pdf',
    'materials/Alltagssituation12052026.pdf',
    'materials/GiE 31032026.pdf',
    'materials/GiE_08052026_Alltagssituation.pdf',
  ],
  ...[
    'summary-13-18.md',
    'review-13-15.md',
    'review-16-18.md',
    'grammar-13-18.md',
    'vocabulary-13-18.md',
    'communication-13-18.md',
  ].map((file) => `materials/book/knowledge-base/${file}`),
];

async function exists(relativePath) {
  try {
    await access(path.join(projectRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

const selectedFiles = [
  ...requiredFiles,
  ...(await Promise.all(optionalFiles.map(async (file) => ((await exists(file)) ? file : null)))),
].filter(Boolean);

for (const relativePath of selectedFiles) {
  const absolutePath = path.join(projectRoot, relativePath);
  const data = await readFile(absolutePath);
  const upload = await toFile(data, path.basename(relativePath));
  const result = await client.vectorStores.files.uploadAndPoll(vectorStore.id, upload);
  if (result.status !== 'completed') {
    throw new Error(`Indeksowanie nie powiodło się dla ${relativePath}: ${result.status}`);
  }
  process.stdout.write(`✓ ${relativePath}\n`);
}

process.stdout.write(`\nVector store gotowy: ${vectorStore.id}\n`);
process.stdout.write('Wpisz ten identyfikator jako OPENAI_VECTOR_STORE_ID w .env.local.\n');
