import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

const PROJECTS = [
  {
    href: '/chat',
    title: 'Streaming Chat',
    description: 'Multi-provider chatbot (Claude / GPT-4o) with token-by-token streaming.',
    tag: 'S2 — AI SDK basics',
  },
  {
    href: '/prompt-lab',
    title: 'Prompt Lab',
    description: '3 tasks × 3 prompt variants × 2 providers. Cost, latency and token metrics.',
    tag: 'S3 — Prompt engineering',
  },
];

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">ai-warmup</h1>
          <p className="text-muted-foreground mt-2">
            A 4-week learning project to relearn modern fullstack TypeScript and the AI SDK ecosystem.
            Part of a transition from Engineering Manager / Senior Frontend to AI Engineer.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Demos</h2>
        <div className="grid gap-3">
          {PROJECTS.map((p) => (
            <Link key={p.href} href={p.href}>
              <Card className="hover:bg-accent transition-colors">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1">{p.tag}</p>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Stack</strong> — Next.js 16, TypeScript, AI SDK 6,
          Tailwind, shadcn/ui, Vercel.
        </p>
        <p>
          <strong className="text-foreground">Source</strong> —{' '}
          <a href="https://github.com/envoituretomtom/ai-warmup" className="underline">
            github.com/envoituretomtom/ai-warmup
          </a>
        </p>
      </section>
    </main>
  );
}