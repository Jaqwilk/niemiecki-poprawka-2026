import { afterEach, describe, expect, it, vi } from 'vitest';
import { classifyTutorTask, routeModel } from './model-router';

afterEach(() => vi.unstubAllEnvs());

describe('model router', () => {
  it('uses Luna with no reasoning for cheap structured work', () => {
    vi.stubEnv('OPENAI_FAST_MODEL', 'fast-test-model');
    expect(routeModel('classification')).toEqual({
      tier: 'fast',
      model: 'fast-test-model',
      reasoningEffort: 'none',
    });
  });

  it('uses Terra and adjusts tutor effort', () => {
    vi.stubEnv('OPENAI_MODEL', 'default-test-model');
    expect(routeModel('tutor', 'Co znaczy Aufzug?')).toMatchObject({
      tier: 'default',
      model: 'default-test-model',
      reasoningEffort: 'low',
    });
    expect(routeModel('grammar-explanation', 'Dlaczego mit wymaga Dativu?')).toMatchObject({
      tier: 'default',
      reasoningEffort: 'medium',
    });
  });

  it('reserves Sol for difficult reasoning and repository edits', () => {
    vi.stubEnv('OPENAI_SMART_MODEL', 'smart-test-model');
    expect(routeModel('complex-grammar', 'Dokładnie porównaj dwa wyjątki')).toMatchObject({
      tier: 'smart',
      model: 'smart-test-model',
      reasoningEffort: 'medium',
    });
    expect(routeModel('repo-edit', 'Popraw jedno zdanie.')).toMatchObject({
      tier: 'smart',
      reasoningEffort: 'medium',
    });
    expect(routeModel('refactor', 'Przebuduj architekturę komponentów.')).toMatchObject({
      tier: 'smart',
      reasoningEffort: 'high',
    });
  });

  it('classifies ordinary and difficult tutor questions centrally', () => {
    expect(classifyTutorTask('Co znaczy der Aufzug?')).toBe('tutor');
    expect(classifyTutorTask('Dlaczego mit wymaga Dativu?')).toBe('grammar-explanation');
    expect(classifyTutorTask('To jest niejednoznaczny wyjątek, zrób głęboką analizę.')).toBe('complex-grammar');
  });
});
