import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import * as AccordionComponents from 'fumadocs-ui/components/accordion';
import * as StepsComponents from 'fumadocs-ui/components/steps';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import {
  ExamTip,
  Example,
  Exercise,
  Flashcard,
  LessonComplete,
  Mistake,
  Recall,
  Rule,
  SourceNote,
  Vocabulary,
} from '@/components/study';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...AccordionComponents,
    ...StepsComponents,
    ...TabsComponents,
    Rule,
    Example,
    Mistake,
    Recall,
    Vocabulary,
    ExamTip,
    SourceNote,
    Exercise,
    Flashcard,
    LessonComplete,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
