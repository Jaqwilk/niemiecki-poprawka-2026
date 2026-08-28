'use client';

import type { FlashcardProgress } from './flashcard-engine';

export const FLASHCARD_STORAGE_KEY = 'deutsch-a1-2-flashcards-v1';

export type FlashcardStore = {
  version: 1;
  progress: Record<string, FlashcardProgress>;
  bestMatchMs: Record<string, number>;
};

export function createFlashcardStore(): FlashcardStore {
  return { version: 1, progress: {}, bestMatchMs: {} };
}

export function loadFlashcardStore(): FlashcardStore {
  if (typeof window === 'undefined') return createFlashcardStore();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FLASHCARD_STORAGE_KEY) ?? '') as Partial<FlashcardStore>;
    if (parsed.version !== 1) return createFlashcardStore();
    return {
      version: 1,
      progress: parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : {},
      bestMatchMs: parsed.bestMatchMs && typeof parsed.bestMatchMs === 'object' ? parsed.bestMatchMs : {},
    };
  } catch {
    return createFlashcardStore();
  }
}

export function saveFlashcardStore(store: FlashcardStore) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify(store));
}

