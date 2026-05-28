import { NextResponse } from 'next/server';
import { runClassify } from '@/prompts/classify';
import { runExtract } from '@/prompts/extract';
import { runSummarize } from '@/prompts/summarize';
import { ProviderId, TaskId, VariantId } from '@/prompts/types';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { task, variant, provider, input } = await req.json() as {
    task: TaskId;
    variant: VariantId;
    provider: ProviderId;
    input: string;
  };

  try {
    let result;
    if (task === 'classify') result = await runClassify(variant, provider, input);
    else if (task === 'extract') result = await runExtract(variant, provider, input);
    else result = await runSummarize(variant, provider, input);

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}