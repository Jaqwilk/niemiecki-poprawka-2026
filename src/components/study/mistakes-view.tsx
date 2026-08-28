'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, RotateCcw } from 'lucide-react';
import { questionsById } from '@/lib/study/questions';
import { StudyPageShell } from './page-shell';
import { QuestionRunner } from './question-runner';
import { useStudyState } from './state-provider';

export function MistakesView() {
  const { state, hydrated } = useStudyState();
  const [practicing, setPracticing] = useState(false);
  const open = state.mistakes
    .filter((mistake) => mistake.status === 'open')
    .sort((a, b) => b.mistakeCount - a.mistakeCount);
  const questions = open
    .map((mistake) => questionsById.get(mistake.questionId))
    .filter((question) => question !== undefined);
  const groups = open.reduce<Record<string, number>>((accumulator, mistake) => {
    const label =
      mistake.skill === 'grammar'
        ? 'Gramatyka'
        : mistake.skill === 'vocabulary'
          ? 'Słownictwo'
          : 'Komunikacja i tekst';
    accumulator[label] = (accumulator[label] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <StudyPageShell
      eyebrow="Poprawa z pamięci"
      title="Moje błędy"
      description="Błąd jest zamknięty dopiero po poprawnej odpowiedzi w ponownej próbie."
    >
      {practicing && questions.length > 0 ? (
        <QuestionRunner questions={questions} mode="retry" />
      ) : open.length > 0 ? (
        <section className="max-w-2xl">
          <p className="text-3xl font-semibold">{open.length}</p>
          <p className="mt-1 text-sm text-fd-muted-foreground">do poprawy</p>

          <dl className="mt-7 grid grid-cols-3 gap-5 border-y border-fd-border py-6">
            {Object.entries(groups).map(([label, count]) => (
              <div key={label}>
                <dt className="text-xs leading-5 text-fd-muted-foreground">{label}</dt>
                <dd className="mt-1 text-lg font-semibold">{count}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => setPracticing(true)}
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Ćwicz błędy
          </button>

          <div className="mt-10">
            <h2 className="text-sm font-semibold">Najwyższy priorytet</h2>
            <ul className="mt-3 divide-y divide-fd-border border-y border-fd-border">
              {open.slice(0, 5).map((mistake) => (
                <li key={mistake.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>
                    <span className="font-medium">L{mistake.lesson} · {mistake.topic}</span>
                    <span className="ml-2 text-fd-muted-foreground">{mistake.mistakeCount}×</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className="max-w-lg py-6">
          <Check className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-semibold">Brak otwartych błędów</h2>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            {hydrated ? 'Każdy zapisany błąd został poprawiony.' : 'Wczytuję zapis nauki…'}
          </p>
          <Link href="/practice" className="mt-6 inline-block text-sm font-medium text-fd-primary hover:underline">
            Zacznij ćwiczenia
          </Link>
        </section>
      )}
    </StudyPageShell>
  );
}
