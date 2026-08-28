'use client';

import { useEffect, useRef, useState } from 'react';
import { CircleStop, Mic, RotateCcw } from 'lucide-react';

export function VoiceRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState<'idle' | 'recording' | 'ready' | 'error'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('error');
      return;
    }

    try {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStatus('ready');
      };
      recorder.start();
      setStatus('recording');
    } catch {
      setStatus('error');
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }

  return (
    <div className="mt-4 rounded-lg border border-fd-border bg-fd-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {status === 'recording' ? (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-red-600 px-3 text-sm font-medium text-white hover:bg-red-700"
          >
            <CircleStop className="size-4" aria-hidden="true" /> Zatrzymaj nagranie
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-fd-border bg-fd-background px-3 text-sm font-medium hover:bg-fd-muted"
          >
            {status === 'ready' ? <RotateCcw className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
            {status === 'ready' ? 'Nagraj ponownie' : 'Nagraj odpowiedź'}
          </button>
        )}
        {status === 'recording' ? (
          <span className="inline-flex items-center gap-2 text-xs font-medium text-red-700 dark:text-red-400">
            <span className="size-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" /> Nagrywanie
          </span>
        ) : null}
      </div>
      {audioUrl ? <audio controls src={audioUrl} className="mt-4 h-10 w-full" /> : null}
      <p className="mt-2 text-xs leading-5 text-fd-muted-foreground">
        Nagranie zostaje tylko w tej karcie i znika po jej odświeżeniu. Możesz zamiast tego odpowiedzieć na głos i użyć samooceny.
      </p>
      {status === 'error' ? (
        <p className="mt-2 text-xs text-red-700 dark:text-red-400" role="alert">
          Nie udało się uruchomić mikrofonu. Sprawdź uprawnienia przeglądarki albo wykonaj wypowiedź bez nagrania.
        </p>
      ) : null}
    </div>
  );
}
