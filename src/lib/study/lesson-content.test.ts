import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('lesson learning structure', () => {
  for (let lesson = 13; lesson <= 18; lesson += 1) {
    it(`keeps the minimum checklist and final outcome in Lektion ${lesson}`, () => {
      const content = readFileSync(
        join(process.cwd(), 'content', 'docs', 'lessons', `${lesson}.mdx`),
        'utf8',
      );

      expect(content).toContain('<LessonMinimum>');
      expect(content).toContain('## Po tej lekcji potrafię…');
      expect(content).toContain('<OneThing>');
    });
  }

  it('keeps added source material split into active and recognition sections', () => {
    const lesson15 = readFileSync(join(process.cwd(), 'content', 'docs', 'lessons', '15.mdx'), 'utf8');
    const lesson16 = readFileSync(join(process.cwd(), 'content', 'docs', 'lessons', '16.mdx'), 'utf8');

    expect(lesson15).toContain('## Fokus Beruf 5 — Erster Arbeitstag');
    expect(lesson15).toContain('Wie geht es dir?');
    expect(lesson15).toContain('## Urlaub im Haus am See');
    expect(lesson16).toContain('## Fokus Beruf 6 — Arbeitsaufträge');
    expect(lesson16).toContain('### Dodatkowe szczegóły — wystarczy rozpoznawać');
  });
});
