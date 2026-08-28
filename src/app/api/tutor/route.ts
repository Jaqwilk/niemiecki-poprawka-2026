import type { ResponseInput } from 'openai/resources/responses/responses';
import { getOpenAIConfig } from '@/lib/ai/openai.server';
import { STUDY_TUTOR_SYSTEM_PROMPT } from '@/lib/ai/prompt';
import { retrieveLocalStudyContext } from '@/lib/ai/retrieval.server';
import { classifyTutorTask } from '@/lib/ai/model-router';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TutorRequest = {
  question?: unknown;
  context?: {
    selectedText?: unknown;
    surroundingText?: unknown;
    heading?: unknown;
    route?: unknown;
    lesson?: unknown;
    weakTopics?: unknown;
  };
  history?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(request: Request) {
  let body: TutorRequest;
  try {
    body = (await request.json()) as TutorRequest;
  } catch {
    return Response.json({ error: 'Nieprawidłowe dane żądania.' }, { status: 400 });
  }

  const question = text(body.question, 1200);
  if (question.length < 2) return Response.json({ error: 'Wpisz pytanie.' }, { status: 400 });
  const config = getOpenAIConfig(classifyTutorTask(question), question);
  if (!config) {
    return Response.json(
      { error: 'Tutor AI nie jest skonfigurowany. Ustaw OPENAI_API_KEY w .env.local.' },
      { status: 503 },
    );
  }

  const selectedText = text(body.context?.selectedText, 1800);
  const surroundingText = text(body.context?.surroundingText, 2200);
  const heading = text(body.context?.heading, 180);
  const route = text(body.context?.route, 220);
  const lessonValue = Number(body.context?.lesson);
  const lesson = Number.isInteger(lessonValue) && lessonValue >= 13 && lessonValue <= 18 ? lessonValue : null;
  const weakTopics = Array.isArray(body.context?.weakTopics)
    ? body.context.weakTopics.map((item) => text(item, 100)).filter(Boolean).slice(0, 5)
    : [];
  const localContext = await retrieveLocalStudyContext(
    `${question} ${selectedText} ${heading}`,
    lesson,
  );

  const historyInput: ResponseInput = Array.isArray(body.history)
    ? body.history
        .slice(-6)
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const candidate = item as { role?: unknown; text?: unknown };
          const role = candidate.role === 'assistant' ? 'assistant' : 'user';
          const content = text(candidate.text, 1200);
          return content ? { role, content } : null;
        })
        .filter((item): item is { role: 'user' | 'assistant'; content: string } => item !== null)
    : [];

  const contextBlock = [
    lesson ? `Bieżąca lekcja: Lektion ${lesson}` : '',
    heading ? `Sekcja: ${heading}` : '',
    route ? `Trasa: ${route}` : '',
    selectedText ? `Zaznaczony tekst:\n${selectedText}` : '',
    surroundingText ? `Najbliższy kontekst:\n${surroundingText}` : '',
    weakTopics.length ? `Ostatnie słabe tematy: ${weakTopics.join(', ')}` : '',
    `Lokalnie odnalezione notatki:\n${localContext}`,
    `Pytanie ucznia:\n${question}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const stream = await config.client.responses.create({
      model: config.route.model,
      reasoning: { effort: config.route.reasoningEffort },
      instructions: STUDY_TUTOR_SYSTEM_PROMPT,
      input: [...historyInput, { role: 'user', content: contextBlock }],
      tools: config.vectorStoreId
        ? [{ type: 'file_search', vector_store_ids: [config.vectorStoreId], max_num_results: 6 }]
        : undefined,
      text: { verbosity: 'low' },
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'response.output_text.delta') {
              controller.enqueue(encoder.encode(event.delta));
            }
          }
          controller.close();
        } catch {
          controller.enqueue(encoder.encode('\n\nNie udało się dokończyć odpowiedzi. Spróbuj ponownie.'));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Study-Source': config.vectorStoreId ? 'course-notes-and-file-search' : 'course-notes-local',
        'X-Model-Tier': config.route.tier,
      },
    });
  } catch {
    return Response.json(
      { error: 'Nie udało się uruchomić tutora. Sprawdź konfigurację serwera i spróbuj ponownie.' },
      { status: 502 },
    );
  }
}
