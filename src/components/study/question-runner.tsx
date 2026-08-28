'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Callout } from 'fumadocs-ui/components/callout';
import type { StudyQuestion } from '@/lib/study/types';
import { cn } from '@/lib/cn';
import { AudioPrompt } from './audio-prompt';
import { useStudyState } from './state-provider';

type SessionResult = { questionId: string; firstTryCorrect: boolean };

type QuestionRunnerProps = {
  questions: StudyQuestion[];
  mode?: 'practice' | 'retry';
  onComplete?: (results: SessionResult[]) => void;
  onLeave?: () => void;
  leaveLabel?: string;
};

export function QuestionRunner({
  questions,
  mode = 'practice',
  onComplete,
  onLeave,
  leaveLabel = 'Nowa seria',
}: QuestionRunnerProps) {
  const { recordAnswer } = useStudyState();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'retry' | 'correct'>('idle');
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState('');
  const [results, setResults] = useState<SessionResult[]>([]);
  const question = questions[index];

  const composedAnswer = useMemo(
    () =>
      question?.kind === 'order'
        ? selectedTokens.map((tokenIndex) => question.tokens?.[tokenIndex] ?? '').join(' ')
        : answer,
    [answer, question, selectedTokens],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (status === 'correct' && (event.key === 'Enter' || event.key.toLowerCase() === 'n')) {
        event.preventDefault();
        goNext();
      }
      if (
        status === 'idle' &&
        question?.options &&
        /^[1-4]$/.test(event.key) &&
        Number(event.key) <= question.options.length
      ) {
        setAnswer(question.options[Number(event.key) - 1]);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!question) {
    const firstTryCorrect = results.filter((result) => result.firstTryCorrect).length;
    const accuracy = results.length ? Math.round((firstTryCorrect / results.length) * 100) : 0;
    return (
      <div className="max-w-2xl py-6">
        <Callout type="success" title="Seria zakończona" className="my-0">
          <p>
            Poprawnie za pierwszym razem: {firstTryCorrect} z {results.length} ({accuracy}%).
            Każda pomyłka została zapisana do powtórki.
          </p>
        </Callout>
        <div className="mt-6 flex justify-center gap-3">
          {onLeave ? (
            <button
              type="button"
              onClick={onLeave}
              className="rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
            >
              {leaveLabel}
            </button>
          ) : null}
          <Link href="/mistakes" className="rounded-md border border-fd-border px-4 py-2 text-sm font-medium hover:bg-fd-muted">
            Historia błędów
          </Link>
          {!onLeave ? (
            <Link href="/study" className="rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground">
              Wróć do planu
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const canSubmit = composedAnswer.trim().length > 0;

  function submit() {
    if (!canSubmit || status === 'correct' || status === 'wrong') return;
    const attemptMode = status === 'retry' || mode === 'retry' ? 'retry' : 'practice';
    const correct = recordAnswer(question, composedAnswer, attemptMode);
    if (correct) {
      setStatus('correct');
      if (!results.some((result) => result.questionId === question.id)) {
        setResults((current) => [
          ...current,
          { questionId: question.id, firstTryCorrect: status !== 'retry' },
        ]);
      }
    } else {
      setWrongAnswer(composedAnswer);
      setWrongCount((current) => current + 1);
      setStatus('wrong');
    }
  }

  function retry() {
    setAnswer('');
    setSelectedTokens([]);
    setStatus('retry');
  }

  function goNext() {
    if (status !== 'correct') return;
    const nextIndex = index + 1;
    setAnswer('');
    setSelectedTokens([]);
    setStatus('idle');
    setWrongCount(0);
    setWrongAnswer('');
    setIndex(nextIndex);
    if (nextIndex >= questions.length) {
      const finalResults = results.some((result) => result.questionId === question.id)
        ? results
        : [...results, { questionId: question.id, firstTryCorrect: true }];
      onComplete?.(finalResults);
    }
  }

  function toggleToken(tokenIndex: number) {
    if (status === 'wrong' || status === 'correct') return;
    setSelectedTokens((current) =>
      current.includes(tokenIndex)
        ? current.filter((value) => value !== tokenIndex)
        : [...current, tokenIndex],
    );
  }

  return (
    <section aria-labelledby="question-title">
      <div className="flex items-center justify-between gap-4 text-xs text-fd-muted-foreground">
        <span>Lektion {question.lesson} · {question.topic}</span>
        <span className="flex items-center gap-3">
          <span>{index + 1} / {questions.length}</span>
          {onLeave ? (
            <button
              type="button"
              onClick={onLeave}
              className="font-medium text-fd-muted-foreground hover:text-fd-foreground"
            >
              Przerwij
            </button>
          ) : null}
        </span>
      </div>
      <div
        className="mt-3 h-1 overflow-hidden rounded-full bg-fd-muted"
        role="progressbar"
        aria-label="Postęp serii"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index + 1}
      >
        <div className="h-full bg-fd-primary transition-[width]" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="mt-9">
        {question.audioText ? <AudioPrompt text={question.audioText} /> : null}
        {question.instruction ? <p className="mb-2 text-sm text-fd-muted-foreground">{question.instruction}</p> : null}
        <h2 id="question-title" className="whitespace-pre-line text-xl font-semibold leading-8 tracking-tight">
          {question.prompt}
        </h2>
      </div>

      <div className="mt-7">
        {question.options ? (
          <div className="grid gap-2" role="radiogroup" aria-label="Wybierz odpowiedź">
            {question.options.map((option, optionIndex) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={answer === option}
                disabled={status === 'wrong' || status === 'correct'}
                onClick={() => setAnswer(option)}
                className={cn(
                  'flex min-h-12 items-center gap-3 rounded-md border border-fd-border px-4 text-left text-sm transition-colors hover:bg-fd-muted disabled:cursor-default',
                  answer === option && 'border-fd-primary bg-fd-primary/8',
                )}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded border border-fd-border text-xs text-fd-muted-foreground">
                  {optionIndex + 1}
                </span>
                {option}
              </button>
            ))}
          </div>
        ) : question.kind === 'order' ? (
          <div>
            <div className="min-h-14 rounded-md border border-dashed border-fd-border p-3 text-sm leading-7">
              {composedAnswer || <span className="text-fd-muted-foreground">Klikaj słowa w prawidłowej kolejności.</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {question.tokens?.map((token, tokenIndex) => (
                <button
                  key={`${token}-${tokenIndex}`}
                  type="button"
                  disabled={selectedTokens.includes(tokenIndex) || status === 'wrong' || status === 'correct'}
                  onClick={() => toggleToken(tokenIndex)}
                  className="min-h-10 rounded-md border border-fd-border px-3 text-sm hover:bg-fd-muted disabled:opacity-35"
                >
                  {token}
                </button>
              ))}
              {selectedTokens.length > 0 && status !== 'wrong' && status !== 'correct' ? (
                <button type="button" onClick={() => setSelectedTokens([])} className="min-h-10 px-2 text-xs text-fd-muted-foreground hover:text-fd-foreground">
                  Wyczyść
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <label htmlFor="study-answer" className="sr-only">Twoja odpowiedź</label>
            <input
              id="study-answer"
              value={answer}
              disabled={status === 'wrong' || status === 'correct'}
              onChange={(event) => setAnswer(event.target.value)}
              autoFocus
              autoComplete="off"
              className="min-h-12 w-full rounded-md border border-fd-border bg-fd-background px-4 text-sm outline-none focus:border-fd-primary"
              placeholder={question.kind === 'correction' ? 'Wpisz całe poprawne zdanie…' : 'Wpisz odpowiedź…'}
            />
          </form>
        )}
      </div>

      {status === 'wrong' ? (
        <Callout
          type="error"
          title={wrongCount === 1 ? 'Jeszcze nie — najpierw wskazówka' : 'Jeszcze nie — sprawdź rozwiązanie'}
          className="mt-7"
          role="alert"
        >
          {wrongCount === 1 ? (
            <div className="mt-3 text-sm leading-6">
              <p className="font-medium">{question.hint ?? `Zwróć uwagę na zagadnienie: ${question.topic}.`}</p>
              <p className="mt-1 text-fd-muted-foreground">Spróbuj jeszcze raz bez podglądania pełnej odpowiedzi.</p>
            </div>
          ) : (
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-fd-muted-foreground">Twoja odpowiedź</dt>
              <dd className="mt-1 font-medium">{wrongAnswer || '—'}</dd>
            </div>
            <div>
              <dt className="text-fd-muted-foreground">Poprawnie</dt>
              <dd className="mt-1 font-medium">{question.correctAnswer}</dd>
            </div>
            <div>
              <dt className="text-fd-muted-foreground">Dlaczego</dt>
              <dd className="mt-1 max-w-2xl leading-6">{question.explanation}</dd>
            </div>
          </dl>
          )}
          <button
            type="button"
            onClick={retry}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground"
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Spróbuj ponownie
          </button>
        </Callout>
      ) : null}

      {status === 'correct' ? (
        <Callout type="success" title="Dobrze" className="mt-7" aria-live="polite">
          <p className="mt-2 max-w-2xl text-sm leading-6 text-fd-muted-foreground">{question.explanation}</p>
          <p className="mt-2 text-xs text-fd-muted-foreground">Źródło: {question.source.label}</p>
          <button
            type="button"
            onClick={goNext}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground"
          >
            Dalej <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </Callout>
      ) : null}

      {status === 'retry' ? (
        <p className="mt-4 text-sm font-medium text-fd-foreground" aria-live="polite">
          Teraz odtwórz poprawną odpowiedź z pamięci.
        </p>
      ) : null}

      {(status === 'idle' || status === 'retry') && (question.options || question.kind === 'order') ? (
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="mt-7 min-h-11 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground disabled:cursor-not-allowed disabled:opacity-45"
        >
          Sprawdź
        </button>
      ) : null}

      {(status === 'idle' || status === 'retry') && !question.options && question.kind !== 'order' ? (
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="mt-4 min-h-11 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground disabled:cursor-not-allowed disabled:opacity-45"
        >
          Sprawdź
        </button>
      ) : null}
    </section>
  );
}
