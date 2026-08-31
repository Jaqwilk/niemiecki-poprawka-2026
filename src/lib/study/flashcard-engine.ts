import type { VocabularyFlashcard } from './flashcards';

export type FlashcardDirection = 'de-pl' | 'pl-de';
export type FlashcardVerdict = 'correct' | 'almost' | 'incorrect';
export type FlashcardMastery = 0 | 1 | 2;
export type FlashcardLearnPhase = 'choice' | 'written';

export const FLASHCARD_LEARN_BATCH_SIZE = 10;

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

export function flashcardAnswerVariants(value: string, german: boolean) {
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
  return flashcardAnswerVariants(expectedFlashcardAnswer(card, direction), direction === 'pl-de').includes(normalized);
}

export type LocalFlashcardEvaluation = {
  verdict: FlashcardVerdict;
  feedback: string;
};

const GERMAN_ARTICLES = new Set([
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einen',
  'einem',
  'einer',
  'eines',
]);

function editDistance(left: string, right: string) {
  if (left === right) return 0;
  if (!left) return right.length;
  if (!right) return left.length;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[right.length];
}

function sameWordsExceptGermanArticle(expected: string, submitted: string) {
  const expectedWords = expected.split(' ');
  const submittedWords = submitted.split(' ');
  if (expectedWords.length < 2 || !GERMAN_ARTICLES.has(expectedWords[0])) return false;
  if (submittedWords.join(' ') === expectedWords.slice(1).join(' ')) return true;
  return (
    submittedWords.length === expectedWords.length &&
    GERMAN_ARTICLES.has(submittedWords[0]) &&
    submittedWords[0] !== expectedWords[0] &&
    submittedWords.slice(1).join(' ') === expectedWords.slice(1).join(' ')
  );
}

function isMinorTypo(expected: string, submitted: string) {
  if (expected.split(' ').length !== submitted.split(' ').length) return false;
  const longest = Math.max(expected.length, submitted.length);
  if (longest < 4) return false;
  const allowedDistance = longest >= 10 ? 2 : 1;
  return editDistance(expected, submitted) <= allowedDistance;
}

function isSubstantialPartialAnswer(expected: string, submitted: string) {
  const expectedWords = expected.split(' ');
  const submittedWords = submitted.split(' ');
  if (expectedWords.length < 2 || submittedWords.length >= expectedWords.length) return false;
  if (submitted.length < 3 || submitted.length / expected.length < 0.4) return false;
  let cursor = 0;
  for (const word of expectedWords) {
    if (word === submittedWords[cursor]) cursor += 1;
  }
  return cursor === submittedWords.length;
}

export function evaluateFlashcardAnswerLocally(
  card: VocabularyFlashcard,
  answer: string,
  direction: FlashcardDirection,
  pool: readonly VocabularyFlashcard[],
): LocalFlashcardEvaluation | null {
  const submitted = normalizeFlashcardAnswer(answer);
  if (!submitted) return null;
  const expectedVariants = flashcardAnswerVariants(
    expectedFlashcardAnswer(card, direction),
    direction === 'pl-de',
  );

  if (expectedVariants.includes(submitted)) {
    return { verdict: 'correct', feedback: 'Dokładnie tak — odpowiedź zgadza się z fiszką.' };
  }

  if (direction === 'pl-de' && expectedVariants.some((expected) => sameWordsExceptGermanArticle(expected, submitted))) {
    return {
      verdict: 'almost',
      feedback: 'Znaczenie jest poprawne, ale popraw lub dodaj niemiecki rodzajnik.',
    };
  }

  const matchesAnotherCard = pool.some((candidate) => {
    if (candidate.id === card.id) return false;
    return flashcardAnswerVariants(
      expectedFlashcardAnswer(candidate, direction),
      direction === 'pl-de',
    ).includes(submitted);
  });
  if (matchesAnotherCard) {
    return {
      verdict: 'incorrect',
      feedback: 'To poprawne słówko, ale oznacza coś innego. Sprawdź właściwą parę poniżej.',
    };
  }

  if (expectedVariants.some((expected) => isMinorTypo(expected, submitted))) {
    return {
      verdict: 'correct',
      feedback: 'Dobrze — to tylko drobna literówka, znaczenie i forma są czytelne.',
    };
  }

  if (expectedVariants.some((expected) => isSubstantialPartialAnswer(expected, submitted))) {
    return {
      verdict: 'almost',
      feedback: 'Kierunek jest dobry, ale brakuje części wymaganej odpowiedzi.',
    };
  }

  return null;
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

export type FlashcardLearnStep = {
  batchIndex: number;
  phase: FlashcardLearnPhase;
  queue: string[];
};

export function flashcardLearnBatch(
  sessionCardIds: readonly string[],
  batchIndex: number,
  batchSize = FLASHCARD_LEARN_BATCH_SIZE,
) {
  const start = batchIndex * batchSize;
  return sessionCardIds.slice(start, start + batchSize);
}

export function advanceFlashcardLearnStep(
  sessionCardIds: readonly string[],
  step: FlashcardLearnStep,
  mastery: Record<string, FlashcardMastery>,
  batchSize = FLASHCARD_LEARN_BATCH_SIZE,
): FlashcardLearnStep {
  const remainingQueue = step.queue.slice(1);
  if (remainingQueue.length > 0) return { ...step, queue: remainingQueue };

  const currentBatch = flashcardLearnBatch(sessionCardIds, step.batchIndex, batchSize);
  const requiredMastery = step.phase === 'choice' ? 1 : 2;
  const pending = currentBatch.filter((cardId) => (mastery[cardId] ?? 0) < requiredMastery);
  if (pending.length > 0) return { ...step, queue: pending };

  if (step.phase === 'choice') {
    return { batchIndex: step.batchIndex, phase: 'written', queue: [...currentBatch] };
  }

  const nextBatchIndex = step.batchIndex + 1;
  const nextBatch = flashcardLearnBatch(sessionCardIds, nextBatchIndex, batchSize);
  return {
    batchIndex: nextBatchIndex,
    phase: 'choice',
    queue: [...nextBatch],
  };
}
