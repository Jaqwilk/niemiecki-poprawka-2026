'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, ClipboardCheck, RotateCcw } from 'lucide-react';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { sprintDays, lessonTitles } from '@/lib/study/schedule';
import { useStudyState } from './state-provider';
import { StudyPageShell } from './page-shell';

export function StudyDashboard() {
  const { state, hydrated, setActiveDay, startSprint } = useStudyState();
  const day = sprintDays[state.activeDay - 1];
  const openMistakes = state.mistakes
    .filter((mistake) => mistake.status === 'open')
    .sort((a, b) => b.mistakeCount - a.mistakeCount);
  const weakTopics = [...new Set(openMistakes.map((mistake) => mistake.topic))].slice(0, 3);
  const lastMock = state.mockAttempts[0];
  const lessonProgress = day.lessons.length
    ? Math.round(
        day.lessons.reduce((sum, lesson) => sum + (state.lessonProgress[lesson] ?? 0), 0) /
          day.lessons.length,
      )
    : 0;
  const continueHref =
    state.activeDay <= 3
      ? `/docs/lessons/${day.lessons.find((lesson) => (state.lessonProgress[lesson] ?? 0) < 100) ?? day.lessons[0]}`
      : state.activeDay === 4
        ? '/practice'
        : '/test';

  return (
    <StudyPageShell
      eyebrow="Momente A1.2 · Lektion 13–18"
      title="Niemiecki. Pięć dni."
      description="Spokojny plan: naucz się, przypomnij, przećwicz i popraw każdy błąd."
    >
      <section aria-labelledby="day-heading">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm text-fd-muted-foreground">Dzień {state.activeDay} z 5</p>
            <h2 id="day-heading" className="mt-1 text-2xl font-semibold tracking-tight">
              {day.title}
            </h2>
          </div>
          <div className="flex gap-1" aria-label="Wybierz dzień planu">
            {sprintDays.map((item) => (
              <button
                key={item.day}
                type="button"
                onClick={() => setActiveDay(item.day)}
                aria-label={`Dzień ${item.day}: ${item.title}`}
                aria-pressed={state.activeDay === item.day}
                className="grid size-9 place-items-center rounded-md border border-fd-border text-sm font-medium transition-colors hover:bg-fd-muted aria-pressed:border-fd-primary aria-pressed:bg-fd-primary aria-pressed:text-fd-primary-foreground"
              >
                {item.day}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-4 text-xs text-fd-muted-foreground">
          <span>Postęp materiału dnia</span>
          <span>{lessonProgress}%</span>
        </div>
        <div
          className="mt-2 h-1 overflow-hidden rounded-full bg-fd-muted"
          role="progressbar"
          aria-label="Postęp materiału dnia"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={lessonProgress}
        >
          <div className="h-full bg-fd-primary transition-[width]" style={{ width: `${lessonProgress}%` }} />
        </div>

        <div className="mt-8 grid gap-8 border-y border-fd-border py-7 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-fd-muted-foreground uppercase">
              Dzisiaj
            </p>
            {day.lessons.length < 6 ? (
              <ul className="mt-4 space-y-3">
                {day.lessons.map((lesson) => (
                  <li key={lesson}>
                    <Link
                      href={`/docs/lessons/${lesson}`}
                      className="group flex items-center justify-between gap-4 text-sm"
                    >
                      <span>
                        <strong className="font-semibold">Lektion {lesson}</strong>
                        <span className="ml-2 text-fd-muted-foreground">{lessonTitles[lesson]}</span>
                      </span>
                      <span className="text-xs text-fd-muted-foreground group-hover:text-fd-foreground">
                        {state.lessonProgress[lesson] ?? 0}%
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 max-w-md text-sm leading-6 text-fd-muted-foreground">
                {state.activeDay === 4
                  ? 'Mieszaj wszystkie lekcje. Najpierw otwarte błędy, potem najsłabsze tematy.'
                  : 'Zrób pełną próbę bez podpowiedzi. Po oddaniu popraw każdy błąd.'}
              </p>
            )}
          </div>
          <dl className="grid grid-cols-3 gap-5 text-sm sm:min-w-64">
            <div>
              <dt className="text-fd-muted-foreground">Powtórka</dt>
              <dd className="mt-1 font-semibold">{day.reviewMinutes} min</dd>
            </div>
            <div>
              <dt className="text-fd-muted-foreground">Nauka</dt>
              <dd className="mt-1 font-semibold">{day.learnMinutes} min</dd>
            </div>
            <div>
              <dt className="text-fd-muted-foreground">Praktyka</dt>
              <dd className="mt-1 font-semibold">{day.practiceMinutes} min</dd>
            </div>
          </dl>
        </div>

        <Callout type="idea" title="Cel dnia" className="mt-6">
          <ul className="grid gap-1 sm:grid-cols-3">
            {day.focus.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </Callout>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {!state.sprintStartedAt && hydrated ? (
            <button
              type="button"
              onClick={startSprint}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-fd-border px-4 text-sm font-medium hover:bg-fd-muted"
            >
              Zacznij sprint
            </button>
          ) : null}
          <Link
            href={continueHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground"
          >
            Kontynuuj <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="priority-heading">
        <h2 id="priority-heading" className="text-sm font-semibold">Co dalej</h2>
        <Cards className="mt-4">
          <Card
            href="/mistakes"
            icon={<RotateCcw aria-hidden="true" />}
            title={`Błędy · ${hydrated ? openMistakes.length : '—'}`}
            description={
              openMistakes.length > 0
                ? 'Popraw najpierw to, co nadal nie jest odtwarzane z pamięci.'
                : 'Brak otwartych błędów. Historia popraw pozostaje zapisana.'
            }
          />
          <Card
            href="/practice"
            icon={<BookOpen aria-hidden="true" />}
            title="Słabe obszary"
            description={
              weakTopics.length > 0
                ? weakTopics.join(' · ')
                : 'Pojawią się po pierwszych odpowiedziach — bez wymyślonych statystyk.'
            }
          />
          <Card
            href="/test"
            icon={<ClipboardCheck aria-hidden="true" />}
            title="Próba generalna"
            description={
              lastMock
                ? `Ostatni wynik: ${lastMock.score}/${lastMock.maxScore}.`
                : '20 zadań zamkniętych oraz pisanie i mówienie.'
            }
          />
        </Cards>
      </section>
    </StudyPageShell>
  );
}
