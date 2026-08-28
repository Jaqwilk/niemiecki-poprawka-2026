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
});
