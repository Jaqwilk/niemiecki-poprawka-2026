export const LESSONS = [13, 14, 15, 16, 17, 18] as const;

export type LessonNumber = (typeof LESSONS)[number];
export type StudySkill =
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'speaking'
  | 'communication';
export type QuestionKind =
  | 'choice'
  | 'true-false'
  | 'input'
  | 'order'
  | 'correction'
  | 'dialogue';

export type StudyQuestion = {
  id: string;
  lesson: LessonNumber;
  topic: string;
  skill: StudySkill;
  kind: QuestionKind;
  prompt: string;
  instruction?: string;
  hint?: string;
  audioText?: string;
  options?: string[];
  tokens?: string[];
  acceptedAnswers: string[];
  correctAnswer: string;
  explanation: string;
  source: {
    label: string;
    printedPage?: number;
    type: 'workbook' | 'review' | 'test' | 'teacher';
  };
  difficulty: 1 | 2 | 3;
};

export type Attempt = {
  id: string;
  questionId: string;
  answer: string;
  correct: boolean;
  createdAt: string;
  mode: 'practice' | 'retry' | 'mock';
};

export type MistakeRecord = {
  id: string;
  questionId: string;
  lesson: LessonNumber;
  topic: string;
  skill: StudySkill;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  lastMistakeAt: string;
  mistakeCount: number;
  successfulRetries: number;
  status: 'open' | 'resolved';
};

export type MockAnswer = {
  questionId: string;
  answer: string;
  correct: boolean;
};

export type MockAttempt = {
  id: string;
  createdAt: string;
  score: number;
  maxScore: number;
  answers: MockAnswer[];
};

export type StudyState = {
  version: 1;
  sprintStartedAt: string | null;
  activeDay: 1 | 2 | 3 | 4 | 5;
  lessonProgress: Partial<Record<LessonNumber, number>>;
  attempts: Attempt[];
  mistakes: MistakeRecord[];
  mockAttempts: MockAttempt[];
};

export type SprintDay = {
  day: 1 | 2 | 3 | 4 | 5;
  title: string;
  lessons: LessonNumber[];
  reviewMinutes: number;
  learnMinutes: number;
  practiceMinutes: number;
  focus: string[];
};
