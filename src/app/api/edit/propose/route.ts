import { EDITOR_SYSTEM_PROMPT } from '@/lib/ai/prompt';
import { getOpenAIConfig } from '@/lib/ai/openai.server';
import { readAllowedRepoFile, saveProposal, verifyEditToken } from '@/lib/ai/edit.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!verifyEditToken(request.headers.get('X-Edit-Token'))) {
    return Response.json({ error: 'Edit Mode jest wyłączony albo token jest nieprawidłowy.' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { path?: unknown; instruction?: unknown } | null;
  const filePath = typeof body?.path === 'string' ? body.path : '';
  const instruction = typeof body?.instruction === 'string' ? body.instruction.trim().slice(0, 1600) : '';
  if (!filePath || instruction.length < 3) {
    return Response.json({ error: 'Wybierz plik i opisz zmianę.' }, { status: 400 });
  }
  const config = getOpenAIConfig('repo-edit', instruction);
  if (!config) return Response.json({ error: 'Skonfiguruj OPENAI_API_KEY.' }, { status: 503 });

  try {
    const file = await readAllowedRepoFile(filePath);
    const response = await config.client.responses.create({
      model: config.route.model,
      reasoning: { effort: config.route.reasoningEffort },
      instructions: EDITOR_SYSTEM_PROMPT,
      input: `Ścieżka: ${file.relativePath}\n\nProśba użytkownika:\n${instruction}\n\nAktualna zawartość pliku:\n<file>\n${file.content}\n</file>`,
      text: {
        verbosity: 'low',
        format: {
          type: 'json_schema',
          name: 'edit_proposal',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              explanation: { type: 'string' },
              proposedContent: { type: 'string' },
            },
            required: ['explanation', 'proposedContent'],
          },
        },
      },
    });
    const parsed = JSON.parse(response.output_text) as { explanation?: unknown; proposedContent?: unknown };
    const proposedContent = typeof parsed.proposedContent === 'string' ? parsed.proposedContent : '';
    const explanation = typeof parsed.explanation === 'string' ? parsed.explanation.slice(0, 600) : '';
    if (!proposedContent || proposedContent.length > 120_000) throw new Error('Model zwrócił nieprawidłową zawartość.');
    if (proposedContent === file.content) throw new Error('Propozycja nie zawiera żadnej zmiany.');
    const proposal = saveProposal({
      path: file.relativePath,
      originalHash: file.hash,
      originalContent: file.content,
      proposedContent,
      explanation,
    });
    return Response.json({
      proposal: {
        id: proposal.id,
        path: proposal.path,
        explanation: proposal.explanation,
        diff: proposal.diff,
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message.slice(0, 400) : 'Nie udało się utworzyć propozycji.' },
      { status: 400 },
    );
  }
}
