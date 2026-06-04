'use client';

import { useState } from 'react';
import { TaskId, VariantId, ProviderId, PromptResult } from '@/prompts/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TASKS: { id: TaskId; label: string; placeholder: string }[] = [
  { id: 'classify', label: 'Classify', placeholder: "Bonjour, je veux annuler ma leçon de demain..." },
  { id: 'extract',  label: 'Extract',  placeholder: "Bonjour, j'aimerais annuler ma leçon de jeudi prochain, c'est urgent..." },
  { id: 'summarize', label: 'Summarize', placeholder: "Client: J'ai raté ma leçon hier...\nSupport: Pas de souci..." },
];

export default function PromptLabPage() {
  const [task, setTask] = useState<TaskId>('classify');
  const [variant, setVariant] = useState<VariantId>('naive');
  const [provider, setProvider] = useState<ProviderId>('anthropic');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const placeholder = TASKS.find(t => t.id === task)?.placeholder ?? '';

  const handleRun = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/prompt-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, variant, provider, input }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prompt Lab</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare prompts naïfs, structurés et few-shot sur 3 tâches × 2 providers.
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Task</label>
            <Select value={task} onValueChange={v => setTask(v as TaskId)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASKS.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Variant</label>
            <Select value={variant} onValueChange={v => setVariant(v as VariantId)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="naive">Naïf</SelectItem>
                <SelectItem value="structured">Structured</SelectItem>
                <SelectItem value="fewshot">Few-shot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Provider</label>
            <Select value={provider} onValueChange={v => setProvider(v as ProviderId)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic">Claude Sonnet 4.5</SelectItem>
                <SelectItem value="openai">GPT-4o</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="font-mono text-sm"
        />

        <Button onClick={handleRun} disabled={loading || !input.trim()}>
          {loading ? 'Exécution...' : 'Run'}
        </Button>
      </Card>

      {error && (
        <Card className="p-4 border-destructive">
          <p className="text-destructive text-sm">Erreur : {error}</p>
        </Card>
      )}

      {result && (
        <Card className="p-4 space-y-4">
          <div>
            <Badge variant="outline" className="mb-2">OUTPUT</Badge>
            <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-3 rounded">
              {typeof result.output === 'string'
                ? result.output
                : JSON.stringify(result.output, null, 2)}
            </pre>
          </div>

          <Separator />

          <div className="grid grid-cols-4 gap-3 text-sm">
            <Stat label="Input tokens" value={result.inputTokens} />
            <Stat label="Output tokens" value={result.outputTokens} />
            <Stat label="Latency" value={`${result.latencyMs} ms`} />
            <Stat label="Cost" value={`$${result.costUsd.toFixed(5)}`} />
          </div>
        </Card>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono">{value}</p>
    </div>
  );
}