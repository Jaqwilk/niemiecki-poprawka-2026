'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, Check, Lightbulb, LoaderCircle, Sparkles, Star, Volume2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { FlashcardEvaluation } from '@/lib/ai/flashcard-evaluation';
import {
  advanceFlashcardLearnStep,
  buildMultipleChoiceOptions,
  evaluateFlashcardAnswerLocally,
  expectedFlashcardAnswer,
  FLASHCARD_LEARN_BATCH_SIZE,
  flashcardLearnBatch,
  flashcardPrompt,
  nextFlashcardMastery,
  normalizeFlashcardAnswer,
  primaryGermanTerm,
  selectLearnCards,
  type FlashcardDirection,
  type FlashcardLearnPhase,
  type FlashcardMastery,
  type FlashcardProgress,
  type FlashcardVerdict,
} from '@/lib/study/flashcard-engine';
import type { VocabularyFlashcard } from '@/lib/study/flashcards';

type Feedback = FlashcardEvaluation & {
  questionType: 'choice' | 'written';
  answer: string;
};

type FlashcardLearnProps = {
  cards: VocabularyFlashcard[];
  allCards: VocabularyFlashcard[];
  direction: FlashcardDirection;
  progress: Record<string, FlashcardProgress | undefined>;
  onResult: (cardId: string, verdict: FlashcardVerdict, questionType: 'choice' | 'written') => void;
  onToggleStar: (cardId: string) => void;
};

export function FlashcardLearn({ cards, allCards, direction, progress, onResult, onToggleStar }: FlashcardLearnProps) {
  const [started, setStarted] = useState(false);
  const [sessionCards, setSessionCards] = useState<VocabularyFlashcard[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [phase, setPhase] = useState<FlashcardLearnPhase>('choice');
  const [mastery, setMastery] = useState<Record<string, FlashcardMastery>>({});
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hintShown, setHintShown] = useState(false);
  const [stats, setStats] = useState({ attempts: 0, correct: 0, ai: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const evaluationCacheRef = useRef(new Map<string, FlashcardEvaluation>());

  const sessionCardIds = useMemo(() => sessionCards.map((card) => card.id), [sessionCards]);
  const currentBatchIds = useMemo(
    () => flashcardLearnBatch(sessionCardIds, batchIndex),
    [batchIndex, sessionCardIds],
  );
  const current = sessionCards.find((card) => card.id === queue[0]);
  const currentMastery = current ? mastery[current.id] ?? 0 : 0;
  const questionType: 'choice' | 'written' = phase;
  const options = useMemo(
    () => current ? buildMultipleChoiceOptions(current, allCards, direction) : [],
    [allCards, current, direction],
  );
  const masteredCount = sessionCards.filter((card) => mastery[card.id] === 2).length;
  const phaseCompletedCount = currentBatchIds.filter(
    (cardId) => (mastery[cardId] ?? 0) >= (phase === 'choice' ? 1 : 2),
  ).length;
  const totalBatches = Math.ceil(sessionCards.length / FLASHCARD_LEARN_BATCH_SIZE);

  useEffect(() => {
    if (started && questionType === 'written' && !feedback) window.setTimeout(() => inputRef.current?.focus(), 60);
  }, [feedback, questionType, queue, started]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!started || !current) return;
      if (feedback && event.key === 'Enter') {
        event.preventDefault();
        continueAfterFeedback();
        return;
      }
      if (questionType === 'choice' && !feedback && /^[1-4]$/.test(event.key)) {
        const option = options[Number(event.key) - 1];
        if (option) evaluateChoice(option);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  function start(size: number) {
    const selected = selectLearnCards(cards, progress, size);
    const initialMastery = Object.fromEntries(
      selected.map((card) => [card.id, 0 as FlashcardMastery]),
    );
    const selectedIds = selected.map((card) => card.id);
    setSessionCards(selected);
    setMastery(initialMastery);
    setQueue(flashcardLearnBatch(selectedIds, 0));
    setBatchIndex(0);
    setPhase('choice');
    setStarted(true);
    setFeedback(null);
    setAnswer('');
    setError('');
    setHintShown(false);
    setStats({ attempts: 0, correct: 0, ai: 0 });
    evaluationCacheRef.current.clear();
  }

  function createFeedback(verdict: FlashcardVerdict, selectedAnswer: string, type: 'choice' | 'written', source: 'ai' | 'local', message?: string) {
    if (!current) return;
    setFeedback({
      verdict,
      answer: selectedAnswer,
      questionType: type,
      source,
      feedback: message ?? (verdict === 'correct' ? 'Dokładnie tak.' : 'Ta odpowiedź nie pasuje do tej fiszki.'),
      correction: expectedFlashcardAnswer(current, direction),
    });
  }

  function evaluateChoice(selected: string) {
    if (!current || feedback) return;
    createFeedback(
      selected === expectedFlashcardAnswer(current, direction) ? 'correct' : 'incorrect',
      selected,
      'choice',
      'local',
      selected === expectedFlashcardAnswer(current, direction)
        ? 'Dobrze — rozpoznajesz to słowo.'
        : 'Nie tym razem. Zobacz poprawną parę i spróbuj ponownie później.',
    );
  }

  async function evaluateWritten() {
    if (!current || loading || feedback || !answer.trim()) return;
    const submitted = answer.trim();
    setError('');
    const localEvaluation = evaluateFlashcardAnswerLocally(current, submitted, direction, allCards);
    if (localEvaluation) {
      createFeedback(localEvaluation.verdict, submitted, 'written', 'local', localEvaluation.feedback);
      return;
    }

    const cacheKey = `${current.id}|${direction}|${normalizeFlashcardAnswer(submitted)}`;
    const cached = evaluationCacheRef.current.get(cacheKey);
    if (cached) {
      setFeedback({ ...cached, answer: submitted, questionType: 'written' });
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch('/api/flashcards/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          cardId: current.id,
          lesson: current.lesson,
          direction,
          prompt: flashcardPrompt(current, direction),
          expected: expectedFlashcardAnswer(current, direction),
          answer: submitted,
        }),
      });
      const payload = await response.json().catch(() => null) as (FlashcardEvaluation & { error?: string }) | null;
      if (!response.ok || !payload || !['correct', 'almost', 'incorrect'].includes(payload.verdict)) {
        throw new Error(payload?.error || 'AI nie mogło teraz ocenić odpowiedzi.');
      }
      evaluationCacheRef.current.set(cacheKey, payload);
      setFeedback({ ...payload, answer: submitted, questionType: 'written' });
    } catch (caught) {
      setError(caught instanceof DOMException && caught.name === 'AbortError'
        ? 'Ocena trwała zbyt długo. Spróbuj ponownie albo użyj „Nie pamiętam”.'
        : caught instanceof Error ? caught.message : 'AI nie mogło teraz ocenić odpowiedzi.');
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  function continueAfterFeedback(override?: FlashcardVerdict) {
    if (!current || !feedback) return;
    const verdict = override ?? feedback.verdict;
    const nextMastery = nextFlashcardMastery(currentMastery, verdict, feedback.questionType);
    const nextMasteryState = { ...mastery, [current.id]: nextMastery };
    const nextStep = advanceFlashcardLearnStep(
      sessionCardIds,
      { batchIndex, phase, queue },
      nextMasteryState,
    );
    onResult(current.id, verdict, feedback.questionType);
    setMastery(nextMasteryState);
    setBatchIndex(nextStep.batchIndex);
    setPhase(nextStep.phase);
    setQueue(nextStep.queue);
    setStats((value) => ({
      attempts: value.attempts + 1,
      correct: value.correct + (verdict === 'correct' ? 1 : 0),
      ai: value.ai + (feedback.source === 'ai' ? 1 : 0),
    }));
    setFeedback(null);
    setAnswer('');
    setError('');
    setHintShown(false);
  }

  function revealAnswer() {
    if (!current || feedback) return;
    createFeedback('incorrect', 'Nie pamiętam', questionType, 'local', 'Spokojnie — ta karta wróci jeszcze w tej serii.');
  }

  function speak(target: VocabularyFlashcard) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(primaryGermanTerm(target));
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-fd-border p-8 text-center">
        <p className="font-medium">Brak fiszek w wybranym zakresie.</p>
        <p className="mt-1 text-sm text-fd-muted-foreground">Zmień zakres u góry strony.</p>
      </div>
    );
  }

  if (!started) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-fd-border bg-fd-card p-6 sm:p-8">
        <div className="flex size-10 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary"><Brain className="size-5" aria-hidden="true" /></div>
        <h2 className="mt-5 text-xl font-semibold">Adaptacyjna nauka</h2>
        <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">
          Uczysz się partiami po maksymalnie 10 słów. Najpierw wybierasz odpowiedzi dla całej partii,
          potem wpisujesz te same słowa z pamięci. Dopiero wtedy przechodzisz dalej.
        </p>
        <div className="mt-6 rounded-xl border border-fd-border bg-fd-muted/35 p-4 text-sm leading-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-fd-primary" aria-hidden="true" />
            <p><strong>Szybka ocena:</strong> poprawne odpowiedzi, typowe literówki i znane pomyłki są sprawdzane natychmiast. Luna włącza się tylko przy niejednoznacznych synonimach.</p>
          </div>
        </div>
        <fieldset className="mt-7">
          <legend className="text-sm font-semibold">Długość sesji</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[10, 20, cards.length].map((size, index) => (
              <button key={`${size}-${index}`} type="button" onClick={() => start(size)} className="min-h-12 rounded-md border border-fd-border px-3 text-sm font-medium hover:border-fd-primary hover:bg-fd-muted">
                {index === 2 ? `Wszystkie (${cards.length})` : `${size} kart`}
              </button>
            ))}
          </div>
        </fieldset>
      </section>
    );
  }

  if (!current) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-fd-border bg-fd-card p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-fd-muted-foreground uppercase">Sesja ukończona</p>
        <h2 className="mt-2 text-2xl font-semibold">Opanowałeś cały zestaw</h2>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat value={sessionCards.length} label="opanowane" />
          <Stat value={stats.attempts} label="odpowiedzi" />
          <Stat value={stats.ai} label="ocen AI" />
        </div>
        <button type="button" onClick={() => setStarted(false)} className="mt-7 min-h-11 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground">Nowa sesja</button>
      </section>
    );
  }

  const prompt = flashcardPrompt(current, direction);
  const expected = expectedFlashcardAnswer(current, direction);
  const progressPercent = sessionCards.length ? (masteredCount / sessionCards.length) * 100 : 0;
  const starred = progress[current.id]?.starred ?? false;

  return (
    <section className="mx-auto max-w-2xl" aria-label="Adaptacyjna nauka fiszek">
      <div className="mb-5 rounded-xl border border-fd-border bg-fd-card p-3.5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <p className="font-semibold">Partia {batchIndex + 1} z {totalBatches}</p>
          <p className="tabular-nums text-fd-muted-foreground">Opanowane {masteredCount}/{sessionCards.length}</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-fd-muted">
          <div className="h-full rounded-full bg-fd-primary transition-[width]" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Etapy bieżącej partii">
          <LearnPhase
            index={1}
            label="Wybierz z 4 opcji"
            active={phase === 'choice'}
            complete={phase === 'written'}
            progress={phase === 'choice' ? `${phaseCompletedCount}/${currentBatchIds.length}` : 'gotowe'}
          />
          <LearnPhase
            index={2}
            label="Wpisz z pamięci"
            active={phase === 'written'}
            complete={false}
            progress={phase === 'written' ? `${phaseCompletedCount}/${currentBatchIds.length}` : 'następnie'}
          />
        </div>
      </div>
      <div className="rounded-2xl border border-fd-border bg-fd-card p-5 shadow-sm sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-fd-muted-foreground uppercase">
              {questionType === 'choice' ? 'Wybierz odpowiedź' : 'Wpisz odpowiedź'} · L{current.lesson}
            </p>
            <p className="mt-1 text-xs text-fd-muted-foreground">{current.category}</p>
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={() => speak(current)} aria-label="Odsłuchaj po niemiecku" className="rounded-md p-2 text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground"><Volume2 className="size-4" aria-hidden="true" /></button>
            <button type="button" onClick={() => onToggleStar(current.id)} aria-label={starred ? 'Usuń gwiazdkę' : 'Dodaj gwiazdkę'} className="rounded-md p-2 text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground"><Star className={cn('size-4', starred && 'fill-amber-400 text-amber-500')} aria-hidden="true" /></button>
          </div>
        </div>

        <h2 className="mt-8 text-2xl leading-relaxed font-semibold sm:text-3xl">{prompt}</h2>

        {feedback ? (
          <FeedbackPanel
            feedback={feedback}
            expected={expected}
            onContinue={() => continueAfterFeedback()}
            onOverride={() => continueAfterFeedback('correct')}
          />
        ) : questionType === 'choice' ? (
          <div className="mt-8 grid gap-2">
            {options.map((option, optionIndex) => (
              <button key={option} type="button" onClick={() => evaluateChoice(option)} className="group flex min-h-14 items-center gap-3 rounded-lg border border-fd-border px-4 py-3 text-left text-sm font-medium hover:border-fd-primary hover:bg-fd-muted">
                <span className="grid size-7 shrink-0 place-items-center rounded-md border border-fd-border text-xs text-fd-muted-foreground group-hover:border-fd-primary">{optionIndex + 1}</span>
                {option}
              </button>
            ))}
          </div>
        ) : (
          <form className="mt-8" onSubmit={(event) => { event.preventDefault(); void evaluateWritten(); }}>
            <label htmlFor="flashcard-answer" className="text-sm font-medium">Twoja odpowiedź</label>
            <div className="mt-2 flex gap-2">
              <input
                ref={inputRef}
                id="flashcard-answer"
                value={answer}
                maxLength={280}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => setAnswer(event.target.value)}
                className="min-h-12 min-w-0 flex-1 rounded-md border border-fd-border bg-fd-background px-3 text-base outline-none focus:border-fd-primary focus:ring-2 focus:ring-fd-primary/20"
              />
              <button type="submit" disabled={!answer.trim() || loading} className="min-h-12 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground disabled:opacity-45">
                {loading ? <LoaderCircle className="size-4 animate-spin" aria-label="AI ocenia" /> : 'Sprawdź'}
              </button>
            </div>
            {loading ? <p className="mt-2 flex items-center gap-2 text-xs text-fd-muted-foreground"><Sparkles className="size-3.5 text-fd-primary" aria-hidden="true" /> Luna sprawdza niejednoznaczną odpowiedź…</p> : null}
            {error ? <p role="alert" className="mt-3 rounded-md border border-red-500/25 bg-red-500/8 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
            {hintShown ? <p className="mt-3 text-sm text-fd-muted-foreground">Podpowiedź: odpowiedź zaczyna się od „{expected.trim().charAt(0)}”.</p> : null}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <button type="button" onClick={() => setHintShown(true)} className="inline-flex items-center gap-1.5 text-fd-muted-foreground hover:text-fd-foreground"><Lightbulb className="size-3.5" aria-hidden="true" /> Podpowiedź</button>
              <button type="button" onClick={revealAnswer} className="text-fd-muted-foreground hover:text-fd-foreground">Nie pamiętam</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function FeedbackPanel({ feedback, expected, onContinue, onOverride }: { feedback: Feedback; expected: string; onContinue: () => void; onOverride: () => void }) {
  const correct = feedback.verdict === 'correct';
  const almost = feedback.verdict === 'almost';
  return (
    <div className={cn('mt-8 rounded-xl border p-4', correct ? 'border-emerald-500/30 bg-emerald-500/8' : almost ? 'border-amber-500/30 bg-amber-500/8' : 'border-red-500/25 bg-red-500/7')}>
      <div className="flex items-start gap-3">
        <span className={cn('mt-0.5 grid size-7 shrink-0 place-items-center rounded-full', correct ? 'bg-emerald-600 text-white' : almost ? 'bg-amber-500 text-white' : 'bg-red-600 text-white')}>
          {correct ? <Check className="size-4" aria-hidden="true" /> : <X className="size-4" aria-hidden="true" />}
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{correct ? 'Dobrze' : almost ? 'Prawie dobrze' : 'Nie tym razem'}</p>
          <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{feedback.feedback}</p>
          <div className="mt-4 border-t border-current/10 pt-3">
            <p className="text-[11px] font-semibold tracking-wide text-fd-muted-foreground uppercase">Poprawna odpowiedź</p>
            <p className="mt-1 font-medium">{feedback.correction || expected}</p>
          </div>
          {feedback.source === 'ai' ? <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-fd-muted-foreground"><Sparkles className="size-3 text-fd-primary" aria-hidden="true" /> Sprawdzone przez AI</p> : null}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={onContinue} autoFocus className="min-h-10 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground">Dalej</button>
        {!correct && feedback.questionType === 'written' ? <button type="button" onClick={onOverride} className="min-h-10 rounded-md border border-fd-border bg-fd-background px-3 text-sm font-medium hover:bg-fd-muted">Zalicz mimo to</button> : null}
      </div>
    </div>
  );
}

function LearnPhase({
  index,
  label,
  active,
  complete,
  progress,
}: {
  index: number;
  label: string;
  active: boolean;
  complete: boolean;
  progress: string;
}) {
  return (
    <div className={cn(
      'flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2',
      active ? 'border-fd-primary/40 bg-fd-primary/8' : 'border-fd-border bg-fd-muted/25',
    )}>
      <span className={cn(
        'grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold',
        active || complete ? 'bg-fd-primary text-fd-primary-foreground' : 'bg-fd-muted text-fd-muted-foreground',
      )}>
        {complete ? <Check className="size-3.5" aria-hidden="true" /> : index}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium">{label}</span>
        <span className="block text-[10px] tabular-nums text-fd-muted-foreground">{progress}</span>
      </span>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="rounded-xl border border-fd-border bg-fd-muted/30 p-4"><p className="text-xl font-semibold">{value}</p><p className="mt-1 text-xs text-fd-muted-foreground">{label}</p></div>;
}
