import { ProviderId } from './types';

// Prix en $/1M tokens. Ordres de grandeur ; vérifie les chiffres courants.
const PRICING: Record<ProviderId, { input: number; output: number }> = {
  anthropic: { input: 3, output: 15 },     // Claude Sonnet 4.5
  openai:    { input: 2.5, output: 10 },   // GPT-4o
};

export function estimateCost(
  provider: ProviderId,
  inputTokens: number,
  outputTokens: number,
): number {
  const p = PRICING[provider];
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}