'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock3, RotateCcw, Trophy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { primaryGermanTerm, seededShuffle } from '@/lib/study/flashcard-engine';
import type { VocabularyFlashcard } from '@/lib/study/flashcards';

type Tile = {
  id: string;
  cardId: string;
  side: 'german' | 'polish';
  text: string;
};

type FlashcardMatchProps = {
  cards: VocabularyFlashcard[];
  bestMs?: number;
  onComplete: (cardIds: string[], elapsedMs: number) => void;
};

function formatTime(milliseconds: number) {
  return `${(milliseconds / 1000).toFixed(1)} s`;
}

export function FlashcardMatch({ cards, bestMs, onComplete }: FlashcardMatchProps) {
  const [round, setRound] = useState(0);
  const cardsKey = cards.map((card) => card.id).join('|');
  const roundCards = useMemo(
    () => seededShuffle(cards, `${round}-match`).slice(0, Math.min(6, cards.length)),
    [cardsKey, round], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const tiles = useMemo<Tile[]>(
    () => seededShuffle(
      roundCards.flatMap((card) => [
        { id: `${card.id}-de`, cardId: card.id, side: 'german' as const, text: primaryGermanTerm(card) },
        { id: `${card.id}-pl`, cardId: card.id, side: 'polish' as const, text: card.polish },
      ]),
      `${round}-tiles-${roundCards.map((card) => card.id).join('|')}`,
    ),
    [round, roundCards],
  );
  const [selected, setSelected] = useState<Tile | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (startedAt === null || finished) return;
    const timer = window.setInterval(() => setElapsed(performance.now() - startedAt), 100);
    return () => window.clearInterval(timer);
  }, [finished, startedAt]);

  function choose(tile: Tile, timestamp: number) {
    if (matched.has(tile.cardId) || wrong.size > 0 || finished) return;
    if (startedAt === null) setStartedAt(timestamp);
    if (!selected) {
      setSelected(tile);
      return;
    }
    if (selected.id === tile.id) {
      setSelected(null);
      return;
    }
    if (selected.cardId === tile.cardId && selected.side !== tile.side) {
      const nextMatched = new Set(matched).add(tile.cardId);
      setMatched(nextMatched);
      setSelected(null);
      if (nextMatched.size === roundCards.length) {
        const finalTime = Math.max(0, timestamp - (startedAt ?? timestamp));
        setElapsed(finalTime);
        setFinished(true);
        onComplete(roundCards.map((card) => card.id), finalTime);
      }
      return;
    }
    setWrong(new Set([selected.id, tile.id]));
    window.setTimeout(() => {
      setWrong(new Set());
      setSelected(null);
    }, 550);
  }

  function restart() {
    setSelected(null);
    setMatched(new Set());
    setWrong(new Set());
    setStartedAt(null);
    setElapsed(0);
    setFinished(false);
    setRound((value) => value + 1);
  }

  if (cards.length < 2) {
    return (
      <div className="rounded-xl border border-dashed border-fd-border p-8 text-center">
        <p className="font-medium">Do gry potrzebujesz co najmniej dwóch fiszek.</p>
        <p className="mt-1 text-sm text-fd-muted-foreground">Wybierz większy zakres.</p>
      </div>
    );
  }

  if (finished) {
    const isRecord = !bestMs || elapsed <= bestMs;
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-fd-border bg-fd-card p-6 text-center sm:p-8">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-500/12 text-amber-600"><Trophy className="size-6" aria-hidden="true" /></div>
        <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-fd-muted-foreground uppercase">Wszystkie pary połączone</p>
        <p className="mt-2 text-4xl font-semibold tabular-nums">{formatTime(elapsed)}</p>
        <p className="mt-2 text-sm text-fd-muted-foreground">{isRecord ? 'Nowy najlepszy wynik w tym zakresie.' : `Najlepszy wynik: ${formatTime(bestMs)}`}</p>
        <button type="button" onClick={restart} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground">
          <RotateCcw className="size-4" aria-hidden="true" /> Zagraj ponownie
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl" aria-label="Dopasowywanie fiszek">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Dopasuj pary</h2>
          <p className="mt-1 text-sm text-fd-muted-foreground">Połącz niemieckie słowo z polskim znaczeniem.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-fd-border px-3 py-2 text-sm tabular-nums">
          <Clock3 className="size-4 text-fd-muted-foreground" aria-hidden="true" /> {formatTime(elapsed)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.cardId);
          const isSelected = selected?.id === tile.id;
          const isWrong = wrong.has(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              disabled={isMatched}
              onClick={(event) => choose(tile, event.timeStamp)}
              className={cn(
                'min-h-24 rounded-xl border border-fd-border bg-fd-card p-3 text-sm leading-5 font-medium transition-all sm:min-h-28 sm:p-4',
                'hover:border-fd-primary hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-primary',
                isSelected && 'border-fd-primary bg-fd-primary/8 ring-1 ring-fd-primary/20',
                isWrong && 'border-red-500 bg-red-500/10 text-red-700 motion-safe:animate-pulse dark:text-red-300',
                isMatched && 'pointer-events-none scale-95 border-emerald-500/20 bg-emerald-500/8 opacity-0',
              )}
            >
              <span className="block text-[10px] font-semibold tracking-wide text-fd-muted-foreground uppercase">{tile.side === 'german' ? 'DE' : 'PL'}</span>
              <span className="mt-2 block">{tile.text}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between text-xs text-fd-muted-foreground">
        <span>{matched.size} z {roundCards.length} par</span>
        {bestMs ? <span>Rekord: {formatTime(bestMs)}</span> : startedAt === null ? <span>Czas ruszy po pierwszym kliknięciu</span> : <span>Dopasowuj dalej</span>}
      </div>
    </section>
  );
}
