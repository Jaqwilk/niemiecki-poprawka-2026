import { describe, expect, it } from 'vitest';
import {
  readTutorFailure,
  shouldRetryTutorRequest,
  tutorNetworkErrorMessage,
  tutorRetryDelay,
} from './tutor-client';

describe('tutor client resilience', () => {
  it('retries transient server errors but not offline or rate-limit responses', () => {
    expect(shouldRetryTutorRequest(502, 0)).toBe(true);
    expect(shouldRetryTutorRequest(504, 1)).toBe(true);
    expect(shouldRetryTutorRequest(503, 0, true)).toBe(false);
    expect(shouldRetryTutorRequest(429, 0)).toBe(false);
    expect(shouldRetryTutorRequest(502, 2)).toBe(false);
  });

  it('uses short increasing delays', () => {
    expect(tutorRetryDelay(0)).toBe(450);
    expect(tutorRetryDelay(1)).toBe(1100);
  });

  it('preserves a useful server error and recognizes the offline response', async () => {
    const failure = await readTutorFailure(new Response(
      JSON.stringify({ error: 'Ta funkcja wymaga połączenia z internetem.', offline: true }),
      { status: 503 },
    ));
    expect(failure).toEqual({
      message: 'Ta funkcja wymaga połączenia z internetem.',
      offline: true,
    });
  });

  it('replaces non-JSON proxy errors with a clear recoverable message', async () => {
    const failure = await readTutorFailure(new Response('<html>Bad gateway</html>', { status: 502 }));
    expect(failure.message).toContain('Pytanie jest zachowane');
    expect(failure.offline).toBe(false);
    expect(tutorNetworkErrorMessage(false)).toContain('wymaga internetu');
  });
});
