import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  isCorrectAnswer,
  normalizeAnswer,
  recordMistake,
  resolveMistake,
  selectRecommendedQuestions,
} from './engine';
import type { StudyQuestion } from './types';

const question: StudyQuestion = {
  id: 'test-mit-dativ',
  lesson: 17,
  topic: 'mit + Dativ',
  skill: 'grammar',
  kind: 'input',
  prompt: 'Ich fahre mit ___ Freund.',
  acceptedAnswers: ['meinem'],
  correctAnswer: 'meinem',
  explanation: 'mit wymaga Dativu',
  source: { label: 'test', type: 'workbook' },
  difficulty: 2,
};

describe('answer normalization', () => {
  it('ignores casing, repeated spaces and final punctuation', () => {
    expect(normalizeAnswer('  MEINEM   Freund! ')).toBe('meinem freund');
  });

  it('does not hide a wrong grammatical ending', () => {
    expect(isCorrectAnswer(question, 'meinem.')).toBe(true);
    expect(isCorrectAnswer(question, 'meinen')).toBe(false);
  });
});

describe('mistake lifecycle', () => {
  it('keeps a mistake open until a successful retry', () => {
    const initial = createInitialState();
    const wrong = recordMistake(initial, question, 'meinen', '2026-08-28T10:00:00.000Z');
    expect(wrong.mistakes[0]).toMatchObject({ status: 'open', mistakeCount: 1, userAnswer: 'meinen' });

    const repeated = recordMistake(wrong, question, 'mein', '2026-08-28T10:05:00.000Z');
    expect(repeated.mistakes[0]).toMatchObject({ status: 'open', mistakeCount: 2, userAnswer: 'mein' });

    const resolved = resolveMistake(repeated, question.id);
    expect(resolved.mistakes[0]).toMatchObject({ status: 'resolved', successfulRetries: 1 });
  });
});

describe('adaptive selection', () => {
  it('prioritizes an open repeated mistake', () => {
    const other = { ...question, id: 'test-other', lesson: 13 as const, topic: 'es gibt' };
    const state = recordMistake(createInitialState(), question, 'meinen');
    const selected = selectRecommendedQuestions([other, question], state, 2);
    expect(selected[0].id).toBe(question.id);
  });
});
