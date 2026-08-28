'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  appendAttempt,
  createInitialState,
  isCorrectAnswer,
  recordMistake,
  resolveMistake,
} from '@/lib/study/engine';
import { loadStudyState, saveStudyState, subscribeToStudyState } from '@/lib/study/storage';
import type { LessonNumber, MockAttempt, StudyQuestion, StudyState } from '@/lib/study/types';

type AnswerMode = 'practice' | 'retry' | 'mock';

type StudyContextValue = {
  state: StudyState;
  hydrated: boolean;
  setActiveDay: (day: StudyState['activeDay']) => void;
  startSprint: () => void;
  setLessonProgress: (lesson: LessonNumber, progress: number) => void;
  recordAnswer: (question: StudyQuestion, answer: string, mode?: AnswerMode) => boolean;
  saveMockAttempt: (attempt: MockAttempt) => void;
};

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(loadStudyState());
      setHydrated(true);
    }, 0);
    const unsubscribe = subscribeToStudyState(setState);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const update = useCallback((updater: (current: StudyState) => StudyState) => {
    setState((current) => {
      const next = updater(current);
      saveStudyState(next);
      return next;
    });
  }, []);

  const setActiveDay = useCallback(
    (day: StudyState['activeDay']) => update((current) => ({ ...current, activeDay: day })),
    [update],
  );

  const startSprint = useCallback(
    () =>
      update((current) => ({
        ...current,
        sprintStartedAt: current.sprintStartedAt ?? new Date().toISOString(),
      })),
    [update],
  );

  const setLessonProgress = useCallback(
    (lesson: LessonNumber, progress: number) =>
      update((current) => ({
        ...current,
        lessonProgress: {
          ...current.lessonProgress,
          [lesson]: Math.max(0, Math.min(100, Math.round(progress))),
        },
      })),
    [update],
  );

  const recordAnswer = useCallback(
    (question: StudyQuestion, answer: string, mode: AnswerMode = 'practice') => {
      const correct = isCorrectAnswer(question, answer);
      const createdAt = new Date().toISOString();
      update((current) => {
        let next = appendAttempt(current, {
          id: `${createdAt}-${question.id}-${Math.random().toString(36).slice(2, 8)}`,
          questionId: question.id,
          answer,
          correct,
          createdAt,
          mode,
        });
        if (!correct) next = recordMistake(next, question, answer, createdAt);
        if (correct && mode === 'retry') next = resolveMistake(next, question.id);
        return next;
      });
      return correct;
    },
    [update],
  );

  const saveMockAttempt = useCallback(
    (attempt: MockAttempt) =>
      update((current) => ({
        ...current,
        mockAttempts: [attempt, ...current.mockAttempts].slice(0, 20),
      })),
    [update],
  );

  const value = useMemo(
    () => ({
      state,
      hydrated,
      setActiveDay,
      startSprint,
      setLessonProgress,
      recordAnswer,
      saveMockAttempt,
    }),
    [
      hydrated,
      recordAnswer,
      saveMockAttempt,
      setActiveDay,
      setLessonProgress,
      startSprint,
      state,
    ],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudyState() {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudyState must be used inside StudyStateProvider');
  return context;
}
