import { mockQuestionIds } from './mock';
import { studyQuestions } from './questions';
import type { LessonNumber, StudyQuestion } from './types';

// Te pytania nie mają tych samych identyfikatorów co test, ale sprawdzają dokładnie
// te same pary słownictwa z tabeli A–L. Zostają wyłącznie w arkuszu testowym.
export const examEquivalentQuestionIds = [
  'l13-sehenswuerdigkeit',
  'l14-location-vocab',
  'l15-bedroom',
  'l16-printer',
  'l17-profession',
  'l18-headache',
] as const;

const reservedForExam = new Set<string>([
  ...mockQuestionIds,
  ...examEquivalentQuestionIds,
]);

export const practiceQuestions: StudyQuestion[] = studyQuestions.filter(
  (question) => !reservedForExam.has(question.id),
);

export const practiceQuestionIds = practiceQuestions.map((question) => question.id);

export function getPracticeQuestionsForLesson(lesson: LessonNumber) {
  return practiceQuestions.filter((question) => question.lesson === lesson);
}

export const practiceFormats = [
  'Lückensätze',
  'Satzbau',
  'Richtig / Falsch',
  'Dialoge',
  'Hörverstehen',
  'Übersetzung',
] as const;
