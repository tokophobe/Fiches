# Tests automatiques

Ces tests vérifient, sans ouvrir l'appli, que les règles de
[`docs/SPECIFICATION.md`](../docs/SPECIFICATION.md) sont bien respectées
par le code. Chaque test porte le nom de la règle qu'il vérifie.

| Fichier | Ce qu'il vérifie |
|---|---|
| `revision-algo.test.js` | L'algorithme de révision (§4) : délais du mode fond, mode sprint, entrée et sortie de sprint avec l'agenda, ordre des fiches dans une séance. |
| `qcm-questions.test.js` | Le repérage des questions QCM qui n'ont pas de sens sans leurs propositions (§5.7). |

## Quand sont-ils lancés ?

- **Automatiquement par GitHub**, à chaque envoi de code et sur chaque
  pull request : une coche verte ✅ (ou une croix rouge ❌) apparaît en
  bas de la pull request, et dans l'onglet « Actions » du dépôt.
  **Ne pas fusionner une pull request avec une croix rouge.**
- Par Claude, avant chaque livraison.

## Les lancer soi-même (facultatif)

Avec Node.js 22 installé, depuis le dossier du projet :

```bash
node --test tests/*.test.js
```

## Règle

Quand une règle de la spécification change, le test correspondant change
avec elle (dans la même branche). Une nouvelle règle importante = un
nouveau test.
