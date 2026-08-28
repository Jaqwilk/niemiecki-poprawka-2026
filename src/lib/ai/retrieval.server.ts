import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { LESSONS, type LessonNumber } from '@/lib/study/types';

type StudyChunk = { lesson: LessonNumber; text: string; score: number };

function terms(value: string) {
  return [...new Set(value.toLocaleLowerCase('de-DE').match(/[\p{L}\p{N}-]{3,}/gu) ?? [])];
}

function stripMdx(value: string) {
  return value
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function retrieveLocalStudyContext(query: string, requestedLesson?: number | null) {
  const queryTerms = terms(query);
  const chunks: StudyChunk[] = [];

  await Promise.all(
    LESSONS.map(async (lesson) => {
      const filePath = path.join(process.cwd(), 'content', 'docs', 'lessons', `${lesson}.mdx`);
      const content = await readFile(filePath, 'utf8');
      const paragraphs = content.split(/\n\s*\n/).map(stripMdx).filter((paragraph) => paragraph.length >= 45);
      for (const paragraph of paragraphs) {
        const lower = paragraph.toLocaleLowerCase('de-DE');
        const lexicalScore = queryTerms.reduce(
          (score, term) => score + (lower.includes(term) ? 2 : 0),
          0,
        );
        const lessonScore = lesson === requestedLesson ? 4 : 0;
        chunks.push({ lesson, text: paragraph.slice(0, 1200), score: lexicalScore + lessonScore });
      }
    }),
  );

  return chunks
    .sort((a, b) => b.score - a.score)
    .slice(0, requestedLesson ? 5 : 4)
    .map((chunk) => `[Lektion ${chunk.lesson}] ${chunk.text}`)
    .join('\n\n');
}
