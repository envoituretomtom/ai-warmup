import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { runClassify } from '@/prompts/classify';

async function main() {
  const message = "Quel temps fait-il à Paris aujourd'hui ?";

  for (const variant of ['naive', 'structured', 'fewshot'] as const) {
    const result = await runClassify(variant, 'anthropic', message);
    console.log(`\n[${variant}] → "${result.output}" (${result.inputTokens}+${result.outputTokens} tokens, $${result.costUsd.toFixed(5)})`);
  }
}

main();