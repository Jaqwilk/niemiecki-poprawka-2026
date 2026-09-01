'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { StudyQuestion } from '@/lib/study/types';
import { AudioPrompt } from './audio-prompt';
import { useStudyState } from './state-provider';
import styles from './practice-sheet.module.css';

type SessionResult = { questionId: string; firstTryCorrect: boolean };

type PracticeSheetProps = {
  questions: StudyQuestion[];
  scopeLabel: string;
  onLeave: () => void;
};

const skillLabels: Record<StudyQuestion['skill'], string> = {
  vocabulary: 'WORTSCHATZ',
  grammar: 'GRAMMATIK',
  listening: 'HÖRVERSTEHEN',
  reading: 'LESEVERSTEHEN',
  writing: 'SCHREIBEN',
  speaking: 'SPRECHEN',
  communication: 'KOMMUNIKATION',
};

function getInstruction(question: StudyQuestion) {
  if (question.instruction) return question.instruction;
  if (question.kind === 'true-false') return 'Lesen Sie genau. Kreuzen Sie Richtig oder Falsch an.';
  if (question.kind === 'order') return 'Bringen Sie die Wörter in die richtige Reihenfolge.';
  if (question.kind === 'correction') return 'Finden Sie den Fehler und schreiben Sie den ganzen Satz richtig.';
  if (question.kind === 'dialogue') return 'Ergänzen Sie den Dialog mit der passenden Antwort.';
  if (question.options) return 'Kreuzen Sie die richtige Antwort an.';
  return 'Ergänzen oder übersetzen Sie. Schreiben Sie die vollständige Lösung.';
}

export function PracticeSheet({ questions, scopeLabel, onLeave }: PracticeSheetProps) {
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

  if (!question) {
    const firstTryCorrect = results.filter((result) => result.firstTryCorrect).length;
    const accuracy = results.length ? Math.round((firstTryCorrect / results.length) * 100) : 0;
    return (
      <section className={styles.finishedPaper} aria-labelledby="practice-finished-title">
        <header className={styles.paperHeader}>
          <div className={styles.paperMark} aria-hidden="true">DE<br />A1.2</div>
          <div>
            <p className={styles.kicker}>ÜBUNGSBLATT · LEKTION 13–18</p>
            <h2 id="practice-finished-title">Seria zakończona</h2>
          </div>
          <div className={styles.scoreStamp}>{firstTryCorrect}/{results.length}</div>
        </header>

        <div className={styles.finishedBody}>
          <p className={styles.handwrittenResult}>{accuracy}% bez poprawki</p>
          <p>
            Każda pomyłka została zapisana. Zadanie przeszło dalej dopiero po wpisaniu
            poprawnej odpowiedzi z pamięci.
          </p>
          <div className={styles.finishedActions}>
            <button type="button" onClick={onLeave} className={styles.primaryButton}>
              Nowa seria
            </button>
            <Link href="/mistakes" className={styles.secondaryButton}>Historia błędów</Link>
          </div>
        </div>
      </section>
    );
  }

  const canSubmit = composedAnswer.trim().length > 0;

  function submit() {
    if (!canSubmit || status === 'wrong' || status === 'correct') return;
    const retrying = status === 'retry';
    const correct = recordAnswer(question, composedAnswer, retrying ? 'retry' : 'practice');
    if (correct) {
      setStatus('correct');
      if (!results.some((result) => result.questionId === question.id)) {
        setResults((current) => [
          ...current,
          { questionId: question.id, firstTryCorrect: wrongCount === 0 },
        ]);
      }
      return;
    }
    setWrongAnswer(composedAnswer);
    setWrongCount((current) => current + 1);
    setStatus('wrong');
  }

  function retry() {
    setAnswer('');
    setSelectedTokens([]);
    setStatus('retry');
  }

  function goNext() {
    if (status !== 'correct') return;
    setAnswer('');
    setSelectedTokens([]);
    setStatus('idle');
    setWrongCount(0);
    setWrongAnswer('');
    setIndex((current) => current + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <>
      <div className={styles.practiceToolbar}>
        <div>
          <strong>{index + 1} / {questions.length}</strong>
          <span>{scopeLabel} · zapis automatyczny</span>
        </div>
        <button type="button" onClick={onLeave}>Zmień serię</button>
      </div>

      <section className={styles.paper} aria-labelledby="exercise-title">
        <header className={styles.paperHeader}>
          <div className={styles.paperMark} aria-hidden="true">DE<br />A1.2</div>
          <div className={styles.headerIdentity}>
            <span>Vorname, NAME:</span>
            <span className={styles.nameLine} />
          </div>
          <div className={styles.paperMeta}>
            <span>Übungsserie</span>
            <strong>Lektion {question.lesson}</strong>
          </div>
          <div className={styles.paperTitle}>
            <strong>ÜBUNGSBLATT</strong>
            <span>{scopeLabel} · Aufgabe {index + 1} von {questions.length}</span>
          </div>
        </header>

        <div className={styles.progressTrack} aria-label="Postęp serii">
          <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>

        <main className={styles.exerciseBody}>
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="exercise-title">{skillLabels[question.skill]}</h2>
              <p>{question.topic}</p>
            </div>
            <span>/{question.difficulty + 1} P.</span>
          </div>
          <p className={styles.instruction}>{getInstruction(question)}</p>

          {question.audioText ? (
            <div className={styles.audioBox}>
              <AudioPrompt text={question.audioText} compact />
              <small>Sie können die Aufnahme mehrmals hören.</small>
            </div>
          ) : null}

          <div className={styles.questionBlock}>
            <span className={styles.questionNumber}>{index + 1}</span>
            <p className={styles.prompt}>{question.prompt}</p>
          </div>

          <div className={styles.answerArea}>
            {question.options ? (
              <div className={styles.optionList} role="radiogroup" aria-label="Wybierz odpowiedź">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={answer === option}
                    disabled={status === 'wrong' || status === 'correct'}
                    onClick={() => setAnswer(option)}
                    className={cn(styles.option, answer === option && styles.optionSelected)}
                  >
                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                    {option}
                  </button>
                ))}
              </div>
            ) : question.kind === 'order' ? (
              <div>
                <div className={styles.handwritingLine}>
                  {composedAnswer || <span>Hier entsteht Ihr Satz …</span>}
                </div>
                <div className={styles.tokenList}>
                  {question.tokens?.map((token, tokenIndex) => (
                    <button
                      key={`${token}-${tokenIndex}`}
                      type="button"
                      disabled={selectedTokens.includes(tokenIndex) || status === 'wrong' || status === 'correct'}
                      onClick={() => toggleToken(tokenIndex)}
                    >
                      {token}
                    </button>
                  ))}
                  {selectedTokens.length > 0 && status !== 'wrong' && status !== 'correct' ? (
                    <button type="button" onClick={() => setSelectedTokens([])} className={styles.clearButton}>
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
                <label htmlFor="practice-answer" className="sr-only">Twoja odpowiedź</label>
                <textarea
                  id="practice-answer"
                  value={answer}
                  disabled={status === 'wrong' || status === 'correct'}
                  onChange={(event) => setAnswer(event.target.value)}
                  autoFocus
                  autoComplete="off"
                  rows={question.kind === 'correction' || question.skill === 'writing' ? 3 : 2}
                  placeholder="Schreiben Sie hier …"
                  className={styles.paperInput}
                />
              </form>
            )}
          </div>

          {status === 'wrong' ? (
            <aside className={styles.teacherNote} role="alert">
              <X aria-hidden="true" />
              <div>
                <strong>{wrongCount === 1 ? 'Noch einmal.' : 'Vergleichen und noch einmal schreiben.'}</strong>
                {wrongCount === 1 ? (
                  <>
                    <p>{question.hint ?? `Zwróć uwagę na zagadnienie: ${question.topic}.`}</p>
                    <p className={styles.mutedNote}>Pełnej odpowiedzi jeszcze nie pokazuję.</p>
                  </>
                ) : (
                  <>
                    <p><span>Twoja odpowiedź:</span> {wrongAnswer || '—'}</p>
                    <p><span>Wzór:</span> {question.correctAnswer}</p>
                    <p>{question.explanation}</p>
                  </>
                )}
                <button type="button" onClick={retry} className={styles.retryButton}>
                  <RotateCcw aria-hidden="true" /> Popraw z pamięci
                </button>
              </div>
            </aside>
          ) : null}

          {status === 'retry' ? (
            <p className={styles.retryMessage}>Korrektur: wpisz teraz poprawną odpowiedź bez kopiowania.</p>
          ) : null}

          {status === 'correct' ? (
            <aside className={styles.correctNote} aria-live="polite">
              <Check aria-hidden="true" />
              <div>
                <strong>Richtig.</strong>
                <p>{question.explanation}</p>
                <small>Źródło materiału: {question.source.label}</small>
              </div>
            </aside>
          ) : null}

          {(status === 'idle' || status === 'retry') ? (
            <button type="button" onClick={submit} disabled={!canSubmit} className={styles.checkButton}>
              Sprawdź odpowiedź
            </button>
          ) : null}

          {status === 'correct' ? (
            <button type="button" onClick={goNext} className={styles.nextButton}>
              Następne zadanie <ArrowRight aria-hidden="true" />
            </button>
          ) : null}
        </main>

        <footer className={styles.paperFooter}>
          <span>GiE · individuelles Training</span>
          <span>Kap. 13–18</span>
        </footer>
      </section>
    </>
  );
}
