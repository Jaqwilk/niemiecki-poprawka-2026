'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, CornerDownLeft, LoaderCircle, Send, Sparkles, X } from 'lucide-react';
import { useStudyState } from './state-provider';
import { EditModePanel } from './edit-mode-panel';

type SelectionContext = {
  selectedText: string;
  surroundingText: string;
  heading: string;
  route: string;
  lesson: number | null;
};

type TutorMessage = { role: 'user' | 'assistant'; text: string; source?: string };

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
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'study' | 'edit'>('study');
  const [selectionContext, setSelectionContext] = useState<SelectionContext>(emptyContext);
  const [selectionButton, setSelectionButton] = useState<{ left: number; top: number } | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const close = useCallback(() => {
    abortRef.current?.abort();
    setOpen(false);
    setLoading(false);
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

  async function ask(override?: string) {
    const value = (override ?? question).trim();
    if (!value || loading) return;
    setError('');
    setQuestion('');
    setLoading(true);
    const userMessage: TutorMessage = { role: 'user', text: value };
    setMessages((current) => [...current, userMessage, { role: 'assistant', text: '' }]);
    const controller = new AbortController();
    abortRef.current = controller;
    const weakTopics = state.mistakes
      .filter((mistake) => mistake.status === 'open')
      .sort((a, b) => b.mistakeCount - a.mistakeCount)
      .slice(0, 5)
      .map((mistake) => mistake.topic);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: value,
          context: {
            ...selectionContext,
            route: pathname,
            lesson: selectionContext.lesson ?? inferLesson(pathname),
            weakTopics,
          },
          history: messages.slice(-6),
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || 'Nie udało się uzyskać odpowiedzi.');
      }
      if (!response.body) throw new Error('Serwer nie zwrócił strumienia odpowiedzi.');
      const source = response.headers.get('X-Study-Source') ?? undefined;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        const delta = decoder.decode(chunk, { stream: true });
        setMessages((current) => {
          const last = current.at(-1);
          return [
            ...current.slice(0, -1),
            { role: 'assistant', text: `${last?.text ?? ''}${delta}`, source },
          ];
        });
      }
    } catch (caught) {
      if (controller.signal.aborted) return;
      const message = caught instanceof Error ? caught.message : 'Nie udało się uzyskać odpowiedzi.';
      setError(message);
      setMessages((current) => current.slice(0, -2));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
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
          <button type="button" aria-label="Zamknij panel" onClick={close} className="absolute inset-0 bg-black/15" />
          <aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-fd-border bg-fd-background shadow-xl"
            aria-label="Korepetytor AI"
          >
            <header className="flex items-center justify-between border-b border-fd-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Prywatny tutor</p>
                <p className="mt-0.5 text-[11px] text-fd-muted-foreground">Momente A1.2 · Lektion 13–18</p>
              </div>
              <button type="button" onClick={close} className="grid size-9 place-items-center rounded-md hover:bg-fd-muted" aria-label="Zamknij">
                <X className="size-4" aria-hidden="true" />
              </button>
            </header>

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

            {mode === 'edit' ? (
              <EditModePanel />
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-5">
                  {selectionContext.selectedText ? (
                    <div className="mb-5 border-l-2 border-fd-primary/60 pl-3">
                      <p className="text-[10px] font-semibold tracking-[0.13em] text-fd-muted-foreground uppercase">
                        Zaznaczenie{selectionContext.lesson ? ` · Lektion ${selectionContext.lesson}` : ''}
                      </p>
                      <p className="mt-1 line-clamp-4 text-xs leading-5 text-fd-muted-foreground">{selectionContext.selectedText}</p>
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
                            className="rounded-md border border-fd-border px-2 py-1 text-[11px] hover:bg-fd-muted disabled:opacity-45"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {messages.length === 0 ? (
                    <div className="py-8 text-center">
                      <Bot className="mx-auto size-5 text-fd-muted-foreground" aria-hidden="true" />
                      <p className="mt-3 text-sm font-medium">Zapytaj krótko i konkretnie.</p>
                      <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-fd-muted-foreground">
                        Na przykład: „Dlaczego mit meinem?”, „Wyjaśnij sollen” albo „Przetestuj mnie z L16”.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5" aria-live="polite">
                      {messages.map((message, index) => (
                        <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-8' : 'mr-4'}>
                          <p className="text-[10px] font-semibold tracking-wide text-fd-muted-foreground uppercase">
                            {message.role === 'user' ? 'Ty' : 'Tutor'}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                            {message.text || (loading && index === messages.length - 1 ? '…' : '')}
                          </p>
                          {message.role === 'assistant' && message.source && message.text ? (
                            <p className="mt-2 text-[10px] text-fd-muted-foreground">
                              {message.source.includes('file-search') ? 'Źródło: notatki kursu + file search' : 'Źródło: lokalne notatki kursu'}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                  {error ? <p className="mt-4 text-xs leading-5 text-red-700 dark:text-red-400">{error}</p> : null}
                </div>

                <form
                  className="border-t border-fd-border p-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    ask();
                  }}
                >
                  <label htmlFor="tutor-question" className="sr-only">Pytanie do tutora</label>
                  <textarea
                    ref={inputRef}
                    id="tutor-question"
                    rows={3}
                    value={question}
                    disabled={loading}
                    onChange={(event) => setQuestion(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        ask();
                      }
                    }}
                    className="w-full resize-none rounded-md border border-fd-border bg-fd-background p-3 text-sm leading-6 outline-none focus:border-fd-primary disabled:opacity-60"
                    placeholder="Zapytaj o materiał…"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-fd-muted-foreground">
                      <CornerDownLeft className="size-3" aria-hidden="true" /> Enter wysyła
                    </span>
                    <button
                      type="submit"
                      disabled={!question.trim() || loading}
                      className="inline-flex min-h-9 items-center gap-2 rounded-md bg-fd-primary px-3 text-xs font-medium text-fd-primary-foreground disabled:opacity-45"
                    >
                      {loading ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : <Send className="size-3.5" aria-hidden="true" />}
                      Wyślij
                    </button>
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
