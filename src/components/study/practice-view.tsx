'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Play, Sparkles } from 'lucide-react';
import { Callout } from 'fumadocs-ui/components/callout';
import { selectRecommendedQuestions } from '@/lib/study/engine';
import { studyQuestions } from '@/lib/study/questions';
import { sprintDays } from '@/lib/study/schedule';
import { LESSONS, type LessonNumber, type StudyQuestion } from '@/lib/study/types';
import { cn } from '@/lib/cn';
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
  const openMistakes = state.mistakes.filter((mistake) => mistake.status === 'open');
  const activeDay = sprintDays[state.activeDay - 1];

  const previewCount = useMemo(() => {
    if (scope === 'recommended' || scope === 'mixed') return 12;
    return studyQuestions.filter((question) => question.lesson === Number(scope)).length;
  }, [scope]);

  const previewDescription =
    scope === 'recommended'
      ? 'Kolejność dopasowuje się do zapisanych pomyłek, bieżącego dnia planu i ostatnich odpowiedzi.'
      : scope === 'mixed'
        ? 'Równy trening ze wszystkich sześciu lekcji — dobry przed próbą generalną.'
        : `Pełny zestaw pytań tylko z Lektion ${scope}.`;

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
        <QuestionRunner
          questions={session}
          onLeave={() => setSession(null)}
          leaveLabel="Nowa seria"
        />
      ) : (
        <section className="max-w-2xl">
          <fieldset>
            <legend className="text-sm font-semibold">Tryb serii</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Tryb serii">
              {[
                ['recommended', 'Polecane teraz', 'Błędy i bieżący materiał'],
                ['mixed', 'Mieszane 13–18', 'Pełny przekrój przed testem'],
              ].map(([value, title, detail]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={scope === value}
                  onClick={() => setScope(value)}
                  className={cn(
                    'rounded-xl border border-fd-border bg-fd-card p-4 text-left transition-colors hover:bg-fd-accent/70',
                    scope === value && 'border-fd-primary ring-1 ring-fd-primary/25',
                  )}
                >
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="mt-1 block text-xs leading-5 text-fd-muted-foreground">{detail}</span>
                </button>
              ))}
            </div>

            <p className="mt-6 text-sm font-semibold">Albo jedna lekcja</p>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Wybierz jedną lekcję">
              {LESSONS.map((lesson) => (
                <button
                  key={lesson}
                  type="button"
                  role="radio"
                  aria-checked={scope === String(lesson)}
                  onClick={() => setScope(String(lesson))}
                  className="min-h-10 rounded-md border border-fd-border px-3 text-sm font-medium hover:bg-fd-muted aria-checked:border-fd-primary aria-checked:bg-fd-primary aria-checked:text-fd-primary-foreground"
                >
                  L{lesson}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-9 border-y border-fd-border py-6">
            <p className="text-xs font-semibold tracking-[0.14em] text-fd-muted-foreground uppercase">
              {scope === 'recommended' ? 'Rekomendowana praktyka' : 'Wybrana seria'}
            </p>
            <p className="mt-2 text-2xl font-semibold">{previewCount} pytań</p>
            <p className="mt-1 text-sm text-fd-muted-foreground">około {Math.max(6, Math.round(previewCount * 0.7))} min</p>
            <p className="mt-4 max-w-lg text-sm leading-6 text-fd-muted-foreground">{previewDescription}</p>
          </div>

          {scope === 'recommended' ? (
            <Callout
              type="idea"
              title="Dlaczego taki zestaw?"
              className="mt-6"
              icon={<Sparkles className="size-5 text-fd-primary" aria-hidden="true" />}
            >
              {hydrated ? (
                <p>
                  {openMistakes.length > 0
                    ? `${openMistakes.length} otwartych ${openMistakes.length === 1 ? 'błąd ma' : 'błędów ma'} pierwszeństwo.`
                    : 'Nie ma teraz otwartych błędów.'}{' '}
                  Następne są Lektion {activeDay.lessons.join(' i ')} oraz krótka powtórka starszego materiału.
                </p>
              ) : (
                <p>Wczytuję historię nauki…</p>
              )}
            </Callout>
          ) : null}

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
