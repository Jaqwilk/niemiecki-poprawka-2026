import type { MistakeRecord, StudyQuestion, StudyState } from './types';

const STORAGE_LIMIT = 600;

export function normalizeAnswer(value: string) {
  return value
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[.,!?;:„“”‚‘’'"()[\]{}]/g, ' ')
    .replace(/[–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCorrectAnswer(question: StudyQuestion, answer: string) {
  const normalized = normalizeAnswer(answer);
  return question.acceptedAnswers.some((candidate) => {
    const variants = [candidate, ...candidate.split(/\s+\/\s+/).filter(Boolean)];
    return variants.some((variant) => normalizeAnswer(variant) === normalized);
  });
}

export function createInitialState(): StudyState {
  return {
    version: 1,
    sprintStartedAt: null,
    activeDay: 1,
    lessonProgress: {},
    attempts: [],
    mistakes: [],
    mockAttempts: [],
    practiceSessions: [],
  };
}

export function recordMistake(
  state: StudyState,
  question: StudyQuestion,
  answer: string,
  createdAt = new Date().toISOString(),
): StudyState {
  const existing = state.mistakes.find((item) => item.questionId === question.id);
  const mistake: MistakeRecord = existing
    ? {
        ...existing,
        userAnswer: answer || '—',
        lastMistakeAt: createdAt,
        mistakeCount: existing.mistakeCount + 1,
        status: 'open',
      }
    : {
        id: `mistake-${question.id}`,
        questionId: question.id,
        lesson: question.lesson,
        topic: question.topic,
        skill: question.skill,
        question: question.prompt,
        userAnswer: answer || '—',
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        lastMistakeAt: createdAt,
        mistakeCount: 1,
        successfulRetries: 0,
        status: 'open',
      };

  return {
    ...state,
    mistakes: [mistake, ...state.mistakes.filter((item) => item.questionId !== question.id)].slice(
      0,
      STORAGE_LIMIT,
    ),
  };
}

export function resolveMistake(state: StudyState, questionId: string): StudyState {
  return {
    ...state,
    mistakes: state.mistakes.map((item) =>
      item.questionId === questionId
        ? {
            ...item,
            successfulRetries: item.successfulRetries + 1,
            status: 'resolved',
          }
        : item,
    ),
  };
}

export function getTopicPerformance(state: StudyState) {
  const performance = new Map<string, { correct: number; total: number }>();
  for (const attempt of state.attempts) {
    const questionTopic = state.mistakes.find((mistake) => mistake.questionId === attempt.questionId)?.topic;
    if (!questionTopic) continue;
    const current = performance.get(questionTopic) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (attempt.correct) current.correct += 1;
    performance.set(questionTopic, current);
  }
  return performance;
}

export function selectRecommendedQuestions(
  questions: StudyQuestion[],
  state: StudyState,
  count = 12,
) {
  const recentIds = new Set(state.attempts.slice(0, 4).map((attempt) => attempt.questionId));
  const openMistakes = new Map(
    state.mistakes
      .filter((mistake) => mistake.status === 'open')
      .map((mistake) => [mistake.questionId, mistake.mistakeCount]),
  );
  const todayLessons = new Set(
    state.activeDay === 1
      ? [13, 14]
      : state.activeDay === 2
        ? [15, 16]
        : state.activeDay === 3
          ? [17, 18]
          : [13, 14, 15, 16, 17, 18],
  );
  const attemptCounts = new Map<string, number>();
  for (const attempt of state.attempts) {
    attemptCounts.set(attempt.questionId, (attemptCounts.get(attempt.questionId) ?? 0) + 1);
  }

  return [...questions]
    .map((question, index) => {
      const mistakePriority = (openMistakes.get(question.id) ?? 0) * 100;
      const todayPriority = todayLessons.has(question.lesson) ? 30 : 10;
      const noveltyPriority = Math.max(0, 12 - (attemptCounts.get(question.id) ?? 0) * 4);
      const recentPenalty = recentIds.has(question.id) ? 60 : 0;
      const stableJitter = ((question.id.length * 17 + index * 13) % 11) / 10;
      return {
        question,
        score: mistakePriority + todayPriority + noveltyPriority - recentPenalty + stableJitter,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((item) => item.question);
}

export function appendAttempt(state: StudyState, attempt: StudyState['attempts'][number]) {
  return { ...state, attempts: [attempt, ...state.attempts].slice(0, STORAGE_LIMIT) };
}
