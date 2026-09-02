import type { ResponseInput } from 'openai/resources/responses/responses';
import { getOpenAIConfig } from '@/lib/ai/openai.server';
import { STUDY_TUTOR_SYSTEM_PROMPT } from '@/lib/ai/prompt';
import { retrieveLocalStudyContext } from '@/lib/ai/retrieval.server';
import { classifyTutorTask } from '@/lib/ai/model-router';
import { cleanTutorText, inferTutorLesson, sanitizeTutorHistory } from '@/lib/ai/tutor-input';

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

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 1000;
const requestBuckets = new Map<string, number[]>();

function clientKey(request: Request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}

function isRateLimited(request: Request) {
  const now = Date.now();
  const key = clientKey(request);
  const recent = (requestBuckets.get(key) ?? []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  requestBuckets.set(key, recent);
  return false;
}

function hasValidOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 64_000) {
    return Response.json({ error: 'Żądanie jest zbyt duże.' }, { status: 413 });
  }
  if (!hasValidOrigin(request)) {
    return Response.json({ error: 'Niedozwolone źródło żądania.' }, { status: 403 });
  }
  if (isRateLimited(request)) {
    return Response.json(
      { error: 'Za dużo pytań w krótkim czasie. Spróbuj ponownie za kilka minut.' },
      { status: 429, headers: { 'Retry-After': '120' } },
    );
  }

  let body: TutorRequest;
  try {
    body = (await request.json()) as TutorRequest;
  } catch {
    return Response.json({ error: 'Nieprawidłowe dane żądania.' }, { status: 400 });
  }

  const question = cleanTutorText(body.question, 1200);
  if (question.length < 2) return Response.json({ error: 'Wpisz pytanie.' }, { status: 400 });
  const config = getOpenAIConfig(classifyTutorTask(question), question);
  if (!config) {
    return Response.json(
      { error: 'Tutor AI nie jest skonfigurowany. Ustaw OPENAI_API_KEY w .env.local.' },
      { status: 503 },
    );
  }

  const selectedText = cleanTutorText(body.context?.selectedText, 1800);
  const surroundingText = cleanTutorText(body.context?.surroundingText, 2200);
  const heading = cleanTutorText(body.context?.heading, 180);
  const route = cleanTutorText(body.context?.route, 220);
  const lesson = inferTutorLesson(question, body.context?.lesson);
  const weakTopics = Array.isArray(body.context?.weakTopics)
    ? body.context.weakTopics.map((item) => cleanTutorText(item, 100)).filter(Boolean).slice(0, 5)
    : [];
  const localContext = await retrieveLocalStudyContext(
    `${question} ${selectedText} ${heading}`,
    lesson,
  );

  const historyInput: ResponseInput = sanitizeTutorHistory(body.history);

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
      text: { verbosity: 'medium' },
      max_output_tokens: 1000,
      store: false,
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
          controller.enqueue(encoder.encode('\n\n> **Połączenie zostało przerwane.** Pytanie jest zachowane — spróbuj ponownie.'));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Study-Source': config.vectorStoreId ? 'course-notes-and-file-search' : 'course-notes-local',
        'X-Model-Tier': config.route.tier,
      },
    });
  } catch (caught) {
    const status = typeof caught === 'object' && caught && 'status' in caught ? Number(caught.status) : 0;
    if (status === 429) {
      return Response.json(
        { error: 'Limit OpenAI został chwilowo osiągnięty. Spróbuj ponownie za moment.' },
        { status: 429, headers: { 'Retry-After': '30' } },
      );
    }
    return Response.json(
      { error: 'Tutor ma chwilowy problem z połączeniem. Pytanie jest zachowane — spróbuj ponownie.' },
      { status: 502, headers: { 'Retry-After': '1' } },
    );
  }
}
