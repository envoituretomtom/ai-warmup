import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { runExtract } from '@/prompts/extract';

async function main() {
  const message = "Bonjour, j'aimerais absolument annuler ma leçon de jeudi prochain, j'ai un problème urgent au boulot ce jour-là.";

  for (const variant of ['naive', 'structured'] as const) {
    const result = await runExtract(variant, 'anthropic', message);
    console.log(`\n[${variant}]`, JSON.stringify(result.output, null, 2));
    console.log(`Tokens: ${result.inputTokens}+${result.outputTokens}, Cost: $${result.costUsd.toFixed(5)}`);
  }
}

main();