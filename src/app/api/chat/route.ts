import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages, UIMessage } from 'ai';

export const maxDuration = 30;

type Provider = 'anthropic' | 'openai';

function getModel(provider: Provider) {
  switch (provider) {
    case 'anthropic': return anthropic('claude-sonnet-4-5');
    case 'openai':    return openai('gpt-4o');
  }
}

export async function POST(req: Request) {
  const { messages, provider = 'anthropic' }: { messages: UIMessage[], provider: Provider } = await req.json();

  const result = streamText({
    model: getModel(provider),
    system: 'Tu es un assistant sarcastique. Réponds en français par défaut.',
    messages: await convertToModelMessages(messages), // ← await ici
  });

  return result.toUIMessageStreamResponse();
}