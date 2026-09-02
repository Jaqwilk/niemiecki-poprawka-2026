'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, History, Play, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { selectRecommendedQuestions } from '@/lib/study/engine';
import {
  getPracticeQuestionsForLesson,
  practiceFormats,
  practiceQuestions,
} from '@/lib/study/practice';
import { sprintDays } from '@/lib/study/schedule';
import {
  createPracticeDraft,
  loadPracticeDraft,
  savePracticeDraft,
  type PracticeDraft,
} from '@/lib/study/practice-session-storage';
import { LESSONS, type LessonNumber, type StudyQuestion } from '@/lib/study/types';
import { PracticeSheet } from './practice-sheet';
import { StudyPageShell } from './page-shell';
import { useStudyState } from './state-provider';
import styles from './practice-view.module.css';

function PracticeScopeFromUrl({ onScopeChange }: { onScopeChange: (scope: string) => void }) {
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get('lesson');

  useEffect(() => {
    const requestedLesson = Number(lessonParam);
    onScopeChange(
      LESSONS.includes(requestedLesson as LessonNumber)
        ? String(requestedLesson)
        : 'recommended',
    );
  }, [lessonParam, onScopeChange]);

  return null;
}

function getScopeLabel(scope: string) {
  if (scope === 'recommended') return 'Polecane teraz';
  if (scope === 'mixed') return 'Mieszane L13–18';
  return `Lektion ${scope}`;
}

export function PracticeView() {
  const { state, hydrated } = useStudyState();
  const [scope, setScope] = useState('recommended');
  const [session, setSession] = useState<StudyQuestion[] | null>(null);
  const [sessionDraft, setSessionDraft] = useState<PracticeDraft | null>(null);
  const restoreChecked = useRef(false);
  const openMistakes = state.mistakes.filter((mistake) => mistake.status === 'open');
  const activeDay = sprintDays[state.activeDay - 1];
  const latestSession = state.practiceSessions[0];

  useEffect(() => {
    if (!hydrated || session || restoreChecked.current) return;
    restoreChecked.current = true;
    const saved = loadPracticeDraft();
    if (!saved) return;
    const questionMap = new Map(practiceQuestions.map((question) => [question.id, question]));
    const restored = saved.questionIds
      .map((id) => questionMap.get(id))
      .filter((question): question is StudyQuestion => Boolean(question));
    if (restored.length !== saved.questionIds.length) return;
    const timer = window.setTimeout(() => {
      setScope(saved.scope);
      setSessionDraft(saved);
      setSession(restored);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [hydrated, session]);

  const previewCount = useMemo(() => {
    if (scope === 'recommended' || scope === 'mixed') return 12;
    return getPracticeQuestionsForLesson(Number(scope) as LessonNumber).length;
  }, [scope]);

  const previewDescription =
    scope === 'recommended'
      ? 'Seria dobierana według Twoich błędów i aktualnego dnia nauki.'
      : scope === 'mixed'
        ? 'Równy trening ze wszystkich sześciu lekcji przed próbą generalną.'
        : `Wszystkie rozłączne ćwiczenia przygotowane dla Lektion ${scope}.`;

  function start() {
    let selectedQuestions: StudyQuestion[];
    if (scope === 'recommended') {
      selectedQuestions = selectRecommendedQuestions(practiceQuestions, state, 12);
    } else if (scope === 'mixed') {
      selectedQuestions = selectRecommendedQuestions(practiceQuestions, { ...state, activeDay: 4 }, 12);
    } else {
      selectedQuestions = getPracticeQuestionsForLesson(Number(scope) as LessonNumber);
    }
    const nextDraft = createPracticeDraft(
      scope,
      getScopeLabel(scope),
      selectedQuestions.map((question) => question.id),
    );
    savePracticeDraft(nextDraft);
    setSessionDraft(nextDraft);
    setSession(selectedQuestions);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function leaveSession() {
    setSession(null);
    setSessionDraft(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <Suspense fallback={null}>
        <PracticeScopeFromUrl onScopeChange={setScope} />
      </Suspense>
      <StudyPageShell
        title="Ćwiczenia"
        description="Trening w formie cyfrowego arkusza. Pomyłkę poprawiasz z pamięci, zanim przejdziesz dalej."
        className={styles.practiceShell}
      >
        {session ? (
          <PracticeSheet
            questions={session}
            draft={sessionDraft}
            scopeLabel={sessionDraft?.scopeLabel ?? getScopeLabel(scope)}
            onLeave={leaveSession}
          />
        ) : (
          <section className={styles.previewPaper} aria-labelledby="practice-preview-title">
            <header className={styles.previewHeader}>
              <div className={styles.previewMark} aria-hidden="true">DE<br />A1.2</div>
              <div className={styles.previewIdentity}>
                <span>Vorname, NAME:</span>
                <span />
              </div>
              <div className={styles.previewMeta}>
                <strong>ÜBUNGSBLATT</strong>
                <span>Kap. 13–18</span>
              </div>
              <div className={styles.previewTitle}>
                <h2 id="practice-preview-title">INDIVIDUELLES TRAINING</h2>
                <span>{practiceQuestions.length} eigene Aufgaben</span>
              </div>
            </header>

            <div className={styles.safetyNote}>
              <ShieldCheck aria-hidden="true" />
              <div>
                <strong>Oddzielna pula od testu</strong>
                <p>
                  W ćwiczeniach nie pojawia się żadne pytanie z arkusza testowego ani
                  powtórzona para słownictwa. Powtarza się wyłącznie potrzebna wiedza.
                </p>
              </div>
              <span>0 DUPLIKATÓW</span>
            </div>

            <fieldset className={styles.scopeSection}>
              <legend>TEIL 1: WÄHLEN SIE DIE SERIE</legend>
              <p>Wybierz sposób doboru zadań. Wynik nie jest oceną — liczy się poprawa.</p>

              <div className={styles.modeGrid} role="radiogroup" aria-label="Tryb serii">
                {[
                  ['recommended', 'Polecane teraz', 'Błędy, bieżące lekcje i krótka powtórka'],
                  ['mixed', 'Mieszane 13–18', '12 zadań z całego materiału'],
                ].map(([value, title, detail]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={scope === value}
                    onClick={() => setScope(value)}
                    className={cn(styles.modeOption, scope === value && styles.modeOptionActive)}
                  >
                    <span className={styles.radioMark}>{scope === value ? <Check aria-hidden="true" /> : null}</span>
                    <span>
                      <strong>{title}</strong>
                      <small>{detail}</small>
                    </span>
                  </button>
                ))}
              </div>

              <p className={styles.lessonPrompt}>Oder nur eine Lektion:</p>
              <div className={styles.lessonGrid} role="radiogroup" aria-label="Wybierz jedną lekcję">
                {LESSONS.map((lesson) => {
                  const count = getPracticeQuestionsForLesson(lesson).length;
                  return (
                    <button
                      key={lesson}
                      type="button"
                      role="radio"
                      aria-checked={scope === String(lesson)}
                      onClick={() => setScope(String(lesson))}
                    >
                      <strong>L{lesson}</strong>
                      <span>{count} zadań</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <section className={styles.formatSection}>
              <div className={styles.sectionHeading}>
                <h3>TEIL 2: AUFGABENTYPEN</h3>
                <span>jak na papierowym teście</span>
              </div>
              <div className={styles.formatGrid}>
                {practiceFormats.map((format, index) => (
                  <div key={format}>
                    <span>{index + 1}</span>
                    <p>{format}</p>
                    <i />
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.seriesSummary}>
              <div>
                <span>Wybrana seria</span>
                <strong>{getScopeLabel(scope)}</strong>
                <p>{previewDescription}</p>
              </div>
              <div className={styles.countBox}>
                <strong>{previewCount}</strong>
                <span>zadań</span>
                <small>ok. {Math.max(6, Math.round(previewCount * 0.8))} min</small>
              </div>
            </section>

            {latestSession ? (
              <div className={styles.savedSession}>
                <History aria-hidden="true" />
                <div>
                  <strong>Ostatni ukończony arkusz jest zapisany</strong>
                  <span>
                    {latestSession.scopeLabel} · {latestSession.score}/{latestSession.maxScore} bez poprawki ·{' '}
                    {new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium' }).format(new Date(latestSession.completedAt))}
                  </span>
                </div>
              </div>
            ) : null}

            {scope === 'recommended' ? (
              <div className={styles.recommendationNote}>
                <Sparkles aria-hidden="true" />
                <p>
                  {hydrated ? (
                    <>
                      {openMistakes.length > 0
                        ? `${openMistakes.length} otwartych ${openMistakes.length === 1 ? 'błąd otrzyma' : 'błędów otrzyma'} pierwszeństwo, jeśli należy do puli ćwiczeń.`
                        : 'Nie ma teraz otwartych błędów.'}{' '}
                      Aktualny nacisk: Lektion {activeDay.lessons.join(' i ')}.
                    </>
                  ) : 'Wczytuję historię nauki…'}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              disabled={!hydrated}
              onClick={start}
              className={styles.startButton}
            >
              <Play aria-hidden="true" /> Zacznij arkusz ćwiczeń
            </button>

            <footer className={styles.previewFooter}>
              <span>GiE · Lektion 13–18</span>
              <span>Korrektur ist obligatorisch</span>
            </footer>
          </section>
        )}
      </StudyPageShell>
    </>
  );
}
