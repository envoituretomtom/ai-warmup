import { Suspense } from 'react';

// Un composant async qui prend du temps à charger.
// Dans la vraie vie ce serait : appel LLM, appel API lente, query DB lourde.
async function SlowComponent({
  delay,
  label,
}: {
  delay: number;
  label: string;
}) {
  await new Promise(r => setTimeout(r, delay));
  return (
    <div className="border rounded p-4">
      <p className="font-mono">{label}</p>
      <p className="text-sm text-gray-500">Loaded after {delay}ms</p>
    </div>
  );
}

// Le fallback affiché pendant le chargement.
function Loading({ label }: { label: string }) {
  return (
    <div className="border rounded p-4 opacity-50 animate-pulse">
      Loading {label}...
    </div>
  );
}

export default function StreamingPage() {
  return (
    <main className="p-8 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Streaming demo</h1>
      <p className="text-sm text-gray-500">
        Chaque bloc apparaît dès qu'il est prêt, sans bloquer les autres.
      </p>

      <Suspense fallback={<Loading label="block 1" />}>
        <SlowComponent delay={800} label="Block 1" />
      </Suspense>

      <Suspense fallback={<Loading label="block 2" />}>
        <SlowComponent delay={2000} label="Block 2" />
      </Suspense>

      <Suspense fallback={<Loading label="block 3" />}>
        <SlowComponent delay={4000} label="Block 3" />
      </Suspense>
    </main>
  );
}