'use server';
//  ^^^^^^^^^^^^
// Cette directive en haut du fichier dit à Next.js :
// "TOUS les exports de ce fichier sont des Server Actions.
//  Crée un endpoint HTTP pour chacun. Ne les bundle JAMAIS côté client."

export async function echoMessage(formData: FormData) {
  const message = formData.get('message')?.toString() ?? '';

  // Simule un traitement serveur (ex: appel DB, appel LLM)
  await new Promise(r => setTimeout(r, 1000));

  return {
    received: message,
    serverTime: new Date().toISOString(),
  };
}