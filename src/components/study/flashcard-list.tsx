'use client';

import { useMemo, useState } from 'react';
import { Search, Star, Volume2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { normalizeFlashcardAnswer, primaryGermanTerm, type FlashcardProgress } from '@/lib/study/flashcard-engine';
import type { VocabularyFlashcard } from '@/lib/study/flashcards';

type FlashcardListProps = {
  cards: VocabularyFlashcard[];
  progress: Record<string, FlashcardProgress | undefined>;
  onToggleStar: (cardId: string) => void;
};

export function FlashcardList({ cards, progress, onToggleStar }: FlashcardListProps) {
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(60);
  const normalizedQuery = normalizeFlashcardAnswer(query);
  const filtered = useMemo(
    () => cards.filter((card) => !normalizedQuery || normalizeFlashcardAnswer(`${card.german} ${card.polish} ${card.category}`).includes(normalizedQuery)),
    [cards, normalizedQuery],
  );
  const visible = filtered.slice(0, visibleCount);
  const grouped = useMemo(() => {
    const groups = new Map<number, VocabularyFlashcard[]>();
    for (const card of visible) groups.set(card.lesson, [...(groups.get(card.lesson) ?? []), card]);
    return [...groups.entries()];
  }, [visible]);

  function speak(card: VocabularyFlashcard) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(primaryGermanTerm(card));
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className="mx-auto max-w-4xl" aria-label="Lista fiszek">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fd-muted-foreground" aria-hidden="true" />
        <input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(60); }} placeholder="Szukaj słowa lub znaczenia…" className="min-h-11 w-full rounded-md border border-fd-border bg-fd-background pr-3 pl-10 text-sm outline-none focus:border-fd-primary focus:ring-2 focus:ring-fd-primary/20" />
      </div>
      <p className="mt-3 text-xs text-fd-muted-foreground">{filtered.length} {filtered.length === 1 ? 'fiszka' : 'fiszek'}</p>

      {grouped.length > 0 ? (
        <div className="mt-8 space-y-10">
          {grouped.map(([lesson, lessonCards]) => (
            <section key={lesson} aria-labelledby={`flashcard-list-${lesson}`}>
              <div className="mb-3 flex items-center gap-3">
                <h2 id={`flashcard-list-${lesson}`} className="text-sm font-semibold">Lektion {lesson}</h2>
                <span className="h-px flex-1 bg-fd-border" aria-hidden="true" />
                <span className="text-xs text-fd-muted-foreground">{lessonCards.length}</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card">
                {lessonCards.map((card) => {
                  const itemProgress = progress[card.id];
                  const status = itemProgress?.mastery === 2 ? 'Opanowane' : itemProgress?.seen ? 'W nauce' : 'Nowe';
                  return (
                    <article key={card.id} className="grid gap-3 border-b border-fd-border p-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
                      <div>
                        <p className="text-sm font-semibold leading-6">{card.german}</p>
                        <p className="mt-0.5 text-[11px] text-fd-muted-foreground">{card.category}</p>
                      </div>
                      <p className="text-sm leading-6 text-fd-muted-foreground">{card.polish}</p>
                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <span className={cn('rounded-md px-2 py-1 text-[10px] font-semibold', status === 'Opanowane' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : status === 'W nauce' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300' : 'bg-fd-muted text-fd-muted-foreground')}>{status}</span>
                        <button type="button" onClick={() => speak(card)} aria-label={`Odsłuchaj ${primaryGermanTerm(card)}`} className="rounded-md p-2 text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground"><Volume2 className="size-4" aria-hidden="true" /></button>
                        <button type="button" onClick={() => onToggleStar(card.id)} aria-label={itemProgress?.starred ? 'Usuń gwiazdkę' : 'Dodaj gwiazdkę'} className="rounded-md p-2 text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground"><Star className={cn('size-4', itemProgress?.starred && 'fill-amber-400 text-amber-500')} aria-hidden="true" /></button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-fd-border p-8 text-center text-sm text-fd-muted-foreground">Nie znaleziono takiej fiszki.</div>
      )}

      {visibleCount < filtered.length ? (
        <button type="button" onClick={() => setVisibleCount((value) => value + 60)} className="mt-7 min-h-11 rounded-md border border-fd-border px-4 text-sm font-medium hover:bg-fd-muted">Pokaż kolejne ({filtered.length - visibleCount})</button>
      ) : null}
    </section>
  );
}
