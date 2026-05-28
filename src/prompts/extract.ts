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

// ─── Schéma cible ────────────────────────────────────────────

const ExtractionSchema = z.object({
  date: z.string().nullable().describe(
    "Date mentionnée au format ISO 8601 (YYYY-MM-DD), ou null si non précisée"
  ),
  motif: z.string().describe("Motif de la demande, en 5-10 mots max"),
  urgence: z.enum(['faible', 'moyenne', 'haute']).describe(
    "Urgence perçue : haute = bloquant, moyenne = important, faible = simple demande"
  ),
});

export type Extraction = z.infer<typeof ExtractionSchema>;

const SYSTEM = `Tu es un assistant qui extrait des informations structurées de messages clients d'auto-école.
Analyse le message et extrais les champs demandés.
Aujourd'hui nous sommes le ${new Date().toISOString().split('T')[0]}.`;

// ─── V1 : naïf, JSON via texte (fragile) ─────────────────────

export async function runExtractNaive(
  provider: ProviderId,
  input: string,
): Promise<PromptResult> {
  const start = Date.now();

  const { text, usage } = await generateText({
    model: getModel(provider),
    system: SYSTEM,
    prompt: `Extrais date, motif, urgence du message suivant et réponds en JSON pur (sans markdown). Format : {"date":"YYYY-MM-DD ou null","motif":"...","urgence":"faible|moyenne|haute"}

Message: ${input}`,
  });

  const latencyMs = Date.now() - start;

  let output: unknown;
  try {
    output = JSON.parse(text);
  } catch {
    output = { error: 'JSON parse failed', raw: text };
  }

  return {
    output: output as object,
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    latencyMs,
    costUsd: estimateCost(provider, usage.inputTokens ?? 0, usage.outputTokens ?? 0),
  };
}

// ─── V2 : structured via Output.object (garanti par Zod) ─────

export async function runExtractStructured(
  provider: ProviderId,
  input: string,
): Promise<PromptResult> {
  const start = Date.now();

  const { output, usage } = await generateText({
    model: getModel(provider),
    output: Output.object({ schema: ExtractionSchema }),
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

// ─── Runner ──────────────────────────────────────────────────

export async function runExtract(
  variant: VariantId,
  provider: ProviderId,
  input: string,
): Promise<PromptResult> {
  if (variant === 'naive') return runExtractNaive(provider, input);
  // Pour cette task, structured et fewshot pointent vers la même impl typée
  return runExtractStructured(provider, input);
}