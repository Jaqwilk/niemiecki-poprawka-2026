'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Save } from 'lucide-react';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Callout } from 'fumadocs-ui/components/callout';
import { cn } from '@/lib/cn';
import { isCorrectAnswer } from '@/lib/study/engine';
import { mockQuestions, openMockTasks } from '@/lib/study/mock';
import type { MockAttempt, StudyQuestion, StudySkill } from '@/lib/study/types';
import { StudyPageShell } from './page-shell';
import { useStudyState } from './state-provider';

const DRAFT_KEY = 'deutsch-a1-2-mock-draft-v1';

type MockDraft = {
  index: number;
  answers: Record<string, string>;
  openAnswers: Record<string, string>;
};

const emptyDraft: MockDraft = { index: 0, answers: {}, openAnswers: {} };

const skillLabels: Record<StudySkill, string> = {
  vocabulary: 'słownictwo',
  grammar: 'gramatyka',
  reading: 'czytanie',
  writing: 'pisanie',
  speaking: 'mówienie',
  communication: 'komunikacja',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function normalizeDraft(value: unknown): MockDraft | null {
  if (!value || typeof value !== 'object') return null;
  const draft = value as Partial<MockDraft>;
  const index = Number.isInteger(draft.index)
    ? Math.max(0, Math.min(mockQuestions.length, draft.index as number))
    : 0;
  return {
    index,
    answers: draft.answers && typeof draft.answers === 'object' ? draft.answers : {},
    openAnswers:
      draft.openAnswers && typeof draft.openAnswers === 'object' ? draft.openAnswers : {},
  };
}

export function MockTest() {
  const { state, hydrated, recordAnswer, saveMockAttempt } = useStudyState();
  const [started, setStarted] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [draft, setDraft] = useState<MockDraft>(emptyDraft);
  const [result, setResult] = useState<MockAttempt | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      const saved = raw ? normalizeDraft(JSON.parse(raw)) : null;
      if (saved) {
        timer = window.setTimeout(() => {
          setDraft(saved);
          setResumed(true);
          setStarted(true);
        }, 0);
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!started) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Nauka nadal działa, nawet jeśli przeglądarka zablokuje pamięć lokalną.
    }
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

  const answeredCount = mockQuestions.filter(
    (question) => (draft.answers[question.id] ?? '').trim().length > 0,
  ).length;
  const openAnsweredCount = openMockTasks.filter(
    (task) => (draft.openAnswers[task.id] ?? '').trim().length > 0,
  ).length;
  const allComplete =
    answeredCount === mockQuestions.length && openAnsweredCount === openMockTasks.length;

  const question: StudyQuestion | undefined = started && draft.index < mockQuestions.length
    ? mockQuestions[draft.index]
    : undefined;

  useEffect(() => {
    if (!started || result || !question?.options) return;
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (!/^[1-4]$/.test(event.key)) return;
      const option = question?.options?.[Number(event.key) - 1];
      if (!option) return;
      setDraft((current) => ({
        ...current,
        answers: { ...current.answers, [question.id]: option },
      }));
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [question, result, started]);

  function updateAnswer(questionId: string, answer: string) {
    setDraft((current) => ({
      ...current,
      answers: { ...current.answers, [questionId]: answer },
    }));
  }

  function submitMock() {
    if (!allComplete) return;
    const createdAt = new Date().toISOString();
    const answers = mockQuestions.map((item) => {
      const answer = draft.answers[item.id] ?? '';
      const correct = isCorrectAnswer(item, answer);
      recordAnswer(item, answer, 'mock');
      return { questionId: item.id, answer, correct };
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
    setResumed(false);
    window.localStorage.removeItem(DRAFT_KEY);
  }

  function resetTest() {
    window.localStorage.removeItem(DRAFT_KEY);
    setDraft(emptyDraft);
    setResult(null);
    setResumed(false);
    setStarted(false);
  }

  if (result) {
    const incorrect = result.answers.filter((answer) => !answer.correct);
    const scorePercent = Math.round((result.score / result.maxScore) * 100);
    return (
      <StudyPageShell
        eyebrow="Wynik próby"
        title={`${result.score} / ${result.maxScore}`}
        description="Feedback jest już widoczny, a każda pomyłka trafiła do obowiązkowej poprawy."
      >
        <Callout
          type={scorePercent >= 75 ? 'success' : 'warning'}
          title={scorePercent >= 75 ? 'Dobry punkt wyjścia' : 'Najpierw popraw słabe lekcje'}
          className="my-0 max-w-3xl"
        >
          Wynik z zadań zamkniętych: {scorePercent}%. Zadania otwarte oceń osobno według checklist poniżej.
        </Callout>

        <section className="mt-10 max-w-3xl" aria-labelledby="lesson-result-heading">
          <h2 id="lesson-result-heading" className="text-lg font-semibold">Wynik według lekcji</h2>
          <div className="mt-4 divide-y divide-fd-border border-y border-fd-border">
            {lessonScores.map((score) => {
              const percent = Math.round((score.correct / score.total) * 100);
              return (
                <div key={score.lesson} className="grid items-center gap-3 py-4 sm:grid-cols-[7rem_1fr_auto]">
                  <span className="text-sm font-medium">Lektion {score.lesson}</span>
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-fd-muted"
                    role="progressbar"
                    aria-label={`Wynik Lektion ${score.lesson}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                  >
                    <div className="h-full bg-fd-primary" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-sm text-fd-muted-foreground">{score.correct}/{score.total}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 border-y border-fd-border py-6">
          <Link href="/mistakes" className="rounded-md bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground">
            {incorrect.length > 0 ? `Ćwicz błędy (${incorrect.length})` : 'Historia błędów'}
          </Link>
          <button
            type="button"
            onClick={resetTest}
            className="rounded-md border border-fd-border px-4 py-2.5 text-sm font-medium hover:bg-fd-muted"
          >
            Nowa próba
          </button>
        </div>

        <section className="mt-10 max-w-3xl" aria-labelledby="closed-feedback-heading">
          <h2 id="closed-feedback-heading" className="text-lg font-semibold">Odpowiedzi do poprawy</h2>
          {incorrect.length ? (
            <Accordions className="mt-4">
              {incorrect.map((item) => {
                const itemQuestion = mockQuestions.find((candidate) => candidate.id === item.questionId);
                if (!itemQuestion) return null;
                const number = mockQuestions.findIndex((candidate) => candidate.id === item.questionId) + 1;
                return (
                  <Accordion
                    key={item.questionId}
                    value={`result-${item.questionId}`}
                    title={`Zadanie ${number} · Lektion ${itemQuestion.lesson} · ${itemQuestion.topic}`}
                  >
                    <div className="space-y-4 text-sm">
                      <p className="font-medium leading-6">{itemQuestion.prompt}</p>
                      <dl className="grid gap-3 sm:grid-cols-2">
                        <div><dt className="text-xs text-fd-muted-foreground">Twoja odpowiedź</dt><dd className="mt-1">{item.answer || '—'}</dd></div>
                        <div><dt className="text-xs text-fd-muted-foreground">Poprawnie</dt><dd className="mt-1 font-medium">{itemQuestion.correctAnswer}</dd></div>
                      </dl>
                      <p className="leading-6 text-fd-muted-foreground">{itemQuestion.explanation}</p>
                    </div>
                  </Accordion>
                );
              })}
            </Accordions>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <Check className="size-4" aria-hidden="true" /> Wszystkie zadania zamknięte są poprawne.
            </p>
          )}
        </section>

        <section className="mt-10 max-w-3xl" aria-labelledby="open-feedback-heading">
          <h2 id="open-feedback-heading" className="text-lg font-semibold">Samoocena pisania i mówienia</h2>
          <Accordions className="mt-4">
            {openMockTasks.map((task) => (
              <Accordion key={task.id} value={`open-${task.id}`} title={task.label}>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs text-fd-muted-foreground">Twoja odpowiedź</p>
                    <p className="mt-1 whitespace-pre-wrap leading-6">{draft.openAnswers[task.id] || 'Brak odpowiedzi.'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Sprawdź, czy masz:</p>
                    <ul className="mt-2 list-inside list-disc leading-6 text-fd-muted-foreground">
                      {task.checklist.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-fd-muted-foreground">Model odpowiedzi</p>
                    <p className="mt-1 leading-6">{task.model}</p>
                  </div>
                </div>
              </Accordion>
            ))}
          </Accordions>
        </section>
      </StudyPageShell>
    );
  }

  if (!started) {
    const lastAttempt = state.mockAttempts[0];
    return (
      <StudyPageShell
        eyebrow="Dzień 5"
        title="Próba generalna"
        description="Formaty pochodzą z oficjalnych stron TEST i Prüfungstraining dla modułów 5 i 6."
      >
        <section className="max-w-2xl">
          <dl className="grid grid-cols-3 gap-5 border-y border-fd-border py-6 text-sm">
            <div><dt className="text-fd-muted-foreground">Zadania</dt><dd className="mt-1 text-lg font-semibold">20 + 2</dd></div>
            <div><dt className="text-fd-muted-foreground">Czas</dt><dd className="mt-1 text-lg font-semibold">~35 min</dd></div>
            <div><dt className="text-fd-muted-foreground">Zakres</dt><dd className="mt-1 text-lg font-semibold">13–18</dd></div>
          </dl>

          <Callout type="info" title="Zasady próby" className="mt-6">
            <ul className="space-y-1">
              <li>Feedback pojawia się dopiero po oddaniu.</li>
              <li>Możesz pomijać zadania i wracać do nich z nawigacji.</li>
              <li>Każda zmiana zapisuje się lokalnie w tej przeglądarce.</li>
              <li>Do oddania trzeba uzupełnić 20 zadań i 2 odpowiedzi otwarte.</li>
            </ul>
          </Callout>

          {lastAttempt ? (
            <div className="mt-6 border-l-2 border-fd-border pl-4 text-sm">
              <p className="font-medium">Ostatni wynik: {lastAttempt.score}/{lastAttempt.maxScore}</p>
              <p className="mt-1 text-xs text-fd-muted-foreground">{formatDate(lastAttempt.createdAt)}</p>
            </div>
          ) : null}

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

  const onOpenTasks = draft.index >= mockQuestions.length;
  const currentAnswer = question ? draft.answers[question.id] ?? '' : '';
  const missingObjective = mockQuestions.length - answeredCount;
  const missingOpen = openMockTasks.length - openAnsweredCount;

  return (
    <StudyPageShell
      eyebrow="Próba w toku · bez feedbacku"
      title={onOpenTasks ? 'Pisanie i mówienie' : `Zadanie ${draft.index + 1} z ${mockQuestions.length}`}
      description={onOpenTasks ? 'Odpowiedz krótko, ale uwzględnij każdy punkt polecenia.' : undefined}
    >
      {resumed ? (
        <Callout type="success" title="Wznowiono zapisany szkic" className="mt-0 max-w-3xl">
          Możesz kontynuować dokładnie od miejsca, w którym przerwano próbę.
        </Callout>
      ) : null}

      <section className="mt-6 max-w-3xl border-y border-fd-border py-5" aria-label="Postęp i nawigacja próby">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-fd-muted-foreground">
          <span>{answeredCount} z {mockQuestions.length} zadań zamkniętych</span>
          <span className="flex items-center gap-1.5"><Save className="size-3.5" aria-hidden="true" /> zapis lokalny</span>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-fd-muted"
          role="progressbar"
          aria-label="Uzupełnione zadania próby"
          aria-valuemin={0}
          aria-valuemax={mockQuestions.length}
          aria-valuenow={answeredCount}
        >
          <div className="h-full bg-fd-primary transition-[width]" style={{ width: `${(answeredCount / mockQuestions.length) * 100}%` }} />
        </div>
        <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {mockQuestions.map((item, itemIndex) => {
            const answered = (draft.answers[item.id] ?? '').trim().length > 0;
            const current = draft.index === itemIndex;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Zadanie ${itemIndex + 1}: ${answered ? 'odpowiedziano' : 'bez odpowiedzi'}`}
                aria-current={current ? 'step' : undefined}
                onClick={() => setDraft((value) => ({ ...value, index: itemIndex }))}
                className={cn(
                  'grid min-h-9 place-items-center rounded-md border border-fd-border text-xs font-medium hover:bg-fd-muted',
                  answered && 'bg-fd-muted text-fd-foreground',
                  current && 'border-fd-primary bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary',
                )}
              >
                {itemIndex + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            aria-current={onOpenTasks ? 'step' : undefined}
            onClick={() => setDraft((value) => ({ ...value, index: mockQuestions.length }))}
            className="min-h-9 rounded-md border border-fd-border px-3 text-xs font-medium hover:bg-fd-muted aria-[current=step]:border-fd-primary aria-[current=step]:bg-fd-primary aria-[current=step]:text-fd-primary-foreground"
          >
            Pisanie i mówienie · {openAnsweredCount}/{openMockTasks.length}
          </button>
          <Link href="/study" className="text-xs font-medium text-fd-muted-foreground hover:text-fd-foreground">
            Dokończ później
          </Link>
        </div>
      </section>

      {question ? (
        <section className="mt-9 max-w-2xl" aria-labelledby="mock-question-heading">
          <p className="text-xs text-fd-muted-foreground">Lektion {question.lesson} · {skillLabels[question.skill]}</p>
          {question.instruction ? <p className="mt-4 text-sm text-fd-muted-foreground">{question.instruction}</p> : null}
          <h2 id="mock-question-heading" className="mt-3 whitespace-pre-line text-xl font-semibold leading-8">{question.prompt}</h2>
          {question.tokens ? <p className="mt-3 text-sm text-fd-muted-foreground">{question.tokens.join(' / ')}</p> : null}
          <div className="mt-7">
            {question.options ? (
              <div className="grid gap-2" role="radiogroup" aria-label="Wybierz odpowiedź">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={currentAnswer === option}
                    onClick={() => updateAnswer(question.id, option)}
                    className={cn(
                      'flex min-h-12 items-center gap-3 rounded-md border border-fd-border px-4 text-left text-sm hover:bg-fd-muted',
                      currentAnswer === option && 'border-fd-primary bg-fd-primary/8',
                    )}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded border border-fd-border text-xs text-fd-muted-foreground">
                      {optionIndex + 1}
                    </span>
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
          {!currentAnswer.trim() ? (
            <p className="mt-3 text-xs text-fd-muted-foreground">Możesz pominąć to zadanie i wrócić do niego później.</p>
          ) : null}
        </section>
      ) : (
        <section className="mt-9 max-w-2xl space-y-10">
          {openMockTasks.map((task) => (
            <div key={task.id}>
              <h2 className="text-base font-semibold">{task.label}</h2>
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
                placeholder="Zapisz pełną odpowiedź…"
              />
            </div>
          ))}
        </section>
      )}

      <div className="mt-10 max-w-3xl border-t border-fd-border pt-6">
        {onOpenTasks && !allComplete ? (
          <p className="mb-4 text-sm text-fd-muted-foreground" role="status">
            Do oddania brakuje: {missingObjective} {missingObjective === 1 ? 'zadania zamkniętego' : 'zadań zamkniętych'}
            {missingObjective > 0 && missingOpen > 0 ? ' oraz ' : ''}
            {missingOpen > 0 ? `${missingOpen} ${missingOpen === 1 ? 'odpowiedzi otwartej' : 'odpowiedzi otwartych'}` : ''}.
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-3">
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
              disabled={!allComplete}
              onClick={submitMock}
              className="min-h-11 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground disabled:cursor-not-allowed disabled:opacity-45"
            >
              Oddaj próbę
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDraft((current) => ({ ...current, index: current.index + 1 }))}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground"
            >
              {draft.index === mockQuestions.length - 1 ? 'Część otwarta' : 'Dalej'}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </StudyPageShell>
  );
}
