import { EchoForm } from './echo-form';

async function getServerTime() {
  await new Promise(r => setTimeout(r, 500));
  return new Date().toISOString();
}

export default async function DemoPage() {
  const time = await getServerTime();

  return (
    <main className="p-8 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Demo — Server Component</h1>
      <p>
        Server time: <code className="bg-gray-100 px-1 rounded">{time}</code>
      </p>
      <p className="text-sm text-gray-500">
        Page rendue sur le serveur. Refresh pour voir l'heure changer.
      </p>
      <EchoForm />
    </main>
  );
}