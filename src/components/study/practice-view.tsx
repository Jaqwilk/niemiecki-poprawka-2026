'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play } from 'lucide-react';
import { selectRecommendedQuestions } from '@/lib/study/engine';
import { studyQuestions } from '@/lib/study/questions';
import { LESSONS, type LessonNumber, type StudyQuestion } from '@/lib/study/types';
import { StudyPageShell } from './page-shell';
import { QuestionRunner } from './question-runner';
import { useStudyState } from './state-provider';

export function PracticeView() {
  const searchParams = useSearchParams();
  const requestedLesson = Number(searchParams.get('lesson'));
  const initialScope = LESSONS.includes(requestedLesson as LessonNumber)
    ? String(requestedLesson)
    : 'recommended';
  const { state, hydrated } = useStudyState();
  const [scope, setScope] = useState(initialScope);
  const [session, setSession] = useState<StudyQuestion[] | null>(null);

  const previewCount = useMemo(() => {
    if (scope === 'recommended' || scope === 'mixed') return 12;
    return studyQuestions.filter((question) => question.lesson === Number(scope)).length;
  }, [scope]);

  function start() {
    if (scope === 'recommended') {
      setSession(selectRecommendedQuestions(studyQuestions, state, 12));
      return;
    }
    if (scope === 'mixed') {
      setSession(selectRecommendedQuestions(studyQuestions, { ...state, activeDay: 4 }, 12));
      return;
    }
    setSession(studyQuestions.filter((question) => question.lesson === Number(scope)));
  }

  return (
    <StudyPageShell
      eyebrow="Aktywne przypominanie"
      title="Ćwiczenia"
      description="Jedna mieszana seria. Zła odpowiedź nie znika, dopóki nie odtworzysz jej poprawnie."
    >
      {session ? (
        <QuestionRunner questions={session} />
      ) : (
        <section className="max-w-2xl">
          <label htmlFor="practice-scope" className="text-sm font-medium">Zakres</label>
          <select
            id="practice-scope"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-fd-border bg-fd-background px-3 text-sm outline-none focus:border-fd-primary sm:max-w-xs"
          >
            <option value="recommended">Polecane teraz</option>
            <option value="mixed">Mieszane 13–18</option>
            {LESSONS.map((lesson) => <option key={lesson} value={lesson}>Tylko Lektion {lesson}</option>)}
          </select>

          <div className="mt-9 border-y border-fd-border py-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-fd-muted-foreground uppercase">
              {scope === 'recommended' ? 'Rekomendowana praktyka' : 'Wybrana seria'}
            </p>
            <p className="mt-2 text-2xl font-semibold">{previewCount} pytań</p>
            <p className="mt-1 text-sm text-fd-muted-foreground">około {Math.max(6, Math.round(previewCount * 0.7))} min</p>
            {scope === 'recommended' ? (
              <p className="mt-4 max-w-lg text-sm leading-6 text-fd-muted-foreground">
                Najpierw otwarte błędy, potem materiał bieżącego dnia i krótka powtórka starszych lekcji.
              </p>
            ) : null}
          </div>

          <button
            type="button"
            disabled={!hydrated}
            onClick={start}
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground disabled:opacity-45"
          >
            <Play className="size-4" aria-hidden="true" /> Zacznij
          </button>
        </section>
      )}
    </StudyPageShell>
  );
}
