'use client';

import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';
import type { LessonNumber } from '@/lib/study/types';
import { useStudyState } from './state-provider';

export function LessonComplete({ lesson, next }: { lesson: LessonNumber; next?: LessonNumber }) {
  const { state, setLessonProgress } = useStudyState();
  const complete = (state.lessonProgress[lesson] ?? 0) >= 100;

  return (
    <div className="not-prose my-10 flex flex-wrap items-center justify-between gap-4 border-y border-fd-border py-5">
      <div>
        <p className="text-sm font-semibold">Lektion {lesson}</p>
        <p className="mt-1 text-xs text-fd-muted-foreground">
          {complete
            ? 'Ukończona. Jeśli materiał nie jest pewny, wróć do powtórki.'
            : 'Zaznacz dopiero po wykonaniu pytań „Sprawdź się”.'}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setLessonProgress(lesson, complete ? 70 : 100)}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-fd-border px-3 text-sm font-medium hover:bg-fd-muted"
        >
          {complete ? <RotateCcw className="size-4" aria-hidden="true" /> : null}
          {complete ? 'Wróć do powtórki' : 'Oznacz jako gotowe'}
        </button>
        <Link
          href={next ? `/docs/lessons/${next}` : '/practice'}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-fd-primary px-3 text-sm font-medium text-fd-primary-foreground"
        >
          {next ? `Lektion ${next}` : 'Ćwiczenia'} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
