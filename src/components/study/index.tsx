import type { ReactNode } from 'react';
import {
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  RotateCcw,
  Scale,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';

type BoxProps = {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
};

export function Rule({ children, className, title = 'Regel' }: BoxProps) {
  return (
    <aside
      className={cn(
        'not-prose my-6 rounded-xl border border-fd-border bg-fd-card p-5 text-sm',
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2 font-semibold text-fd-foreground">
        <Scale className="size-4 text-fd-primary" aria-hidden="true" />
        {title}
      </div>
      <div className="leading-7 text-fd-muted-foreground">{children}</div>
    </aside>
  );
}

type ExampleProps = {
  german: ReactNode;
  polish?: ReactNode;
  label?: ReactNode;
  className?: string;
};

export function Example({ german, polish, label = 'Beispiel', className }: ExampleProps) {
  return (
    <figure className={cn('not-prose my-5 border-l-2 border-fd-primary py-1 pl-5', className)}>
      <figcaption className="mb-2 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
        {label}
      </figcaption>
      <p className="text-base font-semibold leading-7 text-fd-foreground">{german}</p>
      {polish ? <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{polish}</p> : null}
    </figure>
  );
}

type MistakeProps = {
  wrong: ReactNode;
  correct: ReactNode;
  explanation?: ReactNode;
  className?: string;
};

export function Mistake({ wrong, correct, explanation, className }: MistakeProps) {
  return (
    <aside
      className={cn(
        'not-prose my-6 overflow-hidden rounded-xl border border-fd-border bg-fd-card',
        className,
      )}
    >
      <div className="flex gap-3 border-b border-fd-border p-4 text-sm leading-6">
        <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden="true" />
        <span className="text-fd-muted-foreground line-through decoration-red-400/70">{wrong}</span>
      </div>
      <div className="flex gap-3 p-4 text-sm leading-6">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-fd-primary" aria-hidden="true" />
        <span className="font-medium text-fd-foreground">{correct}</span>
      </div>
      {explanation ? (
        <div className="border-t border-fd-border bg-fd-muted/45 px-4 py-3 text-xs leading-5 text-fd-muted-foreground">
          {explanation}
        </div>
      ) : null}
    </aside>
  );
}

type VocabularyProps = {
  word: ReactNode;
  translation: ReactNode;
  example?: ReactNode;
  exampleTranslation?: ReactNode;
  badges?: string[];
  className?: string;
};

export function Vocabulary({
  word,
  translation,
  example,
  exampleTranslation,
  badges = [],
  className,
}: VocabularyProps) {
  return (
    <article
      className={cn(
        'not-prose my-4 rounded-xl border border-fd-border bg-fd-card p-5',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-fd-foreground">{word}</p>
          <p className="mt-0.5 text-sm text-fd-muted-foreground">{translation}</p>
        </div>
        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5" aria-label="Kennzeichnungen">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-md border border-fd-border bg-fd-muted px-2 py-0.5 text-[11px] font-medium text-fd-muted-foreground"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {example ? (
        <div className="mt-4 border-t border-fd-border pt-4">
          <p className="text-sm font-medium leading-6 text-fd-foreground">{example}</p>
          {exampleTranslation ? (
            <p className="mt-0.5 text-xs leading-5 text-fd-muted-foreground">{exampleTranslation}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function ExamTip({ children, className, title = 'Prüfungstipp' }: BoxProps) {
  return (
    <aside
      className={cn(
        'not-prose my-6 rounded-xl border border-fd-primary/25 bg-fd-primary/7 p-5 text-sm',
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2 font-semibold text-fd-foreground">
        <GraduationCap className="size-4 text-fd-primary" aria-hidden="true" />
        {title}
      </div>
      <div className="leading-7 text-fd-muted-foreground">{children}</div>
    </aside>
  );
}

type ExerciseProps = {
  answer: ReactNode;
  children: ReactNode;
  className?: string;
  label?: string;
};

export function Exercise({ answer, children, className, label = 'Antwort anzeigen' }: ExerciseProps) {
  return (
    <section
      className={cn(
        'not-prose my-6 rounded-xl border border-fd-border bg-fd-card p-5',
        className,
      )}
    >
      <div className="mb-4 text-sm leading-7 text-fd-foreground">{children}</div>
      <details className="group rounded-lg border border-fd-border bg-fd-muted/50 open:bg-fd-background">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium marker:hidden">
          {label}
          <Lightbulb
            className="size-4 text-fd-primary transition-transform group-open:rotate-12"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-fd-border px-4 py-3 text-sm font-semibold text-fd-foreground">
          {answer}
        </div>
      </details>
    </section>
  );
}

type FlashcardProps = {
  front: ReactNode;
  back: ReactNode;
  className?: string;
};

export function Flashcard({ front, back, className }: FlashcardProps) {
  return (
    <details
      className={cn(
        'not-prose group my-5 overflow-hidden rounded-xl border border-fd-border bg-fd-card',
        className,
      )}
    >
      <summary className="flex min-h-24 cursor-pointer list-none items-center justify-between gap-5 p-5 marker:hidden">
        <span className="text-base font-semibold text-fd-foreground">{front}</span>
        <RotateCcw
          className="size-4 shrink-0 text-fd-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-fd-border bg-fd-muted/40 p-5 text-sm leading-7 text-fd-foreground">
        {back}
      </div>
    </details>
  );
}
