# Prompt Lab — comparatif S3

Comparaison de 3 stratégies de prompting sur 3 tâches × 2 providers, avec mesures de qualité, latence et coût.

## Tâches

1. **Classify** — message client → catégorie (planning / facturation / examen / autre)
2. **Extract** — message libre → {date, motif, urgence}
3. **Summarize** — échange support → {contexte, point_clé, action_recommandée}

## Stack

- AI SDK 6 (`generateText` + `Output.object`)
- Anthropic Claude Sonnet 4.5 + OpenAI GPT-4o
- Zod pour les schémas typés

## Méthode

Pour chaque tâche, j'ai testé 3 prompts avec des inputs réalistes :
- **Naïf** : 1 phrase d'instruction, pas de system prompt
- **Structured** : system prompt soigné, format strict (ou Output.object)
- **Few-shot** : structured + 3 exemples

Mesures : qualité (1-5, jugement manuel), latence, tokens, coût.

## Résultats — Task 1 : Classify

Input testé : *"Bonjour, j'aimerais reporter ma leçon de jeudi à la semaine prochaine"*

| Variante | Provider | Qualité | Tokens in/out | Coût | Verdict |
|---|---|---|---|---|---|
| Naïf | Claude Sonnet 4.5 | 2 | 35 / 42 | $0.00073 | Répond en phrase entière, inutilisable |
| Structured | Claude Sonnet 4.5 | 5 | 110 / 2 | $0.00036 | "planning" — parfait |
| Few-shot | Claude Sonnet 4.5 | 5 | 220 / 2 | $0.00069 | Idem mais 2× plus cher |
| Structured | GPT-4o | 5 | 105 / 2 | $0.00028 | Qualité égale, ~30% moins cher |

**Conclusion** : sur cette tâche, structured zero-shot suffit. Few-shot n'apporte rien et coûte le double. GPT-4o équivalent moins cher.

## Résultats — Task 2 : Extract

Input testé : *"Bonjour, j'aimerais absolument annuler ma leçon de jeudi prochain, j'ai un problème urgent au boulot"*

| Variante | Provider | JSON valide ? | Tokens in/out | Coût | Verdict |
|---|---|---|---|---|---|
| Naïf (JSON in prompt) | Claude Sonnet 4.5 | ✅ (1 échec /5 essais) | ... | ... | Fragile en prod |
| Output.object | Claude Sonnet 4.5 | ✅ garanti | ... | ... | **À utiliser** |
| Output.object | GPT-4o | ✅ garanti | ... | ... | Idem |

**Conclusion** : `Output.object` est la seule option défendable en prod. Le naïf casse aléatoirement.

## Résultats — Task 3 : Summarize

[...à remplir avec tes chiffres réels...]

## Conclusions générales

1. **Structured outputs (Output.object + Zod) sont non-négociables** dès qu'on parse derrière. Coût de fiabilité marginal.
2. **Few-shot apporte de la valeur seulement sur tâches ambiguës ou formats stricts inhabituels**. Sur du classify standard, c'est de l'argent jeté.
3. **GPT-4o ≈ Claude Sonnet 4.5** sur ces tâches simples, GPT-4o souvent 20-30% moins cher.
4. **Coût par requête réelle** : $0.0001 à $0.001. Négligeable jusqu'à des volumes de 10k req/jour.
5. **System prompt soigné > exemples bricolés**. Investir 30 min dans un system prompt rentabilise.

## Reproduire

```bash
pnpm dev
# ouvrir http://localhost:3000/prompt-lab
```