'use client';

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, Check, Copy, CornerDownLeft, RotateCcw, Send, Sparkles, Square, Trash2, X } from 'lucide-react';
import {
  MAX_TUTOR_RETRIES,
  readTutorFailure,
  shouldRetryTutorRequest,
  tutorNetworkErrorMessage,
  tutorRetryDelay,
  waitForTutorRetry,
} from '@/lib/ai/tutor-client';
import { useStudyState } from './state-provider';
import { TutorMarkdown } from './tutor-markdown';
import styles from './tutor.module.css';

const EditModePanel = lazy(() =>
  import('./edit-mode-panel').then((module) => ({ default: module.EditModePanel })),
);

type SelectionContext = {
  selectedText: string;
  surroundingText: string;
  heading: string;
  route: string;
  lesson: number | null;
};

type TutorMessage = {
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  tier?: string;
  stopped?: boolean;
};

const emptyContext: SelectionContext = {
  selectedText: '',
  surroundingText: '',
  heading: '',
  route: '',
  lesson: null,
};

function inferLesson(pathname: string) {
  const match = pathname.match(/\/lessons\/(1[3-8])(?:\/|$)/);
  return match ? Number(match[1]) : null;
}

const thinkingSteps = ['Czytam notatki kursu', 'Łączę reguły i przykłady', 'Układam prostą odpowiedź'];

function TutorThinking({ retryAttempt }: { retryAttempt: number }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStep((current) => Math.min(current + 1, thinkingSteps.length - 1));
    }, 1500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div role="status" aria-live="polite" className="rounded-2xl rounded-tl-sm border border-fd-border bg-fd-card px-3.5 py-3 shadow-sm">
      <div className="flex items-center gap-2.5 text-xs font-medium text-fd-muted-foreground">
        <span>{retryAttempt > 0 ? `Połączenie przerwane — ponawiam (${retryAttempt}/${MAX_TUTOR_RETRIES})` : thinkingSteps[step]}</span>
        <span className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className={`${styles.thinkingDot} size-1 rounded-full bg-fd-primary`} />
          ))}
        </span>
      </div>
      <span className="sr-only">Tutor przygotowuje odpowiedź.</span>
    </div>
  );
}

function modelName(tier?: string) {
  if (tier === 'smart') return 'Sol';
  if (tier === 'fast') return 'Luna';
  if (tier === 'default') return 'Terra';
  return '';
}

function copyTextFallback(text: string) {
  const textarea = document.createElement('textarea');
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  const copied = document.execCommand('copy');
  textarea.remove();
  activeElement?.focus();
  return copied;
}

function getSelectionContext(pathname: string): { context: SelectionContext; rect: DOMRect } | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
  const selectedText = selection.toString().replace(/\s+/g, ' ').trim();
  if (selectedText.length < 3 || selectedText.length > 1800) return null;
  const anchor = selection.anchorNode instanceof Element ? selection.anchorNode : selection.anchorNode?.parentElement;
  if (!anchor || anchor.closest('input, textarea, [data-tutor-ui]')) return null;
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!rect.width && !rect.height) return null;
  const paragraph = anchor.closest('p, li, td, blockquote');
  const surroundingText = paragraph?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 2200) ?? '';
  const headings = [...document.querySelectorAll<HTMLElement>('h1, h2, h3')];
  const heading = [...headings]
    .reverse()
    .find((candidate) => candidate.getBoundingClientRect().top <= rect.top + 4)
    ?.textContent?.trim().slice(0, 180) ?? '';
  return {
    rect,
    context: { selectedText, surroundingText, heading, route: pathname, lesson: inferLesson(pathname) },
  };
}

export function StudyTutor() {
  const pathname = usePathname();
  const { state } = useStudyState();
  const editModeAvailable = process.env.NEXT_PUBLIC_EDIT_MODE_ENABLED === 'true';
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'study' | 'edit'>('study');
  const [selectionContext, setSelectionContext] = useState<SelectionContext>(emptyContext);
  const [selectionButton, setSelectionButton] = useState<{ left: number; top: number } | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [error, setError] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [copiedMessage, setCopiedMessage] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesViewportRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const close = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setOpen(false);
    setLoading(false);
    setRetryAttempt(0);
    setMessages((current) => {
      const last = current.at(-1);
      return last?.role === 'assistant' && !last.text ? current.slice(0, -1) : current;
    });
  }, []);

  useEffect(() => {
    function openFromNavigation() {
      setOpen(true);
      setMode('study');
      setSelectionContext((current) => ({
        ...current,
        route: pathname,
        lesson: inferLesson(pathname),
        selectedText: '',
        surroundingText: '',
      }));
    }
    window.addEventListener('study:tutor-open', openFromNavigation);
    return () => window.removeEventListener('study:tutor-open', openFromNavigation);
  }, [pathname]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSelectionButton(null);
      setSelectionContext((current) => ({
        ...current,
        route: pathname,
        lesson: inferLesson(pathname),
        selectedText: '',
        surroundingText: '',
        heading: '',
      }));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    function updateSelection() {
      window.setTimeout(() => {
        const result = getSelectionContext(pathname);
        if (!result) {
          setSelectionButton(null);
          return;
        }
        setSelectionContext(result.context);
        setSelectionButton({
          left: Math.max(12, Math.min(window.innerWidth - 116, result.rect.left + result.rect.width / 2 - 48)),
          top: Math.max(12, result.rect.top - 44),
        });
      }, 0);
    }
    document.addEventListener('selectionchange', updateSelection);
    window.addEventListener('resize', updateSelection);
    return () => {
      document.removeEventListener('selectionchange', updateSelection);
      window.removeEventListener('resize', updateSelection);
    };
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        setOpen(true);
        setMode('study');
      }
      if (event.key === 'Escape' && open) close();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, open]);

  useEffect(() => {
    if (open && mode === 'study') window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [mode, open]);

  useEffect(() => {
    if (!open || mode !== 'study' || !shouldAutoScrollRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: loading ? 'auto' : 'smooth', block: 'end' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, messages, mode, open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function stopAnswer() {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setRetryAttempt(0);
    setMessages((current) => {
      const last = current.at(-1);
      if (last?.role !== 'assistant') return current;
      if (!last.text) return current.slice(0, -1);
      return [...current.slice(0, -1), { ...last, stopped: true }];
    });
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function clearConversation() {
    stopAnswer();
    setMessages([]);
    setError('');
    setQuestion('');
    setLastQuestion('');
    setRetryAttempt(0);
    setCopiedMessage(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function ask(override?: string, options?: { retry?: boolean }) {
    const value = (override ?? question).trim();
    if (!value || loading) return;
    const conversation = options?.retry && messages.at(-1)?.role === 'user'
      ? messages.slice(0, -1)
      : messages;
    setError('');
    setQuestion('');
    setLastQuestion(value);
    setLoading(true);
    setRetryAttempt(0);
    shouldAutoScrollRef.current = true;
    const userMessage: TutorMessage = { role: 'user', text: value };
    setMessages([...conversation, userMessage, { role: 'assistant', text: '' }]);
    const controller = new AbortController();
    abortRef.current = controller;
    const weakTopics = state.mistakes
      .filter((mistake) => mistake.status === 'open')
      .sort((a, b) => b.mistakeCount - a.mistakeCount)
      .slice(0, 5)
      .map((mistake) => mistake.topic);

    try {
      const body = JSON.stringify({
        question: value,
        context: {
          ...selectionContext,
          route: pathname,
          lesson: selectionContext.lesson ?? inferLesson(pathname),
          weakTopics,
        },
        history: conversation.slice(-6),
      });
      let response: Response | null = null;

      for (let attempt = 0; attempt <= MAX_TUTOR_RETRIES; attempt += 1) {
        try {
          response = await fetch('/api/tutor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body,
          });
        } catch (caught) {
          if (controller.signal.aborted) throw caught;
          if (attempt >= MAX_TUTOR_RETRIES || !navigator.onLine) {
            throw new Error(tutorNetworkErrorMessage(navigator.onLine));
          }
          setRetryAttempt(attempt + 1);
          await waitForTutorRetry(tutorRetryDelay(attempt), controller.signal);
          continue;
        }

        if (response.ok) break;
        const failure = await readTutorFailure(response);
        if (!shouldRetryTutorRequest(response.status, attempt, failure.offline)) {
          throw new Error(failure.message);
        }
        setRetryAttempt(attempt + 1);
        await waitForTutorRetry(tutorRetryDelay(attempt), controller.signal);
      }
      if (!response?.ok) throw new Error(tutorNetworkErrorMessage(navigator.onLine));
      setRetryAttempt(0);
      if (!response.body) throw new Error('Serwer nie zwrócił strumienia odpowiedzi.');
      const source = response.headers.get('X-Study-Source') ?? undefined;
      const tier = response.headers.get('X-Model-Tier') ?? undefined;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let receivedText = '';

      function appendDelta(delta: string) {
        if (!delta) return;
        receivedText += delta;
        setMessages((current) => {
          const last = current.at(-1);
          if (last?.role !== 'assistant') return current;
          return [
            ...current.slice(0, -1),
            { ...last, text: `${last.text}${delta}`, source, tier },
          ];
        });
      }

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        appendDelta(decoder.decode(chunk, { stream: true }));
      }
      appendDelta(decoder.decode());
      if (!receivedText.trim()) {
        throw new Error('Tutor zwrócił pustą odpowiedź. Pytanie jest zachowane — spróbuj ponownie.');
      }
    } catch (caught) {
      if (controller.signal.aborted) return;
      const message = caught instanceof Error && !(caught instanceof TypeError)
        ? caught.message
        : tutorNetworkErrorMessage(navigator.onLine);
      setError(message);
      setMessages((current) => (current.at(-1)?.role === 'assistant' ? current.slice(0, -1) : current));
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
        setRetryAttempt(0);
        abortRef.current = null;
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  }

  async function copyAnswer(index: number, text: string) {
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }
    if (!copied) copied = copyTextFallback(text);
    if (!copied) return;
    setCopiedMessage(index);
    window.setTimeout(() => setCopiedMessage((current) => (current === index ? null : current)), 1600);
  }

  return (
    <>
      {selectionButton ? (
        <button
          type="button"
          data-tutor-ui
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setOpen(true);
            setMode('study');
            setSelectionButton(null);
          }}
          style={{ left: selectionButton.left, top: selectionButton.top }}
          className="fixed z-50 inline-flex min-h-8 items-center gap-1.5 rounded-md border border-fd-border bg-fd-background px-2.5 text-xs font-medium shadow-sm hover:bg-fd-muted"
        >
          <Sparkles className="size-3.5" aria-hidden="true" /> Zapytaj AI
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50" data-tutor-ui>
          <button
            type="button"
            aria-label="Zamknij panel"
            onClick={close}
            className={`${styles.backdrop} absolute inset-0 bg-black/20 backdrop-blur-[2px]`}
          />
          <aside
            role="dialog"
            aria-modal="true"
            className={`${styles.panel} absolute inset-y-0 right-0 flex w-full max-w-[34rem] flex-col border-l border-fd-border bg-fd-background shadow-2xl`}
            aria-label="Korepetytor AI"
          >
            <header className="flex min-h-16 items-center justify-between border-b border-fd-border bg-fd-background/92 px-4 py-3 backdrop-blur">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative grid size-9 shrink-0 place-items-center rounded-xl border border-fd-border bg-fd-muted text-fd-foreground">
                  <Sparkles className="size-4" aria-hidden="true" />
                  <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-fd-background bg-emerald-500" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Prywatny tutor</p>
                  <p className="mt-0.5 truncate text-[10px] text-fd-muted-foreground">Momente A1.2 · oparte na notatkach</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearConversation}
                    className="grid size-9 place-items-center rounded-md hover:bg-fd-muted"
                    aria-label="Wyczyść rozmowę"
                    title="Wyczyść rozmowę"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
                <button type="button" onClick={close} className="grid size-9 place-items-center rounded-md hover:bg-fd-muted" aria-label="Zamknij">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </header>

            {editModeAvailable ? (
              <div className="flex border-b border-fd-border px-4" role="tablist" aria-label="Tryb tutora">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'study'}
                  onClick={() => setMode('study')}
                  className="border-b-2 border-transparent px-3 py-2.5 text-xs font-medium text-fd-muted-foreground aria-selected:border-fd-primary aria-selected:text-fd-foreground"
                >
                  Nauka · tylko odczyt
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'edit'}
                  onClick={() => setMode('edit')}
                  className="border-b-2 border-transparent px-3 py-2.5 text-xs font-medium text-fd-muted-foreground aria-selected:border-fd-primary aria-selected:text-fd-foreground"
                >
                  Edit Mode
                </button>
              </div>
            ) : null}

            {mode === 'edit' ? (
              <Suspense
                fallback={
                  <div className="flex-1 p-4 text-xs text-fd-muted-foreground" role="status">
                    Wczytuję Edit Mode…
                  </div>
                }
              >
                <EditModePanel />
              </Suspense>
            ) : (
              <>
                <div
                  ref={messagesViewportRef}
                  onScroll={(event) => {
                    const viewport = event.currentTarget;
                    shouldAutoScrollRef.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 96;
                  }}
                  className="flex-1 overflow-y-auto overscroll-contain px-4 py-5"
                >
                  {selectionContext.selectedText ? (
                    <div className="mb-5 rounded-xl border border-fd-border bg-fd-muted/35 p-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.13em] text-fd-muted-foreground uppercase">
                        <Sparkles className="size-3" aria-hidden="true" />
                        Zaznaczenie{selectionContext.lesson ? ` · Lektion ${selectionContext.lesson}` : ''}
                      </div>
                      <p className="mt-1.5 line-clamp-4 text-xs leading-5 text-fd-muted-foreground">{selectionContext.selectedText}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {[
                          ['Wyjaśnij', 'Wyjaśnij ten fragment prosto.'],
                          ['Dlaczego?', 'Dlaczego ta forma jest poprawna?'],
                          ['Przykład', 'Podaj jeden podobny przykład.'],
                          ['Sprawdź mnie', 'Ułóż jedno krótkie pytanie sprawdzające ten fragment.'],
                        ].map(([label, value]) => (
                          <button
                            key={label}
                            type="button"
                            disabled={loading}
                            onClick={() => ask(value)}
                            className="rounded-md border border-fd-border bg-fd-background px-2 py-1 text-[11px] hover:bg-fd-muted disabled:opacity-45"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messages.length === 0 ? (
                    <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center py-8 text-center">
                      <div className="mx-auto grid size-11 place-items-center rounded-2xl border border-fd-border bg-fd-muted/60">
                        <Bot className="size-5 text-fd-foreground" aria-hidden="true" />
                      </div>
                      <p className="mt-4 text-sm font-semibold">O co chcesz zapytać?</p>
                      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-fd-muted-foreground">
                        Wyjaśnię regułę, porównam formy albo sprawdzę Twoją odpowiedź na podstawie materiału.
                      </p>
                      <div className="mt-5 grid gap-2 text-left">
                        {[
                          'Wyjaśnij mi Dativ bardzo prosto.',
                          'Przetestuj mnie z Lektion 16.',
                          'Porównaj sollen i wollen w tabeli.',
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => ask(suggestion)}
                            className="rounded-xl border border-fd-border bg-fd-card px-3 py-2.5 text-xs leading-5 text-fd-foreground transition-colors hover:bg-fd-muted"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5" aria-live="polite" aria-relevant="additions text">
                      {messages.map((message, index) => {
                        const isLast = index === messages.length - 1;
                        const thinking = message.role === 'assistant' && loading && isLast && !message.text;
                        const streaming = message.role === 'assistant' && loading && isLast && Boolean(message.text);

                        if (message.role === 'user') {
                          return (
                            <div key={`${message.role}-${index}`} className={`${styles.message} flex justify-end pl-10`}>
                              <div className="max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-fd-primary px-3.5 py-2.5 text-sm leading-6 text-fd-primary-foreground [overflow-wrap:anywhere]">
                                {message.text}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={`${message.role}-${index}`} className={`${styles.message} flex min-w-0 items-start gap-2.5`}>
                            <div className="relative mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-fd-border bg-fd-muted text-fd-foreground">
                              {thinking ? <span className={`${styles.thinkingGlow} absolute inset-0 rounded-lg bg-fd-primary/25`} aria-hidden="true" /> : null}
                              <Bot className="relative size-3.5" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              {thinking ? (
                                <TutorThinking retryAttempt={retryAttempt} />
                              ) : (
                                <div className="min-w-0 rounded-2xl rounded-tl-sm border border-fd-border bg-fd-card px-3.5 py-3 shadow-sm">
                                  <TutorMarkdown>{message.text}</TutorMarkdown>
                                  {streaming ? <span className={styles.streamingCaret} aria-hidden="true" /> : null}
                                </div>
                              )}

                              {message.text ? (
                                <div className="mt-1.5 flex min-h-7 items-center justify-between gap-2 px-1 text-[10px] text-fd-muted-foreground">
                                  <span className="flex min-w-0 items-center gap-1.5 truncate">
                                    <Sparkles className="size-3 shrink-0" aria-hidden="true" />
                                    {message.stopped
                                      ? 'Odpowiedź zatrzymana'
                                      : `${message.source?.includes('file-search') ? 'Notatki + file search' : 'Notatki kursu'}${modelName(message.tier) ? ` · ${modelName(message.tier)}` : ''}`}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => copyAnswer(index, message.text)}
                                    className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-fd-muted hover:text-fd-foreground"
                                    aria-label={copiedMessage === index ? 'Skopiowano odpowiedź' : 'Kopiuj odpowiedź'}
                                    title={copiedMessage === index ? 'Skopiowano' : 'Kopiuj'}
                                  >
                                    {copiedMessage === index ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {error ? (
                    <div role="alert" className="mt-4 rounded-xl border border-red-500/25 bg-red-500/8 p-3 text-xs leading-5 text-red-700 dark:text-red-300">
                      <p>{error}</p>
                      {lastQuestion ? (
                        <button
                          type="button"
                          onClick={() => ask(lastQuestion, { retry: true })}
                          className="mt-2 inline-flex items-center gap-1.5 font-medium underline underline-offset-2"
                        >
                          <RotateCcw className="size-3" aria-hidden="true" /> Spróbuj ponownie
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  <div ref={messagesEndRef} aria-hidden="true" />
                </div>

                <form
                  className="border-t border-fd-border bg-fd-background/92 p-3 backdrop-blur sm:p-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    ask();
                  }}
                >
                  <div className="rounded-xl border border-fd-border bg-fd-card p-2 shadow-sm transition-shadow focus-within:border-fd-primary/70 focus-within:ring-2 focus-within:ring-fd-ring/25">
                    <label htmlFor="tutor-question" className="sr-only">Pytanie do tutora</label>
                    <textarea
                      ref={inputRef}
                      id="tutor-question"
                      rows={2}
                      maxLength={1200}
                      value={question}
                      disabled={loading}
                      onChange={(event) => setQuestion(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                          event.preventDefault();
                          ask();
                        }
                      }}
                      className="w-full resize-none bg-transparent px-1.5 py-1 text-sm leading-6 outline-none placeholder:text-fd-muted-foreground disabled:opacity-60"
                      placeholder={loading ? 'Tutor przygotowuje odpowiedź…' : 'Zapytaj o materiał…'}
                    />
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1 px-1.5 text-[10px] text-fd-muted-foreground">
                        <CornerDownLeft className="size-3" aria-hidden="true" /> Enter wysyła · Shift+Enter nowa linia · {question.length}/1200
                      </span>
                      {loading ? (
                        <button
                          type="button"
                          onClick={stopAnswer}
                          className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg border border-fd-border px-3 text-xs font-medium hover:bg-fd-muted"
                        >
                          <Square className="size-3" aria-hidden="true" /> Zatrzymaj
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!question.trim()}
                          className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg bg-fd-primary px-3 text-xs font-medium text-fd-primary-foreground transition-opacity disabled:opacity-40"
                        >
                          <Send className="size-3.5" aria-hidden="true" /> Wyślij
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
