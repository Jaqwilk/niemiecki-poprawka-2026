import { copyFile, cp, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const tempRoot = path.join(root, 'tmp', 'hostinger-export');
const outputRoot = path.join(root, 'output', 'hostinger-site');
const configOutputRoot = path.join(root, 'output', 'hostinger-config');
const domain = 'jebaccwelazniemieckiego.pl';

function assertWorkspacePath(target) {
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Unsafe generated path: ${target}`);
  }
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(command)} exited with code ${code}`));
    });
  });
}

function stripMdx(value) {
  return value
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[`*_#|>{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function frontmatterTitle(value, fallback) {
  const match = value.match(/^---[\s\S]*?^title:\s*["']?(.+?)["']?\s*$[\s\S]*?^---/m);
  return match?.[1]?.trim() || fallback;
}

async function buildStudyIndex() {
  const entries = [];
  const overviewPath = path.join(root, 'content', 'docs', 'index.mdx');
  const overview = await readFile(overviewPath, 'utf8');
  const overviewTitle = frontmatterTitle(overview, 'Übersicht');
  entries.push({
    id: '/docs',
    type: 'page',
    content: overviewTitle,
    breadcrumbs: ['Momente A1.2'],
    url: '/docs/',
    lesson: null,
    searchText: stripMdx(overview),
    tutorText: stripMdx(overview).slice(0, 1100),
  });

  for (let lesson = 13; lesson <= 18; lesson += 1) {
    const filePath = path.join(root, 'content', 'docs', 'lessons', `${lesson}.mdx`);
    const source = await readFile(filePath, 'utf8');
    const title = frontmatterTitle(source, `Lektion ${lesson}`);
    const url = `/docs/lessons/${lesson}/`;
    entries.push({
      id: url,
      type: 'page',
      content: title,
      breadcrumbs: ['Momente A1.2', 'Lektionen'],
      url,
      lesson,
      searchText: `${title} ${stripMdx(source)}`,
      tutorText: stripMdx(source).slice(0, 1100),
    });

    const paragraphs = source
      .replace(/^---[\s\S]*?---/m, '')
      .split(/\n\s*\n/)
      .map(stripMdx)
      .filter((paragraph) => paragraph.length >= 40);

    paragraphs.forEach((paragraph, index) => {
      entries.push({
        id: `${url}p-${index + 1}`,
        type: 'text',
        content: paragraph.slice(0, 320),
        breadcrumbs: ['Momente A1.2', `Lektion ${lesson}`],
        url,
        lesson,
        searchText: `${title} ${paragraph}`,
        tutorText: paragraph.slice(0, 1100),
      });
    });
  }

  await mkdir(configOutputRoot, { recursive: true });
  await writeFile(path.join(configOutputRoot, 'study-index.json'), JSON.stringify(entries), 'utf8');
}

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(candidate));
    else if (entry.isFile()) files.push(candidate);
  }
  return files;
}

async function mirrorNextDataFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(directory, entry.name);
    if (entry.name.startsWith('__next.')) {
      for (const sourceFile of await collectFiles(candidate)) {
        const flattenedName = path.relative(directory, sourceFile).split(path.sep).join('.');
        await copyFile(sourceFile, path.join(directory, flattenedName));
      }
      continue;
    }
    if (entry.name !== '_next') await mirrorNextDataFiles(candidate);
  }
}

for (const generatedPath of [tempRoot, outputRoot, configOutputRoot]) assertWorkspacePath(generatedPath);
await rm(tempRoot, { recursive: true, force: true });
await rm(outputRoot, { recursive: true, force: true });
await rm(configOutputRoot, { recursive: true, force: true });
await mkdir(tempRoot, { recursive: true });

const rootItems = [
  'content',
  'public',
  'src',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'next.config.mjs',
  'postcss.config.mjs',
];

for (const item of rootItems) {
  const source = path.join(root, item);
  const destination = path.join(tempRoot, item);
  await cp(source, destination, {
    recursive: true,
    filter(candidate) {
      const relative = path.relative(root, candidate);
      const apiRoot = path.join('src', 'app', 'api');
      return relative !== apiRoot && !relative.startsWith(`${apiRoot}${path.sep}`);
    },
  });
}

const nodeModules = path.join(root, 'node_modules');
if (!(await stat(nodeModules)).isDirectory()) throw new Error('Run npm install before building.');
await symlink(nodeModules, path.join(tempRoot, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');

try {
  await run(process.execPath, [path.join(nodeModules, 'next', 'dist', 'bin', 'next'), 'build', '--webpack'], {
    cwd: tempRoot,
    env: {
      ...process.env,
      HOSTINGER_STATIC_EXPORT: 'true',
      NEXT_PUBLIC_SITE_URL: `https://${domain}`,
      NEXT_PUBLIC_EDIT_MODE_ENABLED: 'false',
    },
  });

  await cp(path.join(tempRoot, 'out'), outputRoot, { recursive: true });
  await mirrorNextDataFiles(outputRoot);
  await cp(path.join(root, 'deploy', 'hostinger', 'api'), path.join(outputRoot, 'api'), { recursive: true });
  await cp(path.join(root, 'deploy', 'hostinger', '.htaccess'), path.join(outputRoot, '.htaccess'));
  await buildStudyIndex();
  process.stdout.write(`Hostinger build ready: ${outputRoot}\n`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
