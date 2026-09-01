import type { AnswerEvaluation, StudyQuestion } from '@/lib/study/types';

export type AnswerEvaluationItem = {
  id: string;
  lesson: number;
  kind: string;
  skill: string;
  topic: string;
  prompt: string;
  instruction: string;
  acceptedAnswers: string[];
  expected: string;
  explanation: string;
  answer: string;
  rubric?: string[];
};

export type AnswerEvaluationResponse = {
  evaluations: Array<AnswerEvaluation & { id: string }>;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function questionToEvaluationItem(
  question: StudyQuestion,
  answer: string,
  instruction: string,
): AnswerEvaluationItem {
  return {
    id: question.id,
    lesson: question.lesson,
    kind: question.kind,
    skill: question.skill,
    topic: question.topic,
    prompt: question.prompt,
    instruction,
    acceptedAnswers: question.acceptedAnswers.slice(0, 12),
    expected: question.correctAnswer,
    explanation: question.explanation,
    answer,
  };
}

export function sanitizeAnswerEvaluationItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 24).map((raw) => {
    const item = raw && typeof raw === 'object' ? raw as Partial<AnswerEvaluationItem> : {};
    const lesson = Number(item.lesson);
    return {
      id: clean(item.id, 120),
      lesson: Number.isInteger(lesson) && lesson >= 13 && lesson <= 18 ? lesson : null,
      kind: clean(item.kind, 40),
      skill: clean(item.skill, 40),
      topic: clean(item.topic, 160),
      prompt: clean(item.prompt, 1_200),
      instruction: clean(item.instruction, 600),
      acceptedAnswers: Array.isArray(item.acceptedAnswers)
        ? item.acceptedAnswers.slice(0, 12).map((answer) => clean(answer, 500)).filter(Boolean)
        : [],
      expected: clean(item.expected, 1_200),
      explanation: clean(item.explanation, 1_200),
      answer: clean(item.answer, 2_000),
      rubric: Array.isArray(item.rubric)
        ? item.rubric.slice(0, 8).map((criterion) => clean(criterion, 300)).filter(Boolean)
        : [],
    };
  }).filter((item) =>
    item.id && item.lesson && item.prompt && item.expected && item.answer,
  );
}

export function isAnswerEvaluation(value: unknown): value is AnswerEvaluation & { id: string } {
  if (!value || typeof value !== 'object') return false;
  const evaluation = value as Partial<AnswerEvaluation & { id: string }>;
  return typeof evaluation.id === 'string'
    && (evaluation.verdict === 'correct' || evaluation.verdict === 'almost' || evaluation.verdict === 'incorrect')
    && ['none', 'equivalent', 'spelling', 'grammar', 'word_order', 'missing_part', 'different_meaning'].includes(evaluation.issue ?? '')
    && typeof evaluation.feedback === 'string'
    && typeof evaluation.correction === 'string';
}

export async function evaluateAnswersWithAi(
  items: AnswerEvaluationItem[],
  signal?: AbortSignal,
): Promise<AnswerEvaluationResponse> {
  const response = await fetch('/api/answers/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
    signal,
  });
  const payload = await response.json() as Partial<AnswerEvaluationResponse> & { error?: string };
  if (!response.ok) throw new Error(payload.error || 'AI nie mogło sprawdzić odpowiedzi.');
  if (!Array.isArray(payload.evaluations) || !payload.evaluations.every(isAnswerEvaluation)) {
    throw new Error('AI zwróciło nieprawidłową ocenę.');
  }
  return { evaluations: payload.evaluations };
}

export function localIncorrectEvaluation(expected: string, explanation: string): AnswerEvaluation {
  return {
    verdict: 'incorrect',
    issue: 'different_meaning',
    feedback: explanation,
    correction: expected,
    source: 'local',
  };
}
