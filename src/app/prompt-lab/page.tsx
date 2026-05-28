'use client';

import { useState } from 'react';
import { TaskId, VariantId, ProviderId, PromptResult } from '@/prompts/types';

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
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Prompt Lab — S3</h1>
      <p className="text-sm text-gray-500">
        Compare prompts naïfs, structurés et few-shot sur 3 tâches × 2 providers.
      </p>

      <div className="grid grid-cols-3 gap-3">
        <label className="space-y-1">
          <span className="text-sm font-semibold">Task</span>
          <select value={task} onChange={e => setTask(e.target.value as TaskId)} className="w-full border rounded px-2 py-1">
            {TASKS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-semibold">Variant</span>
          <select value={variant} onChange={e => setVariant(e.target.value as VariantId)} className="w-full border rounded px-2 py-1">
            <option value="naive">Naïf</option>
            <option value="structured">Structured</option>
            <option value="fewshot">Few-shot</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-semibold">Provider</span>
          <select value={provider} onChange={e => setProvider(e.target.value as ProviderId)} className="w-full border rounded px-2 py-1">
            <option value="anthropic">Claude Sonnet 4.5</option>
            <option value="openai">GPT-4o</option>
          </select>
        </label>
      </div>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full border rounded px-3 py-2 font-mono text-sm"
      />

      <button
        onClick={handleRun}
        disabled={loading || !input.trim()}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Exécution...' : 'Run'}
      </button>

      {error && <p className="text-red-600 text-sm">Erreur : {error}</p>}

      {result && (
        <div className="space-y-3 mt-4">
          <div className="border rounded p-3">
            <p className="text-xs font-semibold text-gray-500 mb-1">OUTPUT</p>
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {typeof result.output === 'string'
                ? result.output
                : JSON.stringify(result.output, null, 2)}
            </pre>
          </div>

          <div className="grid grid-cols-4 gap-2 text-sm">
            <Stat label="Input tokens" value={result.inputTokens} />
            <Stat label="Output tokens" value={result.outputTokens} />
            <Stat label="Latency" value={`${result.latencyMs} ms`} />
            <Stat label="Cost" value={`$${result.costUsd.toFixed(5)}`} />
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded p-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-mono">{value}</p>
    </div>
  );
}