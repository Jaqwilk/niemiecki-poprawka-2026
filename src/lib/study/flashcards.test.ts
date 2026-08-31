import { describe, expect, it } from 'vitest';
import {
  advanceFlashcardLearnStep,
  buildMultipleChoiceOptions,
  evaluateFlashcardAnswerLocally,
  flashcardLearnBatch,
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

  it('grades common written-answer cases locally and leaves semantic synonyms to AI', () => {
    const park = vocabularyFlashcards.find((card) => card.german.startsWith('der Park'))!;
    const zoo = vocabularyFlashcards.find((card) => card.german.startsWith('der Zoo'))!;

    expect(evaluateFlashcardAnswerLocally(park, 'parkk', 'de-pl', vocabularyFlashcards)?.verdict).toBe('correct');
    expect(evaluateFlashcardAnswerLocally(park, zoo.polish, 'de-pl', vocabularyFlashcards)?.verdict).toBe('incorrect');
    expect(evaluateFlashcardAnswerLocally(park, 'teren zielony', 'de-pl', vocabularyFlashcards)).toBeNull();
    expect(evaluateFlashcardAnswerLocally(park, 'Park', 'pl-de', vocabularyFlashcards)?.verdict).toBe('almost');
    expect(evaluateFlashcardAnswerLocally(park, 'die Park', 'pl-de', vocabularyFlashcards)?.verdict).toBe('almost');
  });

  it('keeps learning in batches of ten: choice first, then written, then next batch', () => {
    const ids = Array.from({ length: 23 }, (_, index) => `card-${index + 1}`);
    const firstBatch = flashcardLearnBatch(ids, 0);
    expect(firstBatch).toEqual(ids.slice(0, 10));

    const recognized = Object.fromEntries(firstBatch.map((id) => [id, 1])) as Record<string, 0 | 1 | 2>;
    const writtenStep = advanceFlashcardLearnStep(
      ids,
      { batchIndex: 0, phase: 'choice', queue: [firstBatch.at(-1)!] },
      recognized,
    );
    expect(writtenStep).toEqual({ batchIndex: 0, phase: 'written', queue: firstBatch });

    const mastered = Object.fromEntries(firstBatch.map((id) => [id, 2])) as Record<string, 0 | 1 | 2>;
    const nextBatch = advanceFlashcardLearnStep(
      ids,
      { batchIndex: 0, phase: 'written', queue: [firstBatch.at(-1)!] },
      mastered,
    );
    expect(nextBatch).toEqual({ batchIndex: 1, phase: 'choice', queue: ids.slice(10, 20) });
  });

  it('repeats missed cards before changing the learning phase', () => {
    const ids = Array.from({ length: 10 }, (_, index) => `card-${index + 1}`);
    const mastery = Object.fromEntries(ids.map((id) => [id, id === 'card-3' ? 0 : 1])) as Record<string, 0 | 1 | 2>;
    const next = advanceFlashcardLearnStep(
      ids,
      { batchIndex: 0, phase: 'choice', queue: ['card-10'] },
      mastery,
    );
    expect(next).toEqual({ batchIndex: 0, phase: 'choice', queue: ['card-3'] });
  });
});
