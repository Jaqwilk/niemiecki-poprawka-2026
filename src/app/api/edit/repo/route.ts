import {
  listAllowedRepoFiles,
  readAllowedRepoFile,
  searchAllowedRepo,
  verifyEditToken,
} from '@/lib/ai/edit.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!verifyEditToken(request.headers.get('X-Edit-Token'))) {
    return Response.json({ error: 'Edit Mode jest wyłączony albo token jest nieprawidłowy.' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as
    | { action?: unknown; path?: unknown; query?: unknown }
    | null;
  try {
    if (body?.action === 'list') return Response.json({ files: await listAllowedRepoFiles() });
    if (body?.action === 'read' && typeof body.path === 'string') {
      const file = await readAllowedRepoFile(body.path);
      return Response.json({ path: file.relativePath, content: file.content });
    }
    if (body?.action === 'search' && typeof body.query === 'string') {
      return Response.json({ results: await searchAllowedRepo(body.query) });
    }
    return Response.json({ error: 'Nieznana operacja.' }, { status: 400 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Operacja repozytorium nie powiodła się.' },
      { status: 400 },
    );
  }
}
