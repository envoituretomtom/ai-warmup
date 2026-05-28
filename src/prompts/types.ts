export type TaskId = 'classify' | 'extract' | 'summarize';
export type VariantId = 'naive' | 'structured' | 'fewshot';
export type ProviderId = 'anthropic' | 'openai';

export type PromptResult = {
  output: string | object;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number;
};