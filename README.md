# ai-warmup

> A 4-week learning project to (re)learn modern fullstack TypeScript and the AI SDK ecosystem.
> Built at 4h/week as part of a transition from Engineering Manager / Senior Frontend Engineer toward AI Engineer / AI Fullstack roles.

🔗 **Live demo** — https://ai-warmup.vercel.app

## What's inside

### `/chat` — streaming chatbot
Multi-provider switch (Anthropic Claude Sonnet 4.5 / OpenAI GPT-4o), token-by-token streaming, message history within the session.
Built in **S2**. Demonstrates: Next.js App Router, AI SDK Core, `streamText`, `useChat`, Vercel deployment.

### `/prompt-lab` — prompt comparison
3 tasks × 3 prompt variants × 2 providers, with real-time metrics (cost, latency, tokens in/out).

Tasks:
- **Classify** — driving school support message → category (planning / billing / exam / other)
- **Extract** — free text → `{ date, motif, urgence }` typed object
- **Summarize** — support exchange → `{ contexte, point_clé, action_recommandée }`

Variants:
- **Naïve** — 1-line instruction, no system prompt
- **Structured** — careful system prompt, strict output format
- **Few-shot** — structured + 3 in-prompt examples

Built in **S3**. Demonstrates: `generateText` + `Output.object`, Zod schemas, structured outputs, cost tracking, comparative prompt engineering.

→ See [`prompts/README.md`](./prompts/README.md) for the comparison results.

## Key takeaways

A few things I genuinely didn't fully realize before building this:

- **Output tokens cost 5× more than input tokens** (on Anthropic). Cutting output length is the biggest cost lever, far more than shortening the system prompt.
- **Few-shot is not free**. On simple classification, it adds 50% cost with zero quality gain. Save it for ambiguous tasks or strict formats.
- **`Output.object` + Zod is non-negotiable** for any structured output you parse downstream. Asking for "JSON only" in a text prompt fails silently ~5% of the time.
- **Server Actions are for mutations, Route Handlers are for streaming**. Two different mental models, not interchangeable.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript strict |
| AI SDK | Vercel AI SDK 6 |
| Providers | `@ai-sdk/anthropic`, `@ai-sdk/openai` |
| Validation | Zod |
| UI | Tailwind CSS + shadcn/ui |
| Theme | `next-themes` (light / dark / system) |
| Deploy | Vercel |

## Run locally

```bash
pnpm install
cp .env.example .env.local   # add your API keys
pnpm dev
```

Required env vars:
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

## Next steps

This warmup feeds into a longer roadmap:
- **M2** — Persistent multi-user chat (Drizzle + Neon + Auth.js)
- **M3+** — RAG, agents with tools, evals, multi-model routing, observability

Stay tuned.