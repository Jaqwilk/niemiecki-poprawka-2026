'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Brain, GalleryVerticalEnd, List, Puzzle, Repeat2, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  nextFlashcardMastery,
  type FlashcardDirection,
  type FlashcardProgress,
  type FlashcardVerdict,
} from '@/lib/study/flashcard-engine';
import { createFlashcardStore, loadFlashcardStore, saveFlashcardStore, type FlashcardStore } from '@/lib/study/flashcard-storage';
import { vocabularyFlashcards } from '@/lib/study/flashcards';
import { LESSONS } from '@/lib/study/types';
import { FlashcardLearn } from './flashcard-learn';
import { FlashcardList } from './flashcard-list';
import { FlashcardMatch } from './flashcard-match';
import { FlashcardReview } from './flashcard-review';
import { StudyPageShell } from './page-shell';

type FlashcardMode = 'cards' | 'learn' | 'match' | 'list';
type FlashcardScope = 'all' | 'learning' | 'starred' | `${(typeof LESSONS)[number]}`;

const modes: Array<{ id: FlashcardMode; label: string; icon: typeof GalleryVerticalEnd }> = [
  { id: 'cards', label: 'Fiszki', icon: GalleryVerticalEnd },
  { id: 'learn', label: 'Ucz się', icon: Brain },
  { id: 'match', label: 'Dopasuj', icon: Puzzle },
  { id: 'list', label: 'Lista', icon: List },
];

function emptyProgress(): FlashcardProgress {
  return { mastery: 0, seen: 0, correct: 0, incorrect: 0, starred: false, updatedAt: '' };
}

export function FlashcardsView() {
  const [mode, setMode] = useState<FlashcardMode>('cards');
  const [scope, setScope] = useState<FlashcardScope>('all');
  const [direction, setDirection] = useState<FlashcardDirection>('de-pl');
  const [store, setStore] = useState<FlashcardStore>(createFlashcardStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStore(loadFlashcardStore());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) saveFlashcardStore(store);
  }, [hydrated, store]);

  const updateProgress = useCallback((cardId: string, updater: (current: FlashcardProgress) => FlashcardProgress) => {
    setStore((current) => ({
      ...current,
      progress: {
        ...current.progress,
        [cardId]: updater(current.progress[cardId] ?? emptyProgress()),
      },
    }));
  }, []);

  const toggleStar = useCallback((cardId: string) => {
    updateProgress(cardId, (current) => ({ ...current, starred: !current.starred, updatedAt: new Date().toISOString() }));
  }, [updateProgress]);

  const markReview = useCallback((cardId: string, known: boolean) => {
    updateProgress(cardId, (current) => ({
      ...current,
      mastery: known ? 2 : Math.min(current.mastery, 1) as 0 | 1,
      seen: current.seen + 1,
      correct: current.correct + (known ? 1 : 0),
      incorrect: current.incorrect + (known ? 0 : 1),
      updatedAt: new Date().toISOString(),
    }));
  }, [updateProgress]);

  const recordLearning = useCallback((cardId: string, verdict: FlashcardVerdict, questionType: 'choice' | 'written') => {
    updateProgress(cardId, (current) => ({
      ...current,
      mastery: nextFlashcardMastery(current.mastery, verdict, questionType),
      seen: current.seen + 1,
      correct: current.correct + (verdict === 'correct' ? 1 : 0),
      incorrect: current.incorrect + (verdict === 'correct' ? 0 : 1),
      updatedAt: new Date().toISOString(),
    }));
  }, [updateProgress]);

  const filteredCards = useMemo(() => vocabularyFlashcards.filter((card) => {
    const itemProgress = store.progress[card.id];
    if (scope === 'all') return true;
    if (scope === 'starred') return itemProgress?.starred === true;
    if (scope === 'learning') return itemProgress?.mastery !== 2;
    return card.lesson === Number(scope);
  }), [scope, store.progress]);

  const mastered = vocabularyFlashcards.filter((card) => store.progress[card.id]?.mastery === 2).length;
  const inProgress = vocabularyFlashcards.filter((card) => {
    const value = store.progress[card.id];
    return value && value.seen > 0 && value.mastery < 2;
  }).length;
  const starred = vocabularyFlashcards.filter((card) => store.progress[card.id]?.starred).length;
  const scopeKey = `${scope}-${direction}`;
  const bestMatchMs = store.bestMatchMs[scopeKey];

  function completeMatch(cardIds: string[], elapsedMs: number) {
    setStore((current) => {
      const nextProgress = { ...current.progress };
      const now = new Date().toISOString();
      for (const cardId of cardIds) {
        const value = nextProgress[cardId] ?? emptyProgress();
        nextProgress[cardId] = {
          ...value,
          mastery: Math.max(1, value.mastery) as 1 | 2,
          seen: value.seen + 1,
          correct: value.correct + 1,
          updatedAt: now,
        };
      }
      const currentBest = current.bestMatchMs[scopeKey];
      return {
        ...current,
        progress: nextProgress,
        bestMatchMs: {
          ...current.bestMatchMs,
          [scopeKey]: !currentBest || elapsedMs < currentBest ? elapsedMs : currentBest,
        },
      };
    });
  }

  return (
    <StudyPageShell
      eyebrow="Trening"
      title="Fiszki"
      description="Kompletny zestaw słownictwa Lektion 13–18 z aktywnym przypominaniem i inteligentną oceną odpowiedzi."
      className="max-w-6xl"
    >
      <section aria-label="Postęp fiszek" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryStat value={vocabularyFlashcards.length} label="wszystkich fiszek" />
        <SummaryStat value={mastered} label="opanowane" accent="success" />
        <SummaryStat value={inProgress} label="w nauce" accent="warning" />
        <SummaryStat value={starred} label="z gwiazdką" icon={<Star className="size-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />} />
      </section>

      <div className="mt-7 border-b border-fd-border" role="tablist" aria-label="Tryb fiszek">
        <div className="flex gap-5 overflow-x-auto">
          {modes.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={mode === item.id}
                onClick={() => setMode(item.id)}
                className={cn(
                  'relative inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 border-transparent px-0 text-sm font-medium text-fd-muted-foreground',
                  'hover:text-fd-foreground aria-selected:border-fd-primary aria-selected:text-fd-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden="true" /> {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm">
          <span className="shrink-0 font-medium">Zakres</span>
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as FlashcardScope)}
            className="min-h-10 rounded-md border border-fd-border bg-fd-background px-3 text-sm outline-none focus:border-fd-primary"
          >
            <option value="all">Wszystkie Lektion 13–18</option>
            <option value="learning">Do nauczenia</option>
            <option value="starred">Tylko z gwiazdką</option>
            {LESSONS.map((lesson) => <option key={lesson} value={lesson}>Lektion {lesson}</option>)}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-fd-muted-foreground">Pytaj</span>
          <div className="flex rounded-md border border-fd-border p-1" role="radiogroup" aria-label="Kierunek nauki">
            <DirectionButton active={direction === 'de-pl'} onClick={() => setDirection('de-pl')}>DE → PL</DirectionButton>
            <DirectionButton active={direction === 'pl-de'} onClick={() => setDirection('pl-de')}>PL → DE</DirectionButton>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {!hydrated ? (
          <div className="grid min-h-72 place-items-center rounded-xl border border-fd-border"><p className="flex items-center gap-2 text-sm text-fd-muted-foreground"><Sparkles className="size-4 text-fd-primary" aria-hidden="true" /> Wczytuję postęp…</p></div>
        ) : mode === 'cards' ? (
          <FlashcardReview key={scopeKey} cards={filteredCards} direction={direction} progress={store.progress} onMark={markReview} onToggleStar={toggleStar} />
        ) : mode === 'learn' ? (
          <FlashcardLearn key={scopeKey} cards={filteredCards} allCards={vocabularyFlashcards} direction={direction} progress={store.progress} onResult={recordLearning} onToggleStar={toggleStar} />
        ) : mode === 'match' ? (
          <FlashcardMatch key={scopeKey} cards={filteredCards} bestMs={bestMatchMs} onComplete={completeMatch} />
        ) : (
          <FlashcardList key={scopeKey} cards={filteredCards} progress={store.progress} onToggleStar={toggleStar} />
        )}
      </div>

      <div className="mt-12 flex items-start gap-3 border-t border-fd-border pt-5 text-xs leading-5 text-fd-muted-foreground">
        <Repeat2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>Postęp zapisuje się automatycznie w tej przeglądarce. Dokładne odpowiedzi są sprawdzane lokalnie; niejednoznaczne odpowiedzi pisemne ocenia szybki model AI.</p>
      </div>
    </StudyPageShell>
  );
}

function DirectionButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" role="radio" aria-checked={active} onClick={onClick} className={cn('min-h-8 rounded px-2.5 text-xs font-semibold', active ? 'bg-fd-primary text-fd-primary-foreground' : 'text-fd-muted-foreground hover:bg-fd-muted')}>{children}</button>;
}

function SummaryStat({ value, label, accent, icon }: { value: number; label: string; accent?: 'success' | 'warning'; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-fd-border bg-fd-card p-4">
      <div className="flex items-center gap-2">
        <p className={cn('text-xl font-semibold tabular-nums', accent === 'success' && 'text-emerald-700 dark:text-emerald-300', accent === 'warning' && 'text-amber-700 dark:text-amber-300')}>{value}</p>
        {icon}
      </div>
      <p className="mt-1 text-xs text-fd-muted-foreground">{label}</p>
    </div>
  );
}
