'use client';
//  ^^^^^^^^^^
// Cette directive dit : "ce fichier (et ses imports) seront bundlés
// pour le navigateur, peuvent utiliser useState/useEffect/onClick."

import { useActionState } from 'react';
import { echoMessage } from './actions';

// Le type de retour de notre action (ou null avant le 1er appel)
type State = Awaited<ReturnType<typeof echoMessage>> | null;

export function EchoForm() {
  // useActionState gère trois choses pour nous :
  // - state : le résultat de la dernière action (ou null au début)
  // - action : la fonction à passer à <form action={}>
  // - pending : true pendant que l'action s'exécute
  const [state, action, pending] = useActionState<State, FormData>(
    async (_prevState, formData) => echoMessage(formData),
    null
  );

  return (
    <form action={action} className="space-y-2">
      <input
        name="message"
        placeholder="Écris quelque chose..."
        className="border rounded px-3 py-2 w-full"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {pending ? 'Envoi...' : 'Envoyer'}
      </button>

      {state && (
        <p className="text-sm">
          Reçu : "<strong>{state.received}</strong>" à {state.serverTime}
        </p>
      )}
    </form>
  );
}