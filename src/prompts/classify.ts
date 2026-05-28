import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { ProviderId, PromptResult, VariantId } from './types';
import { estimateCost } from './utils';

function getModel(provider: ProviderId) {
  return provider === 'anthropic'
    ? anthropic('claude-sonnet-4-5')
    : openai('gpt-4o');
}

// ─── Variantes ───────────────────────────────────────────────

// V1 : naïf, on lance le truc sans cadre
function naivePrompt(message: string): string {
  return `Classifie ce message client en planning / facturation / examen / autre : "${message}"`;
}

// V2 : structuré, on définit clairement les classes et le format
const STRUCTURED_SYSTEM = `Tu es un assistant de support pour une auto-école.
Analyse le message client et classe-le dans UNE des catégories suivantes :

- planning : rendez-vous, créneau, annulation, report
- facturation : facture, paiement, remboursement, prix
- examen : code, conduite, résultat, examen théorique ou pratique
- autre : tout le reste

Réponds UNIQUEMENT par le mot exact de la catégorie, en minuscules, sans rien d'autre.`;

// V3 : few-shot, on ajoute 3 exemples
const FEWSHOT_SYSTEM = `${STRUCTURED_SYSTEM}

Exemples :

Message: "Bonjour, je voudrais annuler ma leçon de demain"
Catégorie: planning

Message: "Je n'ai jamais reçu la facture de janvier"
Catégorie: facturation

Message: "Quand est-ce que je peux passer le code ?"
Catégorie: examen`;

// ─── Runner ───────────────────────────────────────────────

export async function runClassify(
  variant: VariantId,
  provider: ProviderId,
  input: string,
): Promise<PromptResult> {
  const start = Date.now();

  let promptArgs;
  if (variant === 'naive') {
    promptArgs = { prompt: naivePrompt(input) };
  } else if (variant === 'structured') {
    promptArgs = { system: STRUCTURED_SYSTEM, prompt: input };
  } else {
    promptArgs = { system: FEWSHOT_SYSTEM, prompt: input };
  }

  const { text, usage } = await generateText({
    model: getModel(provider),
    ...promptArgs,
  });

  const latencyMs = Date.now() - start;
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;

  return {
    output: text.trim(),
    inputTokens,
    outputTokens,
    latencyMs,
    costUsd: estimateCost(provider, inputTokens, outputTokens),
  };
}