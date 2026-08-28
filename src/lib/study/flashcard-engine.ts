import type { VocabularyFlashcard } from './flashcards';

export type FlashcardDirection = 'de-pl' | 'pl-de';
export type FlashcardVerdict = 'correct' | 'almost' | 'incorrect';
export type FlashcardMastery = 0 | 1 | 2;

export type FlashcardProgress = {
  mastery: FlashcardMastery;
  seen: number;
  correct: number;
  incorrect: number;
  starred: boolean;
  updatedAt: string;
};

export function normalizeFlashcardAnswer(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ßẞ]/g, 'ss')
    .toLocaleLowerCase('de-DE')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function answerVariants(value: string, german: boolean) {
  const withoutNotes = value.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const variants = new Set([withoutNotes]);
  for (const part of withoutNotes.split(/\s+(?:\/|;|↔)\s+/)) {
    if (part.trim().length >= 2) variants.add(part.trim());
    if (german && part.includes(',')) variants.add(part.split(',')[0].trim());
  }
  if (german && withoutNotes.includes(',')) variants.add(withoutNotes.split(',')[0].trim());
  return [...variants].map(normalizeFlashcardAnswer).filter(Boolean);
}

export function expectedFlashcardAnswer(card: VocabularyFlashcard, direction: FlashcardDirection) {
  return direction === 'de-pl' ? card.polish : card.german;
}

export function flashcardPrompt(card: VocabularyFlashcard, direction: FlashcardDirection) {
  return direction === 'de-pl' ? card.german : card.polish;
}

export function isExactFlashcardAnswer(
  card: VocabularyFlashcard,
  answer: string,
  direction: FlashcardDirection,
) {
  const normalized = normalizeFlashcardAnswer(answer);
  if (!normalized) return false;
  return answerVariants(expectedFlashcardAnswer(card, direction), direction === 'pl-de').includes(normalized);
}

export function primaryGermanTerm(card: VocabularyFlashcard) {
  return card.german.replace(/\([^)]*\)/g, '').split(/\s+\/\s+/)[0].split(',')[0].trim();
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededShuffle<T>(values: readonly T[], seed: string) {
  const copy = [...values];
  let state = stableHash(seed) || 1;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const target = state % (index + 1);
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

export function buildMultipleChoiceOptions(
  card: VocabularyFlashcard,
  pool: readonly VocabularyFlashcard[],
  direction: FlashcardDirection,
) {
  const answer = expectedFlashcardAnswer(card, direction);
  const sameCategory = pool.filter(
    (candidate) =>
      candidate.id !== card.id &&
      candidate.lesson === card.lesson &&
      candidate.category === card.category &&
      expectedFlashcardAnswer(candidate, direction) !== answer,
  );
  const sameLesson = pool.filter(
    (candidate) =>
      candidate.id !== card.id &&
      candidate.lesson === card.lesson &&
      expectedFlashcardAnswer(candidate, direction) !== answer,
  );
  const distractors: string[] = [];
  for (const [tierIndex, tier] of [sameCategory, sameLesson, [...pool]].entries()) {
    for (const candidate of seededShuffle(tier, `${card.id}-${direction}-${tierIndex}`)) {
      const candidateAnswer = expectedFlashcardAnswer(candidate, direction);
      if (candidate.id !== card.id && candidateAnswer !== answer && !distractors.includes(candidateAnswer)) {
        distractors.push(candidateAnswer);
      }
      if (distractors.length === 3) break;
    }
    if (distractors.length === 3) break;
  }
  return seededShuffle([answer, ...distractors], `${direction}-${card.id}-answers`);
}

export function nextFlashcardMastery(
  current: FlashcardMastery,
  verdict: FlashcardVerdict,
  questionType: 'choice' | 'written',
): FlashcardMastery {
  if (verdict === 'correct') return questionType === 'written' ? 2 : Math.max(1, current) as FlashcardMastery;
  if (verdict === 'almost') return 1;
  return Math.max(0, current - 1) as FlashcardMastery;
}

export function selectLearnCards(
  cards: readonly VocabularyFlashcard[],
  progress: Record<string, FlashcardProgress | undefined>,
  count: number,
) {
  return [...cards]
    .sort((left, right) => {
      const leftProgress = progress[left.id];
      const rightProgress = progress[right.id];
      const masteryDifference = (leftProgress?.mastery ?? 0) - (rightProgress?.mastery ?? 0);
      if (masteryDifference !== 0) return masteryDifference;
      const errorDifference = (rightProgress?.incorrect ?? 0) - (leftProgress?.incorrect ?? 0);
      if (errorDifference !== 0) return errorDifference;
      return stableHash(left.id) - stableHash(right.id);
    })
    .slice(0, Math.max(1, Math.min(count, cards.length)));
}
