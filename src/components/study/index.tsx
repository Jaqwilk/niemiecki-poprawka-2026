import type { ReactNode } from 'react';
import {
  BookmarkCheck,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Lightbulb,
  MapPinned,
  RotateCcw,
  Scale,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
export { Recall } from './recall';
export { LessonComplete } from './lesson-complete';

type LessonMinimumProps = {
  children: ReactNode;
  className?: string;
};

export function LessonMinimum({ children, className }: LessonMinimumProps) {
  return (
    <section
      className={cn(
        'not-prose my-8 rounded-xl border border-fd-border bg-fd-card p-5 sm:p-6',
        className,
      )}
      aria-labelledby="minimum-heading"
    >
      <div className="flex items-center gap-2">
        <ClipboardCheck className="size-4 text-fd-primary" aria-hidden="true" />
        <h2 id="minimum-heading" className="text-base font-semibold text-fd-foreground">
          Minimum na poprawkę
        </h2>
      </div>
      <div className="mt-4 text-sm leading-7 text-fd-muted-foreground [&_li]:my-1 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function OneThing({ children, className, title = 'Jeżeli zapamiętasz tylko jedną rzecz…' }: BoxProps) {
  return (
    <aside
      className={cn(
        'not-prose my-6 rounded-xl border border-fd-primary/30 bg-fd-primary/6 p-5',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-fd-foreground">
        <BookmarkCheck className="size-4 text-fd-primary" aria-hidden="true" />
        {title}
      </div>
      <div className="mt-2 text-sm leading-7 text-fd-muted-foreground">{children}</div>
    </aside>
  );
}

const caseStyles = {
  Nominativ: 'border-sky-500/35 bg-sky-500/10 text-sky-800 dark:text-sky-300',
  Akkusativ: 'border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  Dativ: 'border-violet-500/35 bg-violet-500/10 text-violet-800 dark:text-violet-300',
} as const;

type CaseName = keyof typeof caseStyles;

export function CaseTag({ name }: { name: CaseName }) {
  return (
    <span
      className={cn(
        'not-prose inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold',
        caseStyles[name],
      )}
    >
      {name}
    </span>
  );
}

export function CaseLegend() {
  return (
    <aside className="not-prose my-6 grid gap-2 text-sm sm:grid-cols-3" aria-label="Przypadki gramatyczne">
      <div className="rounded-lg border border-sky-500/25 bg-sky-500/6 p-3">
        <CaseTag name="Nominativ" />
        <p className="mt-2 leading-5 text-fd-muted-foreground">kto lub co jest podmiotem zdania</p>
      </div>
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/6 p-3">
        <CaseTag name="Akkusativ" />
        <p className="mt-2 leading-5 text-fd-muted-foreground">kogo lub co obejmuje czynność</p>
      </div>
      <div className="rounded-lg border border-violet-500/25 bg-violet-500/6 p-3">
        <CaseTag name="Dativ" />
        <p className="mt-2 leading-5 text-fd-muted-foreground">komu, czemu albo gdzie po danym przyimku</p>
      </div>
    </aside>
  );
}

type EmailBlockProps = {
  lines: string[];
  title?: string;
};

export function EmailBlock({ lines, title = 'Wzór wiadomości' }: EmailBlockProps) {
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <figcaption className="border-b border-fd-border px-5 py-3 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
        {title}
      </figcaption>
      <div className="space-y-3 px-5 py-5 text-sm leading-7 text-fd-foreground">
        {lines.map((line, index) =>
          line ? <p key={`${index}-${line}`}>{line}</p> : <div key={`space-${index}`} className="h-1" aria-hidden="true" />,
        )}
      </div>
    </figure>
  );
}

export function RouteMap() {
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <div className="flex items-center gap-2 border-b border-fd-border px-5 py-3 text-sm font-semibold">
        <MapPinned className="size-4 text-fd-primary" aria-hidden="true" />
        Plan ulic do ćwiczenia
      </div>
      <svg
        viewBox="0 0 720 360"
        role="img"
        aria-labelledby="route-map-title route-map-description"
        className="block h-auto w-full bg-fd-muted/30"
      >
        <title id="route-map-title">Plan drogi od dworca do apteki</title>
        <desc id="route-map-description">
          Dworzec znajduje się w lewym dolnym rogu. Apteka jest w prawym górnym rogu, obok banku. Ulice przecinają się pod kątem prostym.
        </desc>
        <rect x="0" y="0" width="720" height="360" fill="currentColor" className="text-fd-card" />
        <path d="M0 115H720M0 245H720M180 0V360M430 0V360" stroke="currentColor" strokeWidth="38" className="text-fd-muted" />
        <path d="M0 115H720M0 245H720M180 0V360M430 0V360" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" className="text-fd-muted-foreground/50" />
        <g fill="currentColor" className="text-fd-foreground" fontSize="16" fontWeight="600">
          <text x="36" y="318">Start: Bahnhof</text>
          <text x="520" y="70">Apotheke</text>
          <text x="520" y="200">Bank</text>
          <text x="248" y="70">Café</text>
          <text x="245" y="320">Rathaus</text>
        </g>
        <g fill="currentColor" className="text-fd-muted-foreground" fontSize="12">
          <text x="18" y="103">Schillerstraße</text>
          <text x="18" y="233">Goethestraße</text>
          <text x="190" y="25">Parkstraße</text>
          <text x="440" y="25">Lessingstraße</text>
        </g>
        <circle cx="70" cy="285" r="11" fill="currentColor" className="text-fd-primary" />
        <path d="M70 285H180V245H430V115H520" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="text-fd-primary" />
        <path d="M503 103L523 115L503 127" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="text-fd-primary" />
      </svg>
      <figcaption className="px-5 py-4 text-sm leading-6 text-fd-muted-foreground">
        Powiedz trasę od <strong className="text-fd-foreground">Bahnhof</strong> do <strong className="text-fd-foreground">Apotheke</strong>. Użyj co najmniej trzech kroków i jednego punktu orientacyjnego.
      </figcaption>
    </figure>
  );
}

type BoxProps = {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
};

export function Rule({ children, className, title = 'Regel' }: BoxProps) {
  return (
    <aside
      className={cn(
        'not-prose my-6 border-l-2 border-fd-primary/70 py-1 pl-5 text-sm',
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

export function Example({ german, polish, label, className }: ExampleProps) {
  return (
    <figure className={cn('not-prose my-5 border-l-2 border-fd-primary py-1 pl-5', className)}>
      {label ? (
        <figcaption className="mb-2 text-xs font-semibold tracking-wide text-fd-muted-foreground uppercase">
          {label}
        </figcaption>
      ) : null}
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
        'not-prose my-6 overflow-hidden rounded-lg border border-fd-border',
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
        'not-prose my-6 border-l-2 border-fd-primary/70 py-1 pl-5 text-sm',
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

export function SourceNote({ children, className }: Omit<BoxProps, 'title'>) {
  return (
    <details
      className={cn(
        'not-prose mt-12 border-t border-fd-border pt-5 text-xs leading-5 text-fd-muted-foreground',
        className,
      )}
    >
      <summary className="w-fit cursor-pointer font-medium text-fd-muted-foreground hover:text-fd-foreground">
        Źródła
      </summary>
      <div className="mt-3 max-w-3xl">{children}</div>
    </details>
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
