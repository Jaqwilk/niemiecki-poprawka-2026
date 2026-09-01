import { describe, expect, it } from 'vitest';
import { mockQuestions, openMockTasks, paperTestSections } from './mock';

describe('exam skill coverage', () => {
  it('keeps a complete 50-point paper-style closed section', () => {
    expect(mockQuestions).toHaveLength(50);
    expect(mockQuestions.filter((question) => question.skill === 'listening')).toHaveLength(6);
    expect(mockQuestions.filter((question) => question.skill === 'reading')).toHaveLength(16);
    expect(mockQuestions.filter((question) => question.skill === 'vocabulary')).toHaveLength(12);
  });

  it('covers every lesson and every photographed paper layout', () => {
    expect(new Set(mockQuestions.map((question) => question.lesson))).toEqual(
      new Set([13, 14, 15, 16, 17, 18]),
    );
    expect(new Set(paperTestSections.map((section) => section.layout))).toEqual(
      new Set(['listening', 'cloze', 'reading', 'matching', 'gaps', 'sentences']),
    );
  });

  it('includes both writing formats and four distinct speaking situations', () => {
    expect(openMockTasks.filter((task) => task.section === 'writing')).toHaveLength(2);
    expect(openMockTasks.filter((task) => task.section === 'speaking')).toHaveLength(4);
    expect(new Set(openMockTasks.map((task) => task.visual))).toEqual(
      new Set(['apartment', 'none', 'map', 'calendar', 'photo', 'card']),
    );
  });

  it('provides a four-point rubric and a model for every open task', () => {
    for (const task of openMockTasks) {
      expect(task.checklist).toHaveLength(4);
      expect(task.model.trim()).not.toBe('');
    }
  });
});
