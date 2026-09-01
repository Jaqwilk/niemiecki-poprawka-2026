import { describe, expect, it } from 'vitest';
import {
  isAnswerEvaluation,
  sanitizeAnswerEvaluationItems,
} from './answer-evaluation';

describe('answer evaluation payload', () => {
  it('keeps only complete, bounded study answers', () => {
    const items = sanitizeAnswerEvaluationItems([
      {
        id: 'q-1',
        lesson: 16,
        kind: 'correction',
        skill: 'grammar',
        topic: 'in / vor / nach',
        prompt: 'Ich komme in zwei Tagen.',
        instruction: 'Korrigieren Sie.',
        acceptedAnswers: ['Ich komme in zwei Tagen.'],
        expected: 'Ich komme in zwei Tagen.',
        explanation: 'in + Dativ opisuje przyszłość.',
        answer: 'Ich komme nach zwei Tagen.',
      },
      { id: 'empty', lesson: 13, prompt: 'x', expected: 'y', answer: '' },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: 'q-1', lesson: 16 });
  });

  it('accepts only complete structured evaluations', () => {
    expect(isAnswerEvaluation({
      id: 'q-1',
      verdict: 'almost',
      issue: 'grammar',
      feedback: 'Po „in” użyj Dativu.',
      correction: 'Ich komme in zwei Tagen.',
      source: 'ai',
    })).toBe(true);
    expect(isAnswerEvaluation({ id: 'q-1', verdict: 'maybe' })).toBe(false);
  });
});
