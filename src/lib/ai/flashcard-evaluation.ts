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

export type FlashcardEvaluationReason =
  | 'equivalent'
  | 'minor_typo'
  | 'minor_form'
  | 'missing_part'
  | 'different_meaning';

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

export function isFlashcardEvaluationReason(value: unknown): value is FlashcardEvaluationReason {
  return value === 'equivalent'
    || value === 'minor_typo'
    || value === 'minor_form'
    || value === 'missing_part'
    || value === 'different_meaning';
}

export function createFlashcardEvaluation(
  reason: FlashcardEvaluationReason,
  expected: string,
): FlashcardEvaluation {
  const feedbackByReason: Record<FlashcardEvaluationReason, string> = {
    equivalent: 'Dobrze — ta odpowiedź ma równoważne znaczenie.',
    minor_typo: 'Dobrze — drobna literówka nie zmienia znaczenia.',
    minor_form: 'Sens jest poprawny, ale popraw formę według odpowiedzi poniżej.',
    missing_part: 'Kierunek jest dobry, ale brakuje ważnej części odpowiedzi.',
    different_meaning: 'Ta odpowiedź ma inne znaczenie niż wymagana fiszka.',
  };
  const verdictByReason: Record<FlashcardEvaluationReason, FlashcardVerdict> = {
    equivalent: 'correct',
    minor_typo: 'correct',
    minor_form: 'almost',
    missing_part: 'almost',
    different_meaning: 'incorrect',
  };
  return {
    verdict: verdictByReason[reason],
    feedback: feedbackByReason[reason],
    correction: expected,
    source: 'ai',
  };
}
