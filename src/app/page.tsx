export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">ai-warmup</h1>
      <ul className="mt-4 list-disc list-inside">
        <li><a className="underline" href="/demo">Server Component + Action</a></li>
        <li><a className="underline" href="/streaming">Suspense streaming</a></li>
      </ul>
    </main>
  );
}