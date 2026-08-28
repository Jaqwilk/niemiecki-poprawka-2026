import { describe, expect, it } from 'vitest';
import { isFlashcardVerdict, sanitizeFlashcardEvaluation } from './flashcard-evaluation';

describe('flashcard evaluation input', () => {
  it('accepts only known lessons and directions', () => {
    expect(sanitizeFlashcardEvaluation({ lesson: 16, direction: 'pl-de' })).toMatchObject({
      lesson: 16,
      direction: 'pl-de',
    });
    expect(sanitizeFlashcardEvaluation({ lesson: 19, direction: 'sideways' })).toMatchObject({
      lesson: null,
      direction: null,
    });
  });

  it('caps all user-controlled strings', () => {
    const result = sanitizeFlashcardEvaluation({
      cardId: 'x'.repeat(500),
      prompt: 'p'.repeat(900),
      expected: 'e'.repeat(900),
      answer: 'a'.repeat(900),
    });
    expect(result.cardId).toHaveLength(120);
    expect(result.prompt).toHaveLength(500);
    expect(result.expected).toHaveLength(700);
    expect(result.answer).toHaveLength(280);
  });

  it('validates the closed verdict set', () => {
    expect(isFlashcardVerdict('almost')).toBe(true);
    expect(isFlashcardVerdict('maybe')).toBe(false);
  });
});

