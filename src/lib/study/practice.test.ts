import { describe, expect, it } from 'vitest';
import { normalizeAnswer } from './engine';
import { mockQuestionIds, mockQuestions } from './mock';
import {
  examEquivalentQuestionIds,
  getPracticeQuestionsForLesson,
  practiceQuestions,
} from './practice';
import { studyQuestions } from './questions';
import { LESSONS, type StudyQuestion } from './types';

function questionFingerprint(question: StudyQuestion) {
  return normalizeAnswer([
    question.prompt,
    question.audioText ?? '',
    ...(question.tokens ?? []),
  ].join(' '));
}

describe('practice question bank', () => {
  it('does not reuse any question identifier or prompt from the test', () => {
    const mockIds = new Set(mockQuestionIds);
    const mockFingerprints = new Set(mockQuestions.map(questionFingerprint));

    for (const question of practiceQuestions) {
      expect(mockIds.has(question.id), `Repeated test id: ${question.id}`).toBe(false);
      expect(
        mockFingerprints.has(questionFingerprint(question)),
        `Repeated test prompt: ${question.prompt}`,
      ).toBe(false);
    }
  });

  it('reserves semantically identical vocabulary pairs for the test only', () => {
    const practiceIds = new Set(practiceQuestions.map((question) => question.id));
    for (const id of examEquivalentQuestionIds) expect(practiceIds.has(id)).toBe(false);
  });

  it('contains 44 unique exercises and covers every lesson', () => {
    expect(practiceQuestions).toHaveLength(44);
    expect(new Set(practiceQuestions.map((question) => question.id)).size).toBe(44);
    for (const lesson of LESSONS) {
      expect(getPracticeQuestionsForLesson(lesson).length).toBeGreaterThanOrEqual(6);
    }
  });

  it('is a filtered view of the source-grounded study bank', () => {
    const sourceIds = new Set(studyQuestions.map((question) => question.id));
    for (const question of practiceQuestions) expect(sourceIds.has(question.id)).toBe(true);
  });
});
