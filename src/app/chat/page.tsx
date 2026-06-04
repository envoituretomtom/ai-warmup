'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

type Provider = 'anthropic' | 'openai';

const PROVIDER_LABEL: Record<Provider, string> = {
  anthropic: 'Claude Sonnet 4.5',
  openai: 'GPT-4o',
};

export default function ChatPage() {
  const [provider, setProvider] = useState<Provider>('anthropic');
  const { messages, sendMessage, status, setMessages } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll en bas pendant le streaming
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === 'streaming' || status === 'submitted') return;
    sendMessage({ text: input }, { body: { provider } });
    setInput('');
  };

  const isBusy = status === 'streaming' || status === 'submitted';

  return (
    <main className="max-w-2xl mx-auto p-4 h-screen flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat</h1>
        <div className="flex items-center gap-2">
          <Select
            value={provider}
            onValueChange={v => setProvider(v as Provider)}
            disabled={isBusy}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anthropic">Claude Sonnet 4.5</SelectItem>
              <SelectItem value="openai">GPT-4o</SelectItem>
            </SelectContent>
          </Select>

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([])}
              disabled={isBusy}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Zone messages */}
      <ScrollArea className="flex-1 pr-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-muted-foreground">
            <div className="space-y-2">
              <p className="text-sm">Démarre la conversation avec {PROVIDER_LABEL[provider]}.</p>
              <p className="text-xs">Tes messages ne sont pas persistés (M2 ajoutera ça).</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(m => (
              <Card
                key={m.id}
                className={`p-3 ${
                  m.role === 'user'
                    ? 'ml-12 bg-primary/5'
                    : 'mr-12'
                }`}
              >
                <Badge variant="outline" className="mb-2 text-xs">
                  {m.role === 'user' ? 'Toi' : 'Assistant'}
                </Badge>
                {m.parts.map((part, i) =>
                  part.type === 'text' ? (
                    <p key={i} className="whitespace-pre-wrap text-sm">
                      {part.text}
                    </p>
                  ) : null
                )}
              </Card>
            ))}

            {isBusy && (
              <p className="text-sm text-muted-foreground italic pl-3">
                {PROVIDER_LABEL[provider]} rédige
                <span className="inline-block animate-pulse">...</span>
              </p>
            )}

            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ton message..."
          disabled={isBusy}
          autoFocus
        />
        <Button type="submit" disabled={isBusy || !input.trim()}>
          {isBusy ? 'Envoi...' : 'Envoyer'}
        </Button>
      </form>
    </main>
  );
}