import { describe, expect, it } from 'vitest';
import { isCorrectAnswer } from './engine';
import { studyQuestions } from './questions';

describe('source-grounded question bank', () => {
  it('contains ten questions for every lesson from 13 through 18', () => {
    for (let lesson = 13; lesson <= 18; lesson += 1) {
      expect(studyQuestions.filter((question) => question.lesson === lesson)).toHaveLength(10);
    }
  });

  it('has unique identifiers and complete source metadata', () => {
    const ids = studyQuestions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const question of studyQuestions) {
      expect(question.lesson).toBeGreaterThanOrEqual(13);
      expect(question.lesson).toBeLessThanOrEqual(18);
      expect(question.topic.trim()).not.toBe('');
      expect(question.prompt.trim()).not.toBe('');
      expect(question.explanation.trim()).not.toBe('');
      expect(question.source.label.trim()).not.toBe('');
      expect(question.acceptedAnswers.length).toBeGreaterThan(0);
    }
  });

  it('accepts the displayed correct answer for every question', () => {
    for (const question of studyQuestions) {
      expect(
        isCorrectAnswer(question, question.correctAnswer),
        `Expected displayed answer to pass: ${question.id}`,
      ).toBe(true);
    }
  });

  it('keeps option-based correct answers among the visible options', () => {
    for (const question of studyQuestions.filter((item) => item.options)) {
      expect(question.options).toContain(question.correctAnswer);
    }
  });
});
