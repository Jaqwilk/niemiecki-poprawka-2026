'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, RotateCcw } from 'lucide-react';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { questionsById } from '@/lib/study/questions';
import type { MistakeRecord, StudyQuestion, StudySkill } from '@/lib/study/types';
import { StudyPageShell } from './page-shell';
import { QuestionRunner } from './question-runner';
import { useStudyState } from './state-provider';

const skillGroups: { label: string; skills: StudySkill[] }[] = [
  { label: 'Gramatyka', skills: ['grammar'] },
  { label: 'Słownictwo', skills: ['vocabulary'] },
  { label: 'Komunikacja i tekst', skills: ['communication', 'reading', 'writing', 'speaking'] },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function MistakeDetails({ mistake }: { mistake: MistakeRecord }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="font-medium leading-6">{mistake.question}</p>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-fd-muted-foreground">Ostatnia odpowiedź</dt>
          <dd className="mt-1 leading-6">{mistake.userAnswer}</dd>
        </div>
        <div>
          <dt className="text-xs text-fd-muted-foreground">Poprawnie</dt>
          <dd className="mt-1 font-medium leading-6">{mistake.correctAnswer}</dd>
        </div>
      </dl>
      <p className="leading-6 text-fd-muted-foreground">{mistake.explanation}</p>
      <Link
        href={`/docs/lessons/${mistake.lesson}`}
        className="inline-block text-sm font-medium text-fd-primary hover:underline"
      >
        Otwórz Lektion {mistake.lesson}
      </Link>
    </div>
  );
}

export function MistakesView() {
  const { state, hydrated } = useStudyState();
  const [practiceQuestions, setPracticeQuestions] = useState<StudyQuestion[] | null>(null);
  const open = state.mistakes
    .filter((mistake) => mistake.status === 'open')
    .sort((a, b) => b.mistakeCount - a.mistakeCount);
  const resolved = state.mistakes
    .filter((mistake) => mistake.status === 'resolved')
    .sort((a, b) => b.lastMistakeAt.localeCompare(a.lastMistakeAt));

  function startPractice() {
    const snapshot = open
      .map((mistake) => questionsById.get(mistake.questionId))
      .filter((question) => question !== undefined) as StudyQuestion[];
    setPracticeQuestions(snapshot);
  }

  return (
    <StudyPageShell
      title="Moje błędy"
      description="Błąd jest zamknięty dopiero po poprawnej odpowiedzi w ponownej próbie."
    >
      {practiceQuestions ? (
        <QuestionRunner
          questions={practiceQuestions}
          mode="retry"
          onLeave={() => setPracticeQuestions(null)}
          leaveLabel="Wróć do błędów"
        />
      ) : !hydrated ? (
        <p className="py-6 text-sm text-fd-muted-foreground">Wczytuję historię nauki…</p>
      ) : state.mistakes.length === 0 ? (
        <section className="max-w-lg py-6">
          <Check className="size-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-semibold">Brak zapisanych błędów</h2>
          <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
            Pierwsza pomyłka z ćwiczeń lub próby generalnej pojawi się tutaj automatycznie.
          </p>
          <Link href="/practice" className="mt-6 inline-block text-sm font-medium text-fd-primary hover:underline">
            Zacznij ćwiczenia
          </Link>
        </section>
      ) : (
        <section className="max-w-3xl">
          <dl className="grid grid-cols-2 gap-5 border-y border-fd-border py-6 sm:max-w-md">
            <div>
              <dt className="text-xs text-fd-muted-foreground">Do poprawy</dt>
              <dd className="mt-1 text-2xl font-semibold">{open.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-fd-muted-foreground">Opanowane</dt>
              <dd className="mt-1 text-2xl font-semibold">{resolved.length}</dd>
            </div>
          </dl>

          <Tabs items={['Do poprawy', 'Opanowane']} className="mt-8">
            <Tab value="Do poprawy">
              {open.length > 0 ? (
                <div className="pt-3">
                  <dl className="grid grid-cols-3 gap-4 border-b border-fd-border pb-6">
                    {skillGroups.map((group) => (
                      <div key={group.label}>
                        <dt className="text-xs leading-5 text-fd-muted-foreground">{group.label}</dt>
                        <dd className="mt-1 text-lg font-semibold">
                          {open.filter((mistake) => group.skills.includes(mistake.skill)).length}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    onClick={startPractice}
                    className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" /> Ćwicz wszystkie ({open.length})
                  </button>

                  <h2 className="mt-10 text-sm font-semibold">Kolejka według priorytetu</h2>
                  <Accordions className="mt-3">
                    {open.map((mistake) => (
                      <Accordion
                        key={mistake.id}
                        value={mistake.id}
                        title={
                          <span className="flex w-full items-center justify-between gap-3 pr-2 text-left">
                            <span>L{mistake.lesson} · {mistake.topic}</span>
                            <span className="shrink-0 text-xs font-normal text-fd-muted-foreground">
                              {mistake.mistakeCount}×
                            </span>
                          </span>
                        }
                      >
                        <MistakeDetails mistake={mistake} />
                      </Accordion>
                    ))}
                  </Accordions>
                </div>
              ) : (
                <div className="py-8">
                  <p className="text-sm font-medium">Wszystkie zapisane błędy są poprawione.</p>
                  <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
                    Historia pozostaje w zakładce „Opanowane”, żeby było widać realny postęp.
                  </p>
                </div>
              )}
            </Tab>

            <Tab value="Opanowane">
              {resolved.length > 0 ? (
                <div className="pt-3">
                  <p className="mb-5 text-sm leading-6 text-fd-muted-foreground">
                    Te błędy zostały zamknięte poprawną odpowiedzią z pamięci.
                  </p>
                  <Accordions>
                    {resolved.map((mistake) => (
                      <Accordion
                        key={mistake.id}
                        value={`resolved-${mistake.id}`}
                        title={
                          <span className="flex w-full items-center justify-between gap-3 pr-2 text-left">
                            <span>L{mistake.lesson} · {mistake.topic}</span>
                            <span className="shrink-0 text-xs font-normal text-fd-muted-foreground">
                              {formatDate(mistake.lastMistakeAt)}
                            </span>
                          </span>
                        }
                      >
                        <MistakeDetails mistake={mistake} />
                      </Accordion>
                    ))}
                  </Accordions>
                </div>
              ) : (
                <p className="py-8 text-sm text-fd-muted-foreground">
                  Po pierwszej udanej poprawie zobaczysz tutaj historię opanowanych błędów.
                </p>
              )}
            </Tab>
          </Tabs>
        </section>
      )}
    </StudyPageShell>
  );
}
