export const MAX_TUTOR_RETRIES = 2;

export type TutorFailure = {
  message: string;
  offline: boolean;
};

const transientStatuses = new Set([408, 425, 500, 502, 503, 504]);

export function shouldRetryTutorRequest(status: number, attempt: number, offline = false) {
  return !offline && attempt < MAX_TUTOR_RETRIES && transientStatuses.has(status);
}

export function tutorRetryDelay(attempt: number) {
  return attempt === 0 ? 450 : 1100;
}

export async function readTutorFailure(response: Response): Promise<TutorFailure> {
  const raw = await response.text().catch(() => '');
  let payload: { error?: unknown; offline?: unknown } | null = null;

  try {
    payload = JSON.parse(raw) as { error?: unknown; offline?: unknown };
  } catch {
    payload = null;
  }

  const serverMessage = typeof payload?.error === 'string' ? payload.error.trim() : '';
  const offline = payload?.offline === true;
  if (serverMessage) return { message: serverMessage, offline };

  if (response.status === 429) {
    return {
      message: 'Limit usługi OpenAI został chwilowo osiągnięty. Pytanie jest zachowane — spróbuj ponownie za moment.',
      offline: false,
    };
  }
  if (transientStatuses.has(response.status)) {
    return {
      message: 'Tutor ma chwilowy problem z połączeniem. Pytanie jest zachowane — spróbuj ponownie.',
      offline: false,
    };
  }
  return {
    message: `Tutor nie mógł odpowiedzieć (błąd ${response.status}). Pytanie jest zachowane — spróbuj ponownie.`,
    offline: false,
  };
}

export function tutorNetworkErrorMessage(online: boolean) {
  return online
    ? 'Połączenie z tutorem zostało przerwane. Pytanie jest zachowane — spróbuj ponownie.'
    : 'Tutor AI wymaga internetu. Pytanie jest zachowane — spróbuj ponownie po odzyskaniu połączenia.';
}

export function waitForTutorRetry(timeout: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, timeout);
    function handleAbort() {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }
    signal.addEventListener('abort', handleAbort, { once: true });
  });
}
