import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { ProviderId, PromptResult, VariantId } from './types';
import { estimateCost } from './utils';

function getModel(provider: ProviderId) {
  return provider === 'anthropic'
    ? anthropic('claude-sonnet-4-5')
    : openai('gpt-4o');
}

const SummarySchema = z.object({
  contexte: z.string().describe("Une phrase qui plante le contexte du client"),
  point_cle: z.string().describe("Le problème ou la question principale, en une phrase"),
  action_recommandee: z.string().describe("Ce que le moniteur doit faire ensuite, en une phrase actionable"),
});

export type Summary = z.infer<typeof SummarySchema>;

const SYSTEM = `Tu es un assistant qui résume des échanges de support entre un client et le service support d'une auto-école, à destination du moniteur qui va prendre le relais.
Sois concis, actionable, et bienveillant.`;

const FEWSHOT_SYSTEM = `${SYSTEM}

Exemple :

Échange :
Client: "Bonjour, j'ai raté ma leçon hier, j'étais malade."
Support: "Pas de souci, on peut la reprogrammer. Quel créneau vous arrange ?"
Client: "Mardi 16h si possible."

Résumé :
{
  "contexte": "Client a manqué sa leçon d'hier pour cause de maladie.",
  "point_cle": "Souhaite reprogrammer rapidement, propose mardi 16h.",
  "action_recommandee": "Confirmer le créneau mardi 16h si disponible côté planning."
}`;

// V1 : prompt naïf (texte libre)
async function runSummarizeNaive(provider: ProviderId, input: string): Promise<PromptResult> {
  const start = Date.now();
  const { text, usage } = await generateText({
    model: getModel(provider),
    prompt: `Résume cet échange en 3 lignes : ${input}`,
  });
  const latencyMs = Date.now() - start;
  return {
    output: text,
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    latencyMs,
    costUsd: estimateCost(provider, usage.inputTokens ?? 0, usage.outputTokens ?? 0),
  };
}

// V2 : structured zero-shot
async function runSummarizeStructured(provider: ProviderId, input: string): Promise<PromptResult> {
  const start = Date.now();
  const { output, usage } = await generateText({
    model: getModel(provider),
    output: Output.object({ schema: SummarySchema }),
    system: SYSTEM,
    prompt: input,
  });
  const latencyMs = Date.now() - start;
  return {
    output,
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    latencyMs,
    costUsd: estimateCost(provider, usage.inputTokens ?? 0, usage.outputTokens ?? 0),
  };
}

// V3 : structured + few-shot
async function runSummarizeFewshot(provider: ProviderId, input: string): Promise<PromptResult> {
  const start = Date.now();
  const { output, usage } = await generateText({
    model: getModel(provider),
    output: Output.object({ schema: SummarySchema }),
    system: FEWSHOT_SYSTEM,
    prompt: input,
  });
  const latencyMs = Date.now() - start;
  return {
    output,
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    latencyMs,
    costUsd: estimateCost(provider, usage.inputTokens ?? 0, usage.outputTokens ?? 0),
  };
}

export async function runSummarize(
  variant: VariantId,
  provider: ProviderId,
  input: string,
): Promise<PromptResult> {
  if (variant === 'naive') return runSummarizeNaive(provider, input);
  if (variant === 'fewshot') return runSummarizeFewshot(provider, input);
  return runSummarizeStructured(provider, input);
}