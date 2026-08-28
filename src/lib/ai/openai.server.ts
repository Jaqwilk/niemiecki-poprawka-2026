import 'server-only';
import OpenAI from 'openai';
import { routeModel, type ModelTask } from './model-router';

export function getOpenAIConfig(task: ModelTask, input = '') {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    client: new OpenAI({ apiKey }),
    route: routeModel(task, input),
    vectorStoreId: process.env.OPENAI_VECTOR_STORE_ID?.trim() || null,
  };
}
