import { describe, expect, it } from 'vitest';
import { mockQuestions, openMockTasks } from './mock';

describe('exam skill coverage', () => {
  it('keeps a complete 20-question closed section', () => {
    expect(mockQuestions).toHaveLength(20);
    expect(mockQuestions.filter((question) => question.skill === 'listening').length).toBeGreaterThanOrEqual(4);
    expect(mockQuestions.filter((question) => question.skill === 'reading').length).toBeGreaterThanOrEqual(6);
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
