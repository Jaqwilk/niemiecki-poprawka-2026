import { describe, expect, it } from 'vitest';
import { cleanTutorText, inferTutorLesson, sanitizeTutorHistory } from './tutor-input';

describe('tutor input', () => {
  it('prefers a valid lesson supplied by page context', () => {
    expect(inferTutorLesson('Przetestuj mnie z L16', 14)).toBe(14);
  });

  it('recognizes common ways of naming a lesson in a question', () => {
    expect(inferTutorLesson('Przetestuj mnie z L16', null)).toBe(16);
    expect(inferTutorLesson('Powtórzmy Lektion 18', null)).toBe(18);
    expect(inferTutorLesson('Co było w lekcji 13?', null)).toBe(13);
  });

  it('rejects lessons outside the study scope', () => {
    expect(inferTutorLesson('Wyjaśnij Lektion 19', null)).toBeNull();
  });

  it('trims text and keeps only recent valid history entries', () => {
    const history = Array.from({ length: 10 }, (_, index) => ({
      role: index % 2 ? 'assistant' : 'user',
      text: ` wiadomość ${index} `,
    }));
    expect(sanitizeTutorHistory(history)).toHaveLength(8);
    expect(sanitizeTutorHistory(history)[0]).toEqual({ role: 'user', content: 'wiadomość 2' });
    expect(cleanTutorText('  pytanie  ', 20)).toBe('pytanie');
  });
});
