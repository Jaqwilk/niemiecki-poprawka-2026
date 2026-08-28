'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { isCorrectAnswer } from '@/lib/study/engine';
import { mockQuestions, openMockTasks } from '@/lib/study/mock';
import type { MockAttempt } from '@/lib/study/types';
import { StudyPageShell } from './page-shell';
import { useStudyState } from './state-provider';

const DRAFT_KEY = 'deutsch-a1-2-mock-draft-v1';

type MockDraft = {
  index: number;
  answers: Record<string, string>;
  openAnswers: Record<string, string>;
};

const emptyDraft: MockDraft = { index: 0, answers: {}, openAnswers: {} };

export function MockTest() {
  const { hydrated, recordAnswer, saveMockAttempt } = useStudyState();
  const [started, setStarted] = useState(false);
  const [draft, setDraft] = useState<MockDraft>(emptyDraft);
  const [result, setResult] = useState<MockAttempt | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as MockDraft;
        timer = window.setTimeout(() => {
          setDraft({ ...emptyDraft, ...saved });
          setStarted(true);
        }, 0);
      }
    } catch {
      // A broken draft should never block the test.
    }
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!started) return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft, started]);

  const lessonScores = useMemo(() => {
    if (!result) return [];
    const grouped = new Map<number, { correct: number; total: number }>();
    for (const item of result.answers) {
      const question = mockQuestions.find((candidate) => candidate.id === item.questionId);
      if (!question) continue;
      const group = grouped.get(question.lesson) ?? { correct: 0, total: 0 };
      group.total += 1;
      if (item.correct) group.correct += 1;
      grouped.set(question.lesson, group);
    }
    return [...grouped.entries()].map(([lesson, score]) => ({ lesson, ...score }));
  }, [result]);

  function updateAnswer(questionId: string, answer: string) {
    setDraft((current) => ({
      ...current,
      answers: { ...current.answers, [questionId]: answer },
    }));
  }

  function submitMock() {
    const createdAt = new Date().toISOString();
    const answers = mockQuestions.map((question) => {
      const answer = draft.answers[question.id] ?? '';
      const correct = isCorrectAnswer(question, answer);
      recordAnswer(question, answer, 'mock');
      return { questionId: question.id, answer, correct };
    });
    const attempt: MockAttempt = {
      id: `mock-${createdAt}`,
      createdAt,
      score: answers.filter((answer) => answer.correct).length,
      maxScore: answers.length,
      answers,
    };
    saveMockAttempt(attempt);
    setResult(attempt);
    window.localStorage.removeItem(DRAFT_KEY);
  }

  if (result) {
    const incorrect = result.answers.filter((answer) => !answer.correct);
    const strong = lessonScores.filter((score) => score.correct / score.total >= 0.75);
    const weak = lessonScores.filter((score) => score.correct / score.total < 0.75);
    return (
      <StudyPageShell eyebrow="Wynik próby" title={`${result.score} / ${result.maxScore}`} description="Teraz feedback jest już widoczny. Każdy błąd został dopisany do obowiązkowej poprawy.">
        <section className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold">Mocne lekcje</h2>
            <p className="mt-3 text-sm leading-6 text-fd-muted-foreground">
              {strong.length ? strong.map((score) => `Lektion ${score.lesson}`).join(', ') : 'Jeszcze brak wyraźnie mocnego obszaru.'}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Do poprawy</h2>
            <p className="mt-3 text-sm leading-6 text-fd-muted-foreground">
              {weak.length ? weak.map((score) => `Lektion ${score.lesson}`).join(', ') : 'Wszystkie lekcje przekroczyły 75%.'}
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 border-y border-fd-border py-6">
          <Link href="/mistakes" className="rounded-md bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground">
            Ćwicz błędy ({incorrect.length})
          </Link>
          <button
            type="button"
            onClick={() => {
              setDraft(emptyDraft);
              setResult(null);
              setStarted(false);
            }}
            className="rounded-md border border-fd-border px-4 py-2.5 text-sm font-medium hover:bg-fd-muted"
          >
            Nowa próba
          </button>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Błędy</h2>
          {incorrect.length ? (
            <ul className="mt-4 divide-y divide-fd-border border-y border-fd-border">
              {incorrect.map((item) => {
                const question = mockQuestions.find((candidate) => candidate.id === item.questionId);
                if (!question) return null;
                return (
                  <li key={item.questionId} className="py-5 text-sm">
                    <p className="font-medium leading-6">{question.prompt}</p>
                    <p className="mt-2 text-fd-muted-foreground">Twoja: {item.answer || '—'}</p>
                    <p className="mt-1">Poprawnie: {question.correctAnswer}</p>
                    <p className="mt-2 leading-6 text-fd-muted-foreground">{question.explanation}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <Check className="size-4" aria-hidden="true" /> Wszystkie zadania zamknięte poprawne.
            </p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Samoocena zadań otwartych</h2>
          <div className="mt-4 space-y-8">
            {openMockTasks.map((task) => (
              <article key={task.id} className="border-l-2 border-fd-border pl-5">
                <h3 className="text-sm font-semibold">{task.label}</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{draft.openAnswers[task.id] || 'Brak odpowiedzi.'}</p>
                <ul className="mt-4 list-inside list-disc text-sm leading-6 text-fd-muted-foreground">
                  {task.checklist.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer font-medium">Pokaż model odpowiedzi</summary>
                  <p className="mt-3 leading-6 text-fd-muted-foreground">{task.model}</p>
                </details>
              </article>
            ))}
          </div>
        </section>
      </StudyPageShell>
    );
  }

  if (!started) {
    return (
      <StudyPageShell eyebrow="Dzień 5" title="Próba generalna" description="Formaty pochodzą z oficjalnych stron TEST i Prüfungstraining dla modułów 5 i 6.">
        <section className="max-w-2xl">
          <dl className="grid grid-cols-3 gap-5 border-y border-fd-border py-6 text-sm">
            <div><dt className="text-fd-muted-foreground">Zadania</dt><dd className="mt-1 text-lg font-semibold">20 + 2</dd></div>
            <div><dt className="text-fd-muted-foreground">Czas</dt><dd className="mt-1 text-lg font-semibold">~35 min</dd></div>
            <div><dt className="text-fd-muted-foreground">Zakres</dt><dd className="mt-1 text-lg font-semibold">13–18</dd></div>
          </dl>
          <ul className="mt-7 space-y-2 text-sm leading-6 text-fd-muted-foreground">
            <li>Brak podpowiedzi i natychmiastowego feedbacku.</li>
            <li>Możesz wracać do wcześniejszych odpowiedzi.</li>
            <li>Szkic zapisuje się lokalnie po każdej zmianie.</li>
            <li>Wynik i wyjaśnienia pojawią się dopiero po oddaniu.</li>
          </ul>
          <button
            type="button"
            disabled={!hydrated}
            onClick={() => setStarted(true)}
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground disabled:opacity-45"
          >
            <ClipboardCheck className="size-4" aria-hidden="true" /> Rozpocznij próbę
          </button>
        </section>
      </StudyPageShell>
    );
  }

  const question = mockQuestions[draft.index];
  const onOpenTasks = draft.index >= mockQuestions.length;
  const currentAnswer = question ? draft.answers[question.id] ?? '' : '';

  return (
    <StudyPageShell
      eyebrow="Próba w toku · bez feedbacku"
      title={onOpenTasks ? 'Pisanie i mówienie' : `Zadanie ${draft.index + 1} z ${mockQuestions.length}`}
      description={onOpenTasks ? 'Odpowiedz krótko, ale uwzględnij każdy punkt polecenia.' : undefined}
    >
      {question ? (
        <section className="max-w-2xl">
          <p className="text-xs text-fd-muted-foreground">Lektion {question.lesson} · {question.skill}</p>
          <h2 className="mt-3 whitespace-pre-line text-xl font-semibold leading-8">{question.prompt}</h2>
          {question.tokens ? <p className="mt-3 text-sm text-fd-muted-foreground">{question.tokens.join(' / ')}</p> : null}
          <div className="mt-7">
            {question.options ? (
              <div className="grid gap-2" role="radiogroup">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={currentAnswer === option}
                    onClick={() => updateAnswer(question.id, option)}
                    className={cn(
                      'min-h-12 rounded-md border border-fd-border px-4 text-left text-sm hover:bg-fd-muted',
                      currentAnswer === option && 'border-fd-primary bg-fd-primary/8',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <input
                value={currentAnswer}
                onChange={(event) => updateAnswer(question.id, event.target.value)}
                autoComplete="off"
                className="min-h-12 w-full rounded-md border border-fd-border bg-fd-background px-4 text-sm outline-none focus:border-fd-primary"
                placeholder="Wpisz odpowiedź…"
              />
            )}
          </div>
        </section>
      ) : (
        <section className="max-w-2xl space-y-10">
          {openMockTasks.map((task) => (
            <div key={task.id}>
              <h2 className="text-sm font-semibold">{task.label}</h2>
              <p className="mt-3 text-sm leading-6 text-fd-muted-foreground">{task.prompt}</p>
              <label htmlFor={task.id} className="sr-only">Odpowiedź: {task.label}</label>
              <textarea
                id={task.id}
                rows={6}
                value={draft.openAnswers[task.id] ?? ''}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    openAnswers: { ...current.openAnswers, [task.id]: event.target.value },
                  }))
                }
                className="mt-4 w-full rounded-md border border-fd-border bg-fd-background p-4 text-sm leading-6 outline-none focus:border-fd-primary"
              />
            </div>
          ))}
        </section>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-fd-border pt-6">
        <button
          type="button"
          disabled={draft.index === 0}
          onClick={() => setDraft((current) => ({ ...current, index: Math.max(0, current.index - 1) }))}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-fd-border px-4 text-sm font-medium hover:bg-fd-muted disabled:opacity-35"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Wstecz
        </button>
        {onOpenTasks ? (
          <button
            type="button"
            onClick={submitMock}
            className="min-h-11 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground"
          >
            Oddaj próbę
          </button>
        ) : (
          <button
            type="button"
            disabled={!currentAnswer.trim()}
            onClick={() => setDraft((current) => ({ ...current, index: current.index + 1 }))}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground disabled:opacity-45"
          >
            Dalej <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </StudyPageShell>
  );
}
