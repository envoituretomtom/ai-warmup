'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

type Provider = 'anthropic' | 'openai';

export default function ChatPage() {
  const [provider, setProvider] = useState<Provider>('anthropic');
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === 'streaming') return;
    // ↓ on passe le provider au moment de l'envoi
    sendMessage({ text: input }, { body: { provider } });
    setInput('');
  };

  return (
    <main className="max-w-2xl mx-auto p-4 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chat — warmup S2</h1>
        <select
          value={provider}
          onChange={e => setProvider(e.target.value as Provider)}
          className="border rounded px-2 py-1"
          disabled={status === 'streaming'}
        >
          <option value="anthropic">Claude Sonnet 4.5</option>
          <option value="openai">GPT-4o</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map(m => (
          <div
            key={m.id}
            className={`p-3 rounded-lg ${
              m.role === 'user' ? 'bg-blue-100 ml-12' : 'bg-gray-100 mr-12'
            }`}
          >
            <p className="text-xs font-semibold mb-1 opacity-60">
              {m.role === 'user' ? 'Toi' : 'Assistant'}
            </p>
            {m.parts.map((part, i) =>
              part.type === 'text' ? (
                <p key={i} className="whitespace-pre-wrap">
                  {part.text}
                </p>
              ) : null
            )}
          </div>
        ))}

        {status === 'streaming' && (
          <p className="text-sm text-gray-500 italic">L'assistant rédige...</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ton message..."
          disabled={status === 'streaming'}
          className="flex-1 border rounded px-3 py-2 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'streaming' || !input.trim()}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </main>
  );
}