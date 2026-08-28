import { describe, expect, it } from 'vitest';
import {
  buildMultipleChoiceOptions,
  isExactFlashcardAnswer,
  nextFlashcardMastery,
  normalizeFlashcardAnswer,
  selectLearnCards,
} from './flashcard-engine';
import { flashcardCountsByLesson, vocabularyFlashcards } from './flashcards';

describe('vocabulary flashcards', () => {
  it('contains a substantial, unique deck for every lesson', () => {
    expect(vocabularyFlashcards.length).toBeGreaterThanOrEqual(290);
    expect(new Set(vocabularyFlashcards.map((card) => card.id)).size).toBe(vocabularyFlashcards.length);
    for (const lesson of [13, 14, 15, 16, 17, 18] as const) {
      expect(flashcardCountsByLesson[lesson]).toBeGreaterThanOrEqual(40);
    }
  });

  it('normalizes diacritics, punctuation and German sharp s', () => {
    expect(normalizeFlashcardAnswer('  Die STRAẞE! ')).toBe('die strasse');
  });

  it('accepts the singular German form and exact Polish alternatives', () => {
    const park = vocabularyFlashcards.find((card) => card.german.startsWith('der Park'))!;
    expect(isExactFlashcardAnswer(park, 'der Park', 'pl-de')).toBe(true);
    expect(isExactFlashcardAnswer(park, 'park', 'de-pl')).toBe(true);
  });

  it('builds four deterministic answer options containing the answer', () => {
    const card = vocabularyFlashcards[0];
    const options = buildMultipleChoiceOptions(card, vocabularyFlashcards, 'de-pl');
    expect(options).toHaveLength(4);
    expect(options).toContain(card.polish);
    expect(new Set(options).size).toBe(4);
  });

  it('prefers plausible distractors from the same category', () => {
    const card = vocabularyFlashcards.find((item) => item.german === 'geradeaus gehen')!;
    const options = buildMultipleChoiceOptions(card, vocabularyFlashcards, 'de-pl');
    const categoryAnswers = new Set(
      vocabularyFlashcards
        .filter((item) => item.lesson === card.lesson && item.category === card.category)
        .map((item) => item.polish),
    );
    expect(options.every((option) => categoryAnswers.has(option))).toBe(true);
  });

  it('moves from recognition to written mastery', () => {
    expect(nextFlashcardMastery(0, 'correct', 'choice')).toBe(1);
    expect(nextFlashcardMastery(1, 'correct', 'written')).toBe(2);
    expect(nextFlashcardMastery(2, 'incorrect', 'written')).toBe(1);
  });

  it('prioritizes unknown and frequently missed cards', () => {
    const [first, second] = vocabularyFlashcards;
    const selected = selectLearnCards(
      [first, second],
      {
        [first.id]: { mastery: 2, seen: 2, correct: 2, incorrect: 0, starred: false, updatedAt: '' },
        [second.id]: { mastery: 0, seen: 3, correct: 0, incorrect: 3, starred: false, updatedAt: '' },
      },
      1,
    );
    expect(selected[0].id).toBe(second.id);
  });
});
