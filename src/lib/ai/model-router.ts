export type ModelTask =
  | 'classification'
  | 'scoring'
  | 'mistake-tagging'
  | 'metadata'
  | 'flashcard'
  | 'tutor'
  | 'grammar-explanation'
  | 'practice-generation'
  | 'complex-grammar'
  | 'repo-edit'
  | 'debugging'
  | 'architecture'
  | 'refactor';

export type ModelTier = 'fast' | 'default' | 'smart';
export type ReasoningEffort = 'none' | 'low' | 'medium' | 'high';

export type ModelRoute = {
  tier: ModelTier;
  model: string;
  reasoningEffort: ReasoningEffort;
};

const DEFAULT_MODELS = {
  fast: 'gpt-5.6-luna',
  default: 'gpt-5.6-terra',
  smart: 'gpt-5.6-sol',
} as const;

function configuredModels() {
  return {
    fast: process.env.OPENAI_FAST_MODEL?.trim() || DEFAULT_MODELS.fast,
    default: process.env.OPENAI_MODEL?.trim() || DEFAULT_MODELS.default,
    smart: process.env.OPENAI_SMART_MODEL?.trim() || DEFAULT_MODELS.smart,
  };
}

function looksComplex(value = '') {
  const query = value.toLocaleLowerCase('pl-PL');
  return (
    query.length > 700 ||
    /niejednoznacz|sprzeczn|wyjąt|wyjatek|głęboka analiza|dokładnie porówn|złożon|trudn.*gramat/.test(query)
  );
}

function looksLikeLargerCodeChange(value = '') {
  const instruction = value.toLocaleLowerCase('pl-PL');
  return /refaktor|przebud|architektur|debug|cały komponent|wiele plik|duża zmiana|złożon/.test(instruction);
}

export function routeModel(task: ModelTask, input = ''): ModelRoute {
  const models = configuredModels();

  if (['classification', 'scoring', 'mistake-tagging', 'metadata', 'flashcard'].includes(task)) {
    return { tier: 'fast', model: models.fast, reasoningEffort: 'none' };
  }

  if (['repo-edit', 'debugging', 'architecture', 'refactor'].includes(task)) {
    return {
      tier: 'smart',
      model: models.smart,
      reasoningEffort:
        task === 'architecture' || task === 'debugging' || task === 'refactor' || looksLikeLargerCodeChange(input)
          ? 'high'
          : 'medium',
    };
  }

  if (task === 'complex-grammar' || looksComplex(input)) {
    return { tier: 'smart', model: models.smart, reasoningEffort: 'medium' };
  }

  if (task === 'grammar-explanation' || /dlaczego|różnic|porównaj|dativ|akkusativ|szyk/.test(input.toLocaleLowerCase('pl-PL'))) {
    return { tier: 'default', model: models.default, reasoningEffort: 'medium' };
  }

  return { tier: 'default', model: models.default, reasoningEffort: 'low' };
}

export function classifyTutorTask(question: string): ModelTask {
  if (looksComplex(question)) return 'complex-grammar';
  if (/dlaczego|różnic|porównaj|gramat|dativ|akkusativ|końców|szyk|przyimek/.test(question.toLocaleLowerCase('pl-PL'))) {
    return 'grammar-explanation';
  }
  return 'tutor';
}
