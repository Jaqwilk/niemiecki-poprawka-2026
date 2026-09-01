'use client';

export const PRACTICE_DRAFT_KEY = 'deutsch-a1-2-practice-session-v1';

export type PracticeDraftResult = {
  questionId: string;
  firstTryCorrect: boolean;
};

export type PracticeDraft = {
  version: 1;
  id: string;
  createdAt: string;
  scope: string;
  scopeLabel: string;
  questionIds: string[];
  index: number;
  answer: string;
  selectedTokens: number[];
  status: 'idle' | 'wrong' | 'retry' | 'correct';
  wrongCount: number;
  wrongAnswer: string;
  results: PracticeDraftResult[];
};

export function createPracticeDraft(
  scope: string,
  scopeLabel: string,
  questionIds: string[],
): PracticeDraft {
  const createdAt = new Date().toISOString();
  return {
    version: 1,
    id: `practice-${createdAt}`,
    createdAt,
    scope,
    scopeLabel,
    questionIds,
    index: 0,
    answer: '',
    selectedTokens: [],
    status: 'idle',
    wrongCount: 0,
    wrongAnswer: '',
    results: [],
  };
}

export function loadPracticeDraft(): PracticeDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PRACTICE_DRAFT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<PracticeDraft>;
    if (value.version !== 1 || !value.id || !value.createdAt || !value.scopeLabel
      || !Array.isArray(value.questionIds) || !value.questionIds.length) return null;
    return {
      version: 1,
      id: value.id,
      createdAt: value.createdAt,
      scope: typeof value.scope === 'string' ? value.scope : 'recommended',
      scopeLabel: value.scopeLabel,
      questionIds: value.questionIds.filter((id): id is string => typeof id === 'string'),
      index: Number.isInteger(value.index) ? Math.max(0, Number(value.index)) : 0,
      answer: typeof value.answer === 'string' ? value.answer : '',
      selectedTokens: Array.isArray(value.selectedTokens)
        ? value.selectedTokens.filter((index): index is number => Number.isInteger(index))
        : [],
      status: ['idle', 'wrong', 'retry', 'correct'].includes(value.status ?? '')
        ? value.status as PracticeDraft['status']
        : 'idle',
      wrongCount: Number.isInteger(value.wrongCount) ? Math.max(0, Number(value.wrongCount)) : 0,
      wrongAnswer: typeof value.wrongAnswer === 'string' ? value.wrongAnswer : '',
      results: Array.isArray(value.results)
        ? value.results.filter((result): result is PracticeDraftResult => Boolean(
            result && typeof result.questionId === 'string' && typeof result.firstTryCorrect === 'boolean',
          ))
        : [],
    };
  } catch {
    return null;
  }
}

export function savePracticeDraft(draft: PracticeDraft) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PRACTICE_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ćwiczenie pozostaje aktywne także wtedy, gdy pamięć przeglądarki jest zablokowana.
  }
}

export function clearPracticeDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PRACTICE_DRAFT_KEY);
}
