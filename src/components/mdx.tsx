import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import {
  ExamTip,
  Example,
  Exercise,
  Flashcard,
  Mistake,
  Rule,
  Vocabulary,
} from '@/components/study';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Rule,
    Example,
    Mistake,
    Vocabulary,
    ExamTip,
    Exercise,
    Flashcard,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
