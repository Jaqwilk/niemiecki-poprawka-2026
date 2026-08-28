'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Star,
  Volume2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  expectedFlashcardAnswer,
  flashcardPrompt,
  primaryGermanTerm,
  seededShuffle,
  type FlashcardDirection,
  type FlashcardProgress,
} from '@/lib/study/flashcard-engine';
import type { VocabularyFlashcard } from '@/lib/study/flashcards';

type FlashcardReviewProps = {
  cards: VocabularyFlashcard[];
  direction: FlashcardDirection;
  progress: Record<string, FlashcardProgress | undefined>;
  onMark: (cardId: string, known: boolean) => void;
  onToggleStar: (cardId: string) => void;
};

export function FlashcardReview({ cards, direction, progress, onMark, onToggleStar }: FlashcardReviewProps) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [finished, setFinished] = useState(false);
  const [classified, setClassified] = useState<Record<string, boolean>>({});
  const pointerStart = useRef<number | null>(null);
  const suppressClick = useRef(false);

  const card = deck[index];

  const previous = useCallback(() => {
    if (!deck.length) return;
    setIndex((current) => (current - 1 + deck.length) % deck.length);
    setFlipped(false);
  }, [deck.length]);

  const next = useCallback(() => {
    if (!deck.length) return;
    setIndex((current) => (current + 1) % deck.length);
    setFlipped(false);
  }, [deck.length]);

  const speak = useCallback((target: VocabularyFlashcard) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(primaryGermanTerm(target));
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  const mark = useCallback((known: boolean) => {
    if (!card) return;
    const previousValue = classified[card.id];
    const nextClassified = { ...classified, [card.id]: known };
    setClassified(nextClassified);
    if (previousValue !== known) onMark(card.id, known);
    if (Object.keys(nextClassified).length >= deck.length) {
      setFinished(true);
      setAutoplay(false);
      return;
    }
    const nextUnclassified = deck.findIndex((candidate, candidateIndex) =>
      candidateIndex > index && nextClassified[candidate.id] === undefined,
    );
    const firstUnclassified = deck.findIndex((candidate) => nextClassified[candidate.id] === undefined);
    setIndex(nextUnclassified >= 0 ? nextUnclassified : Math.max(0, firstUnclassified));
    setFlipped(false);
  }, [card, classified, deck, index, onMark]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'ArrowRight') next();
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        setFlipped((current) => !current);
      }
      if (event.key === '1' && flipped) mark(false);
      if (event.key === '2' && flipped) mark(true);
      if (event.key.toLowerCase() === 's' && card) onToggleStar(card.id);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [card, flipped, mark, next, onToggleStar, previous]);

  useEffect(() => {
    if (!autoplay || !card || finished) return;
    const timer = window.setTimeout(() => {
      if (flipped) next();
      else {
        setFlipped(true);
        if (direction === 'pl-de') speak(card);
      }
    }, flipped ? 2200 : 1700);
    return () => window.clearTimeout(timer);
  }, [autoplay, card, direction, finished, flipped, next, speak]);

  const summary = useMemo(() => {
    const values = Object.values(classified);
    return { known: values.filter(Boolean).length, learning: values.filter((value) => !value).length };
  }, [classified]);

  function restart(nextDeck = cards, shouldShuffle = shuffle) {
    setDeck(shouldShuffle ? seededShuffle(nextDeck, `review-${nextDeck.map((item) => item.id).join('|')}`) : nextDeck);
    setIndex(0);
    setClassified({});
    setFinished(false);
    setFlipped(false);
  }

  function toggleShuffle() {
    const nextShuffle = !shuffle;
    setShuffle(nextShuffle);
    restart(cards, nextShuffle);
  }

  if (!card || cards.length === 0) {
    return <EmptyReview />;
  }

  if (finished) {
    const learningCards = deck.filter((candidate) => classified[candidate.id] === false);
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-fd-border bg-fd-card p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-fd-muted-foreground uppercase">Runda zakończona</p>
        <h2 className="mt-2 text-2xl font-semibold">Dobra robota</h2>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4">
            <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{summary.known}</p>
            <p className="mt-1 text-sm text-fd-muted-foreground">Umiem</p>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4">
            <p className="text-2xl font-semibold text-amber-700 dark:text-amber-300">{summary.learning}</p>
            <p className="mt-1 text-sm text-fd-muted-foreground">Jeszcze się uczę</p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          {learningCards.length > 0 ? (
            <button type="button" onClick={() => restart(learningCards)} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground">
              <RotateCcw className="size-4" aria-hidden="true" /> Powtórz trudne ({learningCards.length})
            </button>
          ) : null}
          <button type="button" onClick={() => restart()} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-fd-border px-4 text-sm font-medium hover:bg-fd-muted">
            Zacznij od nowa
          </button>
        </div>
      </section>
    );
  }

  const front = flashcardPrompt(card, direction);
  const back = expectedFlashcardAnswer(card, direction);
  const isStarred = progress[card.id]?.starred ?? false;

  return (
    <section className="mx-auto max-w-3xl" aria-label="Tryb fiszek">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-fd-muted-foreground">
        <span>Lektion {card.lesson} · {card.category}</span>
        <span className="tabular-nums">{index + 1} / {deck.length}</span>
      </div>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-fd-muted" aria-hidden="true">
        <div className="h-full min-w-1.5 rounded-full bg-fd-primary transition-[width]" style={{ width: `${((index + 1) / deck.length) * 100}%` }} />
      </div>

      <div className="mb-3 flex items-center justify-end gap-1">
        <button type="button" onClick={() => onToggleStar(card.id)} aria-label={isStarred ? 'Usuń gwiazdkę' : 'Dodaj gwiazdkę'} className="rounded-md p-2 text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground">
          <Star className={cn('size-4', isStarred && 'fill-amber-400 text-amber-500')} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => speak(card)} aria-label="Odsłuchaj po niemiecku" className="rounded-md p-2 text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground">
          <Volume2 className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={toggleShuffle} aria-pressed={shuffle} aria-label="Tasowanie" className={cn('rounded-md p-2 text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground', shuffle && 'bg-fd-primary/10 text-fd-primary')}>
          <Shuffle className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => setAutoplay((value) => !value)} aria-pressed={autoplay} aria-label={autoplay ? 'Zatrzymaj automatyczne odtwarzanie' : 'Odtwarzaj automatycznie'} className={cn('rounded-md p-2 text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground', autoplay && 'bg-fd-primary/10 text-fd-primary')}>
          {autoplay ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
        </button>
      </div>

      <div className="[perspective:1200px]">
        <button
          type="button"
          onClick={() => {
            if (suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            setFlipped((value) => !value);
          }}
          onPointerDown={(event) => { pointerStart.current = event.clientX; suppressClick.current = false; }}
          onPointerUp={(event) => {
            if (pointerStart.current === null) return;
            const distance = event.clientX - pointerStart.current;
            pointerStart.current = null;
            if (Math.abs(distance) < 60) return;
            suppressClick.current = true;
            if (distance > 0) previous(); else next();
          }}
          className="block w-full rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-primary"
          aria-label={flipped ? 'Pokaż przód fiszki' : 'Odwróć fiszkę'}
        >
          <span
            className="grid min-h-[300px] w-full transition-transform duration-300 [transform-style:preserve-3d] sm:min-h-[360px]"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            <CardFace label={direction === 'de-pl' ? 'Niemiecki' : 'Polski'} text={front} hidden={flipped} />
            <CardFace label={direction === 'de-pl' ? 'Polski' : 'Niemiecki'} text={back} example={card.example} back hidden={!flipped} />
          </span>
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-fd-muted-foreground">Kliknij kartę lub naciśnij spację, aby ją odwrócić</p>
      <div className="mt-5 grid grid-cols-[44px_1fr_1fr_44px] gap-2">
        <button type="button" onClick={previous} aria-label="Poprzednia fiszka" className="grid min-h-11 place-items-center rounded-md border border-fd-border hover:bg-fd-muted">
          <ArrowLeft className="size-4" aria-hidden="true" />
        </button>
        <button type="button" disabled={!flipped} onClick={() => mark(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-fd-border px-3 text-sm font-medium hover:bg-fd-muted disabled:cursor-not-allowed disabled:opacity-40">
          <X className="size-4 text-amber-600" aria-hidden="true" /> Jeszcze się uczę
        </button>
        <button type="button" disabled={!flipped} onClick={() => mark(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fd-primary px-3 text-sm font-medium text-fd-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">
          <Check className="size-4" aria-hidden="true" /> Umiem
        </button>
        <button type="button" onClick={next} aria-label="Następna fiszka" className="grid min-h-11 place-items-center rounded-md border border-fd-border hover:bg-fd-muted">
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-4 text-center text-[11px] text-fd-muted-foreground">←/→ nawigacja · 1 jeszcze się uczę · 2 umiem · S gwiazdka</p>
    </section>
  );
}

function CardFace({ label, text, example, back = false, hidden }: { label: string; text: string; example?: string; back?: boolean; hidden: boolean }) {
  return (
    <span
      aria-hidden={hidden}
      className={cn(
        'relative col-start-1 row-start-1 flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-fd-border bg-fd-card px-7 py-10 text-center shadow-sm [backface-visibility:hidden] sm:min-h-[360px] sm:px-12',
        back && '[transform:rotateY(180deg)]',
      )}
    >
      <span className="absolute top-5 left-5 text-[11px] font-semibold tracking-[0.13em] text-fd-muted-foreground uppercase">{label}</span>
      <span className="text-2xl leading-relaxed font-semibold text-fd-foreground sm:text-3xl">{text}</span>
      {example ? <span className="mt-7 max-w-xl border-t border-fd-border pt-5 text-sm leading-6 text-fd-muted-foreground">{example}</span> : null}
    </span>
  );
}

function EmptyReview() {
  return (
    <div className="rounded-xl border border-dashed border-fd-border p-8 text-center">
      <p className="font-medium">W tym zakresie nie ma jeszcze fiszek.</p>
      <p className="mt-1 text-sm text-fd-muted-foreground">Wybierz wszystkie lekcje albo inną kategorię.</p>
    </div>
  );
}
