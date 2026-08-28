'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';

export function AudioPrompt({ text }: { text: string }) {
  const [status, setStatus] = useState<'idle' | 'speaking' | 'unavailable'>('idle');

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function play() {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setStatus('unavailable');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const germanVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('de'));
    if (germanVoice) utterance.voice = germanVoice;
    utterance.lang = germanVoice?.lang ?? 'de-DE';
    utterance.rate = 0.86;
    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => setStatus('unavailable');
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="mb-6 rounded-lg border border-fd-border bg-fd-muted/35 p-4">
      <button
        type="button"
        onClick={play}
        disabled={status === 'speaking'}
        className="inline-flex min-h-10 items-center gap-2 rounded-md border border-fd-border bg-fd-background px-3 text-sm font-medium hover:bg-fd-muted disabled:opacity-55"
      >
        <Volume2 className="size-4 text-fd-primary" aria-hidden="true" />
        {status === 'speaking' ? 'Odtwarzanie…' : 'Odtwórz nagranie'}
      </button>
      <p className="mt-2 text-xs leading-5 text-fd-muted-foreground">
        Możesz odsłuchać tekst kilka razy. Głos niemiecki generuje przeglądarka.
      </p>
      {status === 'unavailable' ? (
        <p className="mt-2 text-xs text-red-700 dark:text-red-400" role="alert">
          Ta przeglądarka nie udostępniła syntezy mowy. Otwórz zadanie w aktualnym Chrome lub Edge.
        </p>
      ) : null}
    </div>
  );
}
