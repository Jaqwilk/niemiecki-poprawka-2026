import { applyStoredProposal, discardProposal, verifyEditToken } from '@/lib/ai/edit.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!verifyEditToken(request.headers.get('X-Edit-Token'))) {
    return Response.json({ error: 'Edit Mode jest wyłączony albo token jest nieprawidłowy.' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { proposalId?: unknown; action?: unknown } | null;
  const proposalId = typeof body?.proposalId === 'string' ? body.proposalId : '';
  if (!proposalId) return Response.json({ error: 'Brak identyfikatora propozycji.' }, { status: 400 });
  if (body?.action === 'cancel') {
    discardProposal(proposalId);
    return Response.json({ cancelled: true });
  }
  if (body?.action !== 'apply') return Response.json({ error: 'Nieznana akcja.' }, { status: 400 });
  try {
    return Response.json({ applied: await applyStoredProposal(proposalId) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Nie udało się zastosować zmiany.' },
      { status: 409 },
    );
  }
}
