import { describe, expect, it } from 'vitest';
import { isCorrectAnswer } from './engine';
import { studyQuestions } from './questions';

describe('source-grounded question bank', () => {
  it('contains at least thirteen questions for every lesson from 13 through 18', () => {
    for (let lesson = 13; lesson <= 18; lesson += 1) {
      expect(studyQuestions.filter((question) => question.lesson === lesson).length).toBeGreaterThanOrEqual(13);
    }
  });

  it('covers the missing Fokus Beruf, module 5 writing and teacher elevator details', () => {
    const ids = new Set(studyQuestions.map((question) => question.id));
    for (const id of [
      'l15-office-room',
      'l15-email-six-points',
      'l15-lake-voice-message',
      'l16-work-message-note',
      'l16-architecture-materials',
      'l16-elevator-details',
    ]) {
      expect(ids.has(id), `Missing source-grounded exercise: ${id}`).toBe(true);
    }
  });

  it('keeps grammar below 40% and includes listening, reading and writing in every lesson', () => {
    const grammarCount = studyQuestions.filter((question) => question.skill === 'grammar').length;
    expect(grammarCount / studyQuestions.length).toBeLessThanOrEqual(0.4);

    for (let lesson = 13; lesson <= 18; lesson += 1) {
      const lessonQuestions = studyQuestions.filter((question) => question.lesson === lesson);
      expect(lessonQuestions.some((question) => question.skill === 'listening')).toBe(true);
      expect(lessonQuestions.some((question) => question.skill === 'reading')).toBe(true);
      expect(lessonQuestions.some((question) => question.skill === 'writing')).toBe(true);
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
