'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  ClipboardCheck,
  FileText,
  RotateCcw,
  Save,
} from 'lucide-react';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Callout } from 'fumadocs-ui/components/callout';
import { cn } from '@/lib/cn';
import { isCorrectAnswer } from '@/lib/study/engine';
import {
  matchingAnswerBank,
  mockQuestions,
  openMockTasks,
  paperTestSections,
  type OpenMockTask,
  type PaperTestSection,
} from '@/lib/study/mock';
import type { MockAttempt, StudyQuestion } from '@/lib/study/types';
import { AudioPrompt } from './audio-prompt';
import { StudyPageShell } from './page-shell';
import { RouteMap } from './index';
import { useStudyState } from './state-provider';
import { VoiceRecorder } from './voice-recorder';
import styles from './mock-test.module.css';

const DRAFT_KEY = 'deutsch-a1-2-paper-test-v3';

type MockDraft = {
  answers: Record<string, string>;
  openAnswers: Record<string, string>;
  completedOpen: Record<string, boolean>;
  candidateName: string;
};

const emptyDraft: MockDraft = {
  answers: {},
  openAnswers: {},
  completedOpen: {},
  candidateName: '',
};

const questionById = new Map(mockQuestions.map((question) => [question.id, question]));

function sectionNavLabel(title: string) {
  return title
    .replace('HÖRVERSTEHEN', 'HÖREN')
    .replace('LESEVERSTEHEN', 'LESEN')
    .replace('GRAMMATIK', 'GRAM.');
}

function getSectionQuestions(section: PaperTestSection) {
  return section.questionIds.map((id) => {
    const question = questionById.get(id);
    if (!question) throw new Error(`Missing paper question: ${id}`);
    return question;
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function normalizeDraft(value: unknown): MockDraft | null {
  if (!value || typeof value !== 'object') return null;
  const draft = value as Partial<MockDraft>;
  return {
    answers: draft.answers && typeof draft.answers === 'object' ? draft.answers : {},
    openAnswers:
      draft.openAnswers && typeof draft.openAnswers === 'object' ? draft.openAnswers : {},
    completedOpen:
      draft.completedOpen && typeof draft.completedOpen === 'object' ? draft.completedOpen : {},
    candidateName: typeof draft.candidateName === 'string' ? draft.candidateName : '',
  };
}

function OpenTaskVisual({ task }: { task: OpenMockTask }) {
  if (task.visual === 'map') return <RouteMap />;

  if (task.visual === 'photo') {
    return (
      <figure className="mt-5 overflow-hidden border border-neutral-300 bg-white">
        <Image
          src="/exam/office-health.svg"
          alt="Mężczyzna wykonuje ćwiczenia w biurze, a kobieta obserwuje go przy biurku."
          width={960}
          height={600}
          className="h-auto w-full"
        />
        <figcaption className="border-t border-neutral-300 px-4 py-2 text-xs text-neutral-600">
          Prüfungsbild: Beschreiben Sie zuerst, was Sie wirklich sehen.
        </figcaption>
      </figure>
    );
  }

  if (task.visual === 'calendar') {
    return (
      <div className="mt-5 overflow-hidden border border-neutral-300">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-100 text-xs uppercase tracking-wide text-neutral-600">
            <tr>
              <th className="border-b border-neutral-300 px-4 py-2 font-semibold">Tag</th>
              <th className="border-b border-neutral-300 px-4 py-2 font-semibold">Kalender</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border-b border-neutral-200 px-4 py-2 font-medium">Dienstag</td><td className="border-b border-neutral-200 px-4 py-2">10:00 Zahnarzt · Termin ändern</td></tr>
            <tr><td className="border-b border-neutral-200 px-4 py-2 font-medium">Mittwoch</td><td className="border-b border-neutral-200 px-4 py-2">ganztägig Kurs</td></tr>
            <tr><td className="px-4 py-2 font-medium">Donnerstag</td><td className="px-4 py-2">ab 14:00 frei</td></tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (task.visual === 'card') {
    return (
      <div className="mt-5 border border-neutral-300 bg-neutral-100 p-4 text-sm">
        <p className="text-xs font-bold tracking-[0.12em] uppercase">Situationskarte</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 leading-6">
          <li>seit zwei Wochen schlecht schlafen</li>
          <li>tagsüber müde sein</li>
          <li>abends drei koffeinhaltige Getränke trinken</li>
          <li>um Rat bitten und Empfehlung wiederholen</li>
        </ul>
      </div>
    );
  }

  if (task.visual === 'apartment') {
    return (
      <div className="mt-5 border border-neutral-300 bg-neutral-100 p-4 text-sm leading-7">
        <p className="font-bold">WG-ZIMMER IM ZENTRUM</p>
        <p>18 m² · möbliert · Balkon · 490 Euro inkl. NK</p>
      </div>
    );
  }

  return null;
}

type AnswerControlProps = {
  question: StudyQuestion;
  value: string;
  layout: PaperTestSection['layout'];
  number: number;
  onChange: (answer: string) => void;
};

function InlineGap({
  question,
  value,
  number,
  onChange,
}: Omit<AnswerControlProps, 'layout'>) {
  const [before, after = ''] = question.prompt.split('___');
  return (
    <label className={styles.inlineQuestion}>
      <span className={styles.questionNumber}>{number}</span>
      <span>{before}</span>
      {question.options ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`Odpowiedź do zadania ${number}`}
          className={styles.inlineSelect}
        >
          <option value="">—</option>
          {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`Odpowiedź do zadania ${number}`}
          autoComplete="off"
          className={styles.inlineInput}
        />
      )}
      <span>{after}</span>
    </label>
  );
}

function ChoiceControl({ question, value, number, onChange }: Omit<AnswerControlProps, 'layout'>) {
  return (
    <fieldset className="mt-3">
      <legend className="sr-only">Odpowiedź do zadania {number}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {question.options?.map((option, optionIndex) => (
          <label key={option} className={styles.choiceLabel}>
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="size-4 accent-neutral-900"
            />
            <span className="font-semibold">{String.fromCharCode(65 + optionIndex)}</span>
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function StandardQuestion({ question, value, layout, number, onChange }: AnswerControlProps) {
  if (layout === 'gaps' || layout === 'cloze') {
    return <InlineGap question={question} value={value} number={number} onChange={onChange} />;
  }

  if (layout === 'sentences') {
    return (
      <div className={styles.sentenceQuestion}>
        <div className="flex gap-3">
          <span className={styles.questionNumber}>{number}</span>
          <div className="min-w-0 flex-1">
            <p className="leading-6">{question.prompt}</p>
            {question.tokens ? (
              <p className="mt-1 text-xs italic text-neutral-600">{question.tokens.join(' – ')}</p>
            ) : null}
            <label>
              <span className="sr-only">Pełne zdanie do zadania {number}</span>
              <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                autoComplete="off"
                className={styles.sentenceInput}
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.blockQuestion}>
      <div className="flex gap-3">
        <span className={styles.questionNumber}>{number}</span>
        <p className="min-w-0 flex-1 whitespace-pre-line leading-6">{question.prompt}</p>
      </div>
      {question.options ? (
        <ChoiceControl question={question} value={value} number={number} onChange={onChange} />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`Odpowiedź do zadania ${number}`}
          autoComplete="off"
          className={styles.sentenceInput}
        />
      )}
    </div>
  );
}

function PaperSectionHeader({ section }: { section: PaperTestSection }) {
  return (
    <header className={styles.sectionHeader}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={`${section.id}-heading`}>{section.title}</h2>
        <span>{section.questionIds.length} Pkt.</span>
      </div>
      <p>{section.instruction}</p>
    </header>
  );
}

function ObjectivePaperSection({
  section,
  draft,
  updateAnswer,
}: {
  section: PaperTestSection;
  draft: MockDraft;
  updateAnswer: (questionId: string, answer: string) => void;
}) {
  const questions = getSectionQuestions(section);

  return (
    <section id={section.id} className={styles.paperSection} aria-labelledby={`${section.id}-heading`}>
      <PaperSectionHeader section={section} />

      {section.layout === 'cloze' && 'wordBank' in section ? (
        <div className={styles.wordBank} aria-label="Bank wyrazów">
          {section.wordBank.map((word) => <span key={word}>{word}</span>)}
        </div>
      ) : null}

      {section.layout === 'matching' ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.82fr)]">
          <div className="overflow-hidden border border-neutral-300">
            <table className={styles.matchingTable}>
              <tbody>
                {questions.map((question, index) => (
                  <tr key={question.id}>
                    <td>{index + 1}</td>
                    <th scope="row">{question.prompt}</th>
                    <td>
                      <label>
                        <span className="sr-only">Dopasowanie do zadania {index + 1}</span>
                        <select
                          value={draft.answers[question.id] ?? ''}
                          onChange={(event) => updateAnswer(question.id, event.target.value)}
                          className={styles.matchSelect}
                        >
                          <option value="">—</option>
                          {matchingAnswerBank.map((answer) => (
                            <option key={answer.code} value={answer.label}>{answer.code}</option>
                          ))}
                        </select>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-hidden border border-neutral-300 self-start">
            <table className={styles.answerBankTable}>
              <tbody>
                {matchingAnswerBank.map((answer) => (
                  <tr key={answer.code}>
                    <td>{answer.code}</td>
                    <td>{answer.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={cn(styles.questionList, section.layout === 'cloze' && styles.clozeText)}>
          {questions.map((question, index) => (
            <div key={question.id}>
              {section.layout === 'listening' && question.audioText ? (
                <AudioPrompt text={question.audioText} compact />
              ) : null}
              <StandardQuestion
                question={question}
                value={draft.answers[question.id] ?? ''}
                layout={section.layout}
                number={index + 1}
                onChange={(answer) => updateAnswer(question.id, answer)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function MockTest() {
  const { hydrated, recordAnswer, saveMockAttempt } = useStudyState();
  const [started, setStarted] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [draft, setDraft] = useState<MockDraft>(emptyDraft);
  const [result, setResult] = useState<MockAttempt | null>(null);
  const [rubricChecks, setRubricChecks] = useState<Record<string, number[]>>({});

  useEffect(() => {
    let timer: number | undefined;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      const saved = raw ? normalizeDraft(JSON.parse(raw)) : null;
      if (saved) {
        timer = window.setTimeout(() => {
          setDraft(saved);
          setResumed(true);
          setStarted(true);
        }, 0);
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!started) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Arkusz działa dalej także przy zablokowanej pamięci lokalnej.
    }
  }, [draft, started]);

  const objectiveSectionScores = useMemo(() => {
    const grouped = new Map<string, { correct: number; total: number }>();
    if (!result) return grouped;
    for (const section of paperTestSections) {
      const ids = new Set<string>(section.questionIds);
      const answers = result.answers.filter((answer) => ids.has(answer.questionId));
      grouped.set(section.id, {
        correct: answers.filter((answer) => answer.correct).length,
        total: answers.length,
      });
    }
    return grouped;
  }, [result]);

  const answeredCount = mockQuestions.filter(
    (question) => (draft.answers[question.id] ?? '').trim().length > 0,
  ).length;
  const openAnsweredCount = openMockTasks.filter((task) =>
    task.section === 'writing'
      ? (draft.openAnswers[task.id] ?? '').trim().length > 0
      : draft.completedOpen[task.id],
  ).length;
  const allComplete =
    answeredCount === mockQuestions.length && openAnsweredCount === openMockTasks.length;

  function updateAnswer(questionId: string, answer: string) {
    setDraft((current) => ({
      ...current,
      answers: { ...current.answers, [questionId]: answer },
    }));
  }

  function beginTest() {
    setStarted(true);
    window.setTimeout(() => window.scrollTo({ top: 0 }), 0);
  }

  function submitMock() {
    if (!allComplete) return;
    const createdAt = new Date().toISOString();
    const answers = mockQuestions.map((question) => {
      const answer = draft.answers[question.id] ?? '';
      const correct = isCorrectAnswer(question, answer);
      recordAnswer(question, answer, 'mock');
      return { questionId: question.id, answer, correct };
    });
    const attempt: MockAttempt = {
      id: `paper-test-${createdAt}`,
      createdAt,
      score: answers.filter((answer) => answer.correct).length,
      maxScore: answers.length,
      answers,
    };
    saveMockAttempt(attempt);
    setResult(attempt);
    setResumed(false);
    window.localStorage.removeItem(DRAFT_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetTest() {
    window.localStorage.removeItem(DRAFT_KEY);
    setDraft(emptyDraft);
    setResult(null);
    setRubricChecks({});
    setResumed(false);
    setStarted(false);
  }

  function toggleRubric(taskId: string, criterionIndex: number) {
    setRubricChecks((current) => {
      const selected = current[taskId] ?? [];
      const next = selected.includes(criterionIndex)
        ? selected.filter((index) => index !== criterionIndex)
        : [...selected, criterionIndex];
      return { ...current, [taskId]: next };
    });
  }

  if (result) {
    const incorrect = result.answers.filter((answer) => !answer.correct);
    const scorePercent = Math.round((result.score / result.maxScore) * 100);
    const openScore = openMockTasks.reduce(
      (score, task) => ({
        correct: score.correct + (rubricChecks[task.id]?.length ?? 0),
        total: score.total + task.checklist.length,
      }),
      { correct: 0, total: 0 },
    );

    return (
      <StudyPageShell
        eyebrow="Wynik digital paper test"
        title={`${result.score} / ${result.maxScore} pkt.`}
        description={`Próg zaliczenia: 60%. ${draft.candidateName ? `Arkusz: ${draft.candidateName}.` : ''}`}
      >
        <div className="max-w-4xl">
          <Callout
            type={scorePercent >= 60 ? 'success' : 'warning'}
            title={scorePercent >= 60 ? 'Próg zaliczenia osiągnięty' : 'Wróć do zaznaczonych obszarów'}
            className="my-0"
          >
            Zadania automatyczne: {scorePercent}%. Pisanie i mówienie oceń według 24 jawnych kryteriów poniżej.
          </Callout>

          <section className="mt-9" aria-labelledby="paper-result-heading">
            <div className="flex items-end justify-between gap-5 border-b-2 border-fd-foreground pb-3">
              <div>
                <p className="text-xs font-bold tracking-[0.15em] text-fd-muted-foreground uppercase">Auswertung</p>
                <h2 id="paper-result-heading" className="mt-1 text-xl font-bold">Wynik według bloków arkusza</h2>
              </div>
              <div className={styles.resultStamp}>{result.score}/{result.maxScore}</div>
            </div>
            <div className="divide-y divide-fd-border">
              {paperTestSections.map((section) => {
                const score = objectiveSectionScores.get(section.id) ?? { correct: 0, total: section.questionIds.length };
                const percent = score.total ? Math.round((score.correct / score.total) * 100) : 0;
                return (
                  <div key={section.id} className="grid items-center gap-3 py-4 sm:grid-cols-[12rem_1fr_auto]">
                    <span className="text-sm font-semibold">{section.title}</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-fd-muted" role="progressbar" aria-label={section.title} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full bg-fd-primary" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="min-w-14 text-right text-sm text-fd-muted-foreground">{score.correct}/{score.total}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="mt-7 flex flex-wrap gap-3 border-y border-fd-border py-5">
            <Link href="/mistakes" className="rounded-md bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground">
              {incorrect.length ? `Ćwicz błędy (${incorrect.length})` : 'Historia błędów'}
            </Link>
            <button type="button" onClick={resetTest} className="inline-flex items-center gap-2 rounded-md border border-fd-border px-4 py-2.5 text-sm font-medium hover:bg-fd-muted">
              <RotateCcw className="size-4" aria-hidden="true" /> Nowy arkusz
            </button>
          </div>

          <section className="mt-10" aria-labelledby="closed-feedback-heading">
            <h2 id="closed-feedback-heading" className="text-xl font-semibold">Odpowiedzi do poprawy</h2>
            {incorrect.length ? (
              <Accordions className="mt-4">
                {incorrect.map((item) => {
                  const question = questionById.get(item.questionId);
                  if (!question) return null;
                  const number = mockQuestions.findIndex((candidate) => candidate.id === item.questionId) + 1;
                  return (
                    <Accordion key={item.questionId} value={`result-${item.questionId}`} title={`Zadanie ${number} · Lektion ${question.lesson} · ${question.topic}`}>
                      <div className="space-y-4 text-sm">
                        <p className="font-medium leading-6">{question.prompt}</p>
                        <dl className="grid gap-3 sm:grid-cols-2">
                          <div><dt className="text-xs text-fd-muted-foreground">Twoja odpowiedź</dt><dd className="mt-1">{item.answer || '—'}</dd></div>
                          <div><dt className="text-xs text-fd-muted-foreground">Poprawnie</dt><dd className="mt-1 font-medium">{question.correctAnswer}</dd></div>
                        </dl>
                        <p className="leading-6 text-fd-muted-foreground">{question.explanation}</p>
                      </div>
                    </Accordion>
                  );
                })}
              </Accordions>
            ) : (
              <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <Check className="size-4" aria-hidden="true" /> Wszystkie 50 odpowiedzi są poprawne.
              </p>
            )}
          </section>

          <section className="mt-10" aria-labelledby="open-feedback-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="open-feedback-heading" className="text-xl font-semibold">Samoocena pisania i mówienia</h2>
                <p className="mt-2 text-sm text-fd-muted-foreground">Zaznacz tylko kryteria naprawdę widoczne lub słyszalne w odpowiedzi.</p>
              </div>
              <span className="text-sm font-semibold">{openScore.correct}/{openScore.total} kryteriów</span>
            </div>
            <div className="mt-5 space-y-6">
              {openMockTasks.map((task) => (
                <article key={task.id} className="border-t border-fd-border pt-5">
                  <h3 className="font-semibold">{task.label}</h3>
                  {task.section === 'writing' ? (
                    <blockquote className="mt-3 border-l-2 border-fd-border pl-4 text-sm leading-6 whitespace-pre-wrap">{draft.openAnswers[task.id]}</blockquote>
                  ) : null}
                  <div className="mt-4 grid gap-2">
                    {task.checklist.map((criterion, criterionIndex) => {
                      const checked = (rubricChecks[task.id] ?? []).includes(criterionIndex);
                      return (
                        <label key={criterion} className="flex min-h-10 cursor-pointer items-start gap-3 rounded-md border border-fd-border px-3 py-2 text-sm hover:bg-fd-muted/50">
                          <input type="checkbox" checked={checked} onChange={() => toggleRubric(task.id, criterionIndex)} className="mt-0.5 size-4 accent-fd-primary" />
                          <span>{criterion}</span>
                        </label>
                      );
                    })}
                  </div>
                  <details className="mt-4 text-sm">
                    <summary className="cursor-pointer font-medium">Pokaż model odpowiedzi</summary>
                    <p className="mt-3 border-l-2 border-fd-primary/40 pl-4 leading-6 text-fd-muted-foreground">{task.model}</p>
                  </details>
                </article>
              ))}
            </div>
          </section>
        </div>
      </StudyPageShell>
    );
  }

  if (!started) {
    return (
      <StudyPageShell
        eyebrow="Testy · Lektion 13–18"
        title="Digital paper test"
        description="Pełny arkusz wzorowany na układzie i typach zadań z Twoich testów."
      >
        <div className="max-w-4xl">
          <div className={styles.previewSheet}>
            <div className="flex flex-wrap items-start justify-between gap-5 border-b-2 border-neutral-900 pb-5">
              <div className="flex items-center gap-4">
                <div className={styles.previewMark}>DE<br />A1.2</div>
                <div>
                  <p className="text-xs font-bold tracking-[0.18em] text-neutral-500 uppercase">Kapitel 13–18</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">PRÜFUNGSTRAINING</h2>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-bold">Max. 50 P. + Selbstbewertung</p>
                <p className="mt-1 text-neutral-500">Bestehensgrenze: 60%</p>
              </div>
            </div>

            <dl className="mt-6 grid border-y border-neutral-300 sm:grid-cols-3 sm:divide-x sm:divide-neutral-300">
              <div className="px-4 py-4"><dt className="text-xs font-bold tracking-wide text-neutral-500 uppercase">Aufgaben</dt><dd className="mt-1 text-xl font-bold">50 + 6</dd></div>
              <div className="border-t border-neutral-300 px-4 py-4 sm:border-t-0"><dt className="text-xs font-bold tracking-wide text-neutral-500 uppercase">Zeit</dt><dd className="mt-1 text-xl font-bold">~70 Min.</dd></div>
              <div className="border-t border-neutral-300 px-4 py-4 sm:border-t-0"><dt className="text-xs font-bold tracking-wide text-neutral-500 uppercase">Umfang</dt><dd className="mt-1 text-xl font-bold">L13–18</dd></div>
            </dl>

            <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {paperTestSections.map((section) => (
                <div key={section.id} className="flex items-start justify-between gap-4 border-b border-neutral-300 pb-3">
                  <div>
                    <p className="font-bold">{section.title}</p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {section.layout === 'matching' ? 'tabela dopasowań A–L' : null}
                      {section.layout === 'cloze' ? 'tekst z bankiem wyrazów' : null}
                      {section.layout === 'listening' ? 'nagrania i wybór informacji' : null}
                      {section.layout === 'reading' ? 'Richtig/Falsch i wybór odpowiedzi' : null}
                      {section.layout === 'gaps' ? 'luki bezpośrednio w zdaniach' : null}
                      {section.layout === 'sentences' ? 'budowanie i poprawianie zdań' : null}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold">{section.questionIds.length} P.</span>
                </div>
              ))}
            </div>

            <div className="mt-7 border border-neutral-300 bg-neutral-100 p-4">
              <p className="text-xs font-bold tracking-[0.12em] uppercase">Zasady arkusza</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 sm:grid-cols-2 sm:gap-x-8">
                <li>• odpowiedzi zapisują się automatycznie</li>
                <li>• brak feedbacku przed oddaniem</li>
                <li>• słuchanie obejmuje każdą lekcję</li>
                <li>• pisanie i mówienie mają jawne kryteria</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              disabled={!hydrated}
              onClick={beginTest}
              className="inline-flex min-h-12 items-center gap-2 rounded-md bg-fd-primary px-5 text-sm font-medium text-fd-primary-foreground disabled:opacity-45"
            >
              <ClipboardCheck className="size-4" aria-hidden="true" /> Rozpocznij arkusz
            </button>
            <Link href="/study" className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-medium text-fd-muted-foreground hover:text-fd-foreground">
              <ArrowLeft className="size-4" aria-hidden="true" /> Wróć do planu
            </Link>
          </div>
        </div>
      </StudyPageShell>
    );
  }

  const missingClosed = mockQuestions.length - answeredCount;
  const missingOpen = openMockTasks.length - openAnsweredCount;
  const today = formatDate(new Date().toISOString());

  return (
    <StudyPageShell
      className={styles.testShell}
      eyebrow="Test w toku"
      title="Digital paper test"
      description={resumed ? 'Przywrócono automatycznie zapisany arkusz.' : 'Wpisuj odpowiedzi bezpośrednio w cyfrową kartę.'}
    >
      <div className={styles.examToolbar}>
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate text-xs font-medium text-fd-muted-foreground">
            <Save className="size-3.5" aria-hidden="true" /> Zapis lokalny aktywny
          </p>
          <p className="mt-1 text-sm font-semibold">
            <span className="hidden sm:inline">{answeredCount}/{mockQuestions.length} odpowiedzi · {openAnsweredCount}/{openMockTasks.length} zadań otwartych</span>
            <span className="sm:hidden">{answeredCount}/{mockQuestions.length} · otwarte {openAnsweredCount}/{openMockTasks.length}</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={resetTest} className="min-h-10 rounded-md border border-fd-border px-3 text-sm font-medium hover:bg-fd-muted">Przerwij</button>
          <button type="button" onClick={submitMock} disabled={!allComplete} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground disabled:cursor-not-allowed disabled:opacity-45">
            <ClipboardCheck className="size-4" aria-hidden="true" /> Oddaj
          </button>
        </div>
      </div>

      <nav className={styles.sectionNav} aria-label="Sekcje arkusza">
        {paperTestSections.map((section) => {
          const done = section.questionIds.filter((id) => (draft.answers[id] ?? '').trim()).length;
          return <a key={section.id} href={`#${section.id}`}>{sectionNavLabel(section.title)} <span>{done}/{section.questionIds.length}</span></a>;
        })}
        <a href="#schreiben">SCHREIBEN</a>
        <a href="#sprechen">SPRECHEN</a>
      </nav>

      <div className={styles.paper}>
        <header className={styles.paperHeader}>
          <div className={styles.paperMark}>DE<br />A1.2</div>
          <div className={styles.nameField}>
            <label htmlFor="candidate-name">Vorname, NAME:</label>
            <input id="candidate-name" value={draft.candidateName} onChange={(event) => setDraft((current) => ({ ...current, candidateName: event.target.value }))} autoComplete="name" />
          </div>
          <div className={styles.paperMeta}>
            <span>{today}</span>
            <strong>Kap. 13–18</strong>
          </div>
          <div className={styles.paperTitle}>
            <p>DEUTSCH · PRÜFUNGSTRAINING</p>
            <span>Punkte: ____ / 50 &nbsp; (60%)</span>
          </div>
        </header>

        {paperTestSections.map((section) => (
          <ObjectivePaperSection key={section.id} section={section} draft={draft} updateAnswer={updateAnswer} />
        ))}

        <section id="schreiben" className={styles.paperSection}>
          <header className={styles.sectionHeader}>
            <div className="flex items-baseline justify-between gap-4"><h2>SCHREIBEN</h2><span>2 Aufgaben</span></div>
            <p>Schreiben Sie beide Texte. Antworten Sie auf jeden Inhaltspunkt.</p>
          </header>
          <div className="mt-5 space-y-10">
            {openMockTasks.filter((task) => task.section === 'writing').map((task, index) => (
              <article key={task.id} className={styles.openTask}>
                <div className="flex gap-3"><span className={styles.questionNumber}>{index + 1}</span><div><h3 className="font-bold">{task.label.replace('Pisanie · ', '')}</h3><p className="mt-2 text-sm leading-6">{task.prompt}</p></div></div>
                <OpenTaskVisual task={task} />
                <label className="mt-5 block">
                  <span className="sr-only">Odpowiedź: {task.label}</span>
                  <textarea value={draft.openAnswers[task.id] ?? ''} onChange={(event) => setDraft((current) => ({ ...current, openAnswers: { ...current.openAnswers, [task.id]: event.target.value } }))} rows={9} className={styles.paperTextarea} placeholder="Schreiben Sie hier…" />
                </label>
              </article>
            ))}
          </div>
        </section>

        <section id="sprechen" className={styles.paperSection}>
          <header className={styles.sectionHeader}>
            <div className="flex items-baseline justify-between gap-4"><h2>SPRECHEN</h2><span>4 Aufgaben</span></div>
            <p>Sprechen Sie frei. Nehmen Sie Ihre Antwort auf oder markieren Sie die Aufgabe nach der mündlichen Antwort.</p>
          </header>
          <div className="mt-5 space-y-10">
            {openMockTasks.filter((task) => task.section === 'speaking').map((task, index) => {
              const complete = Boolean(draft.completedOpen[task.id]);
              return (
                <article key={task.id} className={styles.openTask}>
                  <div className="flex gap-3"><span className={styles.questionNumber}>{index + 1}</span><div><h3 className="font-bold">{task.label.replace('Mówienie · ', '')}</h3><p className="mt-2 text-sm leading-6">{task.prompt}</p></div></div>
                  <OpenTaskVisual task={task} />
                  <VoiceRecorder />
                  <button type="button" aria-pressed={complete} onClick={() => setDraft((current) => ({ ...current, completedOpen: { ...current.completedOpen, [task.id]: !complete } }))} className={cn(styles.completeButton, complete && styles.completeButtonActive)}>
                    {complete ? <Check className="size-4" aria-hidden="true" /> : <FileText className="size-4" aria-hidden="true" />}
                    {complete ? 'Aufgabe gemacht' : 'Odpowiedziałem/am na głos'}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <footer className={styles.paperFooter}>
          <span>Digital Paper Test · Momente A1.2</span>
          <span>Kapitel 13–18</span>
        </footer>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-fd-border py-5">
        <p className="text-sm text-fd-muted-foreground">
          {allComplete ? 'Arkusz jest kompletny i gotowy do oddania.' : `Pozostało: ${missingClosed} odpowiedzi i ${missingOpen} zadań otwartych.`}
        </p>
        <button type="button" onClick={submitMock} disabled={!allComplete} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-5 text-sm font-medium text-fd-primary-foreground disabled:cursor-not-allowed disabled:opacity-45">
          <ClipboardCheck className="size-4" aria-hidden="true" /> Oddaj cały arkusz
        </button>
      </div>
    </StudyPageShell>
  );
}
