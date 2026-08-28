export type TutorHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function cleanTutorText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function inferTutorLesson(question: string, contextLesson: unknown) {
  const value = Number(contextLesson);
  if (Number.isInteger(value) && value >= 13 && value <= 18) return value;

  const match = question.match(/\b(?:(?:lektion|lekcj[aię]|l)\s*)?(1[3-8])\b/i);
  return match ? Number(match[1]) : null;
}

export function sanitizeTutorHistory(value: unknown): TutorHistoryMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-8)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const candidate = item as { role?: unknown; text?: unknown };
      const role = candidate.role === 'assistant' ? 'assistant' : 'user';
      const content = cleanTutorText(candidate.text, 1200);
      return content ? { role, content } : null;
    })
    .filter((item): item is TutorHistoryMessage => item !== null);
}
