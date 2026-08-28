import type { FlashcardDirection, FlashcardVerdict } from '@/lib/study/flashcard-engine';

export type FlashcardEvaluationRequest = {
  cardId?: unknown;
  lesson?: unknown;
  direction?: unknown;
  prompt?: unknown;
  expected?: unknown;
  answer?: unknown;
};

export type FlashcardEvaluation = {
  verdict: FlashcardVerdict;
  feedback: string;
  correction: string;
  source: 'ai' | 'local';
};

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function sanitizeFlashcardEvaluation(value: FlashcardEvaluationRequest) {
  const lesson = Number(value.lesson);
  const direction: FlashcardDirection | null =
    value.direction === 'de-pl' || value.direction === 'pl-de' ? value.direction : null;
  return {
    cardId: clean(value.cardId, 120),
    lesson: Number.isInteger(lesson) && lesson >= 13 && lesson <= 18 ? lesson : null,
    direction,
    prompt: clean(value.prompt, 500),
    expected: clean(value.expected, 700),
    answer: clean(value.answer, 280),
  };
}

export function isFlashcardVerdict(value: unknown): value is FlashcardVerdict {
  return value === 'correct' || value === 'almost' || value === 'incorrect';
}

