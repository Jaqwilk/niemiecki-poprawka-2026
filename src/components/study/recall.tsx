'use client';

import { useId, useState } from 'react';
import { Check, Eye, RotateCcw } from 'lucide-react';
import { normalizeAnswer } from '@/lib/study/engine';

type RecallProps = {
  prompt: string;
  answer: string;
  hint?: string;
};

export function Recall({ prompt, answer, hint }: RecallProps) {
  const id = useId();
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle');

  function checkAnswer() {
    if (!value.trim()) return;
    const normalizedValue = normalizeAnswer(value);
    const normalizedAnswer = normalizeAnswer(answer);
    const correct =
      normalizedValue === normalizedAnswer ||
      normalizedAnswer.split(';').some((part) => normalizedValue === normalizeAnswer(part));
    setStatus(correct ? 'correct' : 'wrong');
    if (!correct) setValue('');
  }

  return (
    <section className="not-prose my-7 border-l-2 border-fd-primary/70 pl-4">
      <label htmlFor={id} className="block text-sm font-medium leading-6 text-fd-foreground">
        {prompt}
      </label>
      {hint && status === 'idle' ? (
        <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">{hint}</p>
      ) : null}
      <form
        className="mt-3 flex max-w-xl flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          checkAnswer();
        }}
      >
        <input
          id={id}
          value={value}
          disabled={status === 'revealed'}
          onChange={(event) => {
            setValue(event.target.value);
            setStatus('idle');
          }}
          autoComplete="off"
          className="min-h-10 min-w-0 flex-1 rounded-md border border-fd-border bg-fd-background px-3 text-sm outline-none transition-colors placeholder:text-fd-muted-foreground/70 focus:border-fd-primary"
          placeholder="Wpisz odpowiedź…"
        />
        <button
          type="submit"
          disabled={!value.trim() || status === 'revealed'}
          className="min-h-10 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground disabled:cursor-not-allowed disabled:opacity-45"
        >
          Sprawdź
        </button>
      </form>
      <div className="mt-2 min-h-6 text-sm" aria-live="polite">
        {status === 'correct' ? (
          <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Check className="size-4" aria-hidden="true" /> Dobrze.
          </p>
        ) : null}
        {status === 'wrong' ? (
          <p className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <RotateCcw className="size-4" aria-hidden="true" /> Jeszcze nie. Wpisz odpowiedź ponownie.
          </p>
        ) : null}
        {status === 'revealed' ? (
          <p className="font-medium text-fd-foreground">{answer}</p>
        ) : null}
      </div>
      {status !== 'correct' && status !== 'revealed' ? (
        <button
          type="button"
          onClick={() => setStatus('revealed')}
          className="mt-1 inline-flex items-center gap-1.5 text-xs text-fd-muted-foreground underline-offset-4 hover:text-fd-foreground hover:underline"
        >
          <Eye className="size-3.5" aria-hidden="true" /> Nie pamiętam — pokaż odpowiedź
        </button>
      ) : null}
    </section>
  );
}
