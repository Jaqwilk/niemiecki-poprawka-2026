'use client';

import { createInitialState } from './engine';
import type { StudyState } from './types';

export const STUDY_STORAGE_KEY = 'deutsch-a1-2-study-state-v1';

export function loadStudyState(): StudyState {
  if (typeof window === 'undefined') return createInitialState();
  try {
    const raw = window.localStorage.getItem(STUDY_STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<StudyState>;
    if (parsed.version !== 1) return createInitialState();
    return {
      ...createInitialState(),
      ...parsed,
      lessonProgress: parsed.lessonProgress ?? {},
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
      mockAttempts: Array.isArray(parsed.mockAttempts) ? parsed.mockAttempts : [],
    };
  } catch {
    return createInitialState();
  }
}

export function saveStudyState(state: StudyState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('study-state-change', { detail: state }));
}

export function subscribeToStudyState(callback: (state: StudyState) => void) {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<StudyState>;
    callback(customEvent.detail ?? loadStudyState());
  };
  window.addEventListener('study-state-change', listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener('study-state-change', listener);
    window.removeEventListener('storage', listener);
  };
}
