# La copie de test de darwin

## À quoi ça sert

Avant d'être mise en ligne pour tout le monde, chaque nouvelle version
peut être essayée sur une **copie de test** : même appli, mais branchée
sur une **base de test** (faux comptes, fausses fiches). Une erreur ne
touche alors aucun vrai utilisateur.

| | Appli réelle | Copie de test |
|---|---|---|
| Adresse | https://tokophobe.github.io/Fiches/ | https://darwin-test.netlify.app (et un lien par demande de fusion) |
| Publiée par | GitHub Pages | Netlify |
| Base de données | Supabase **darwin** (réelle) | Supabase **darwin-test** |
| Repère visuel | — | bandeau orange « VERSION DE TEST » en bas de l'écran |

Le choix de la base est **automatique** (fichier `js/config.js`) : les
adresses Netlify et les essais en local utilisent la base de test, toutes
les autres la base réelle. Il n'y a rien à changer d'une version à
l'autre.

## Ce qui ne doit jamais circuler

- ✅ L'adresse d'un projet Supabase et sa clé **anon / public** :
  publiques par nature (elles sont dans le code de l'appli).
- ❌ La clé **service_role** et le **mot de passe de la base** : ils
  ouvrent tout. Jamais dans une conversation, jamais dans le code.

---

## Mise en place (une seule fois)

### Étape 1 — Créer le projet Supabase de test ✅ (fait le 4 nov. 2026)

Projet **darwin-test** : `https://tcyvrkiccmlozwkvhpul.supabase.co`.

### Étape 2 — Exporter la structure de la base réelle ✅ (fait le 4 nov. 2026)

Pourquoi : plusieurs scripts SQL ont été exécutés sur la base réelle sans
être enregistrés dans le dépôt. On demande donc à la base réelle de
décrire elle-même sa structure. Le script ne fait **que lire** ; il ne
lit aucune donnée d'utilisateur.

1. Supabase → projet **darwin** (le réel ; vérifier le nom en haut à
   gauche).
2. Menu de gauche → **SQL Editor** → **New query**.
3. Coller tout le contenu de `supabase/copie-de-test/1-exporter-la-structure.sql`,
   puis **Run**. Si Supabase demande « Run and Enable RLS » ou « Run
   without RLS », choisir **Run without RLS** (le script ne crée rien).
4. Le résultat est une seule case, « structure ». Au-dessus des
   résultats, cliquer sur **Export** (ou « Download ») → **Download CSV**.
   Un fichier est enregistré sur l'ordinateur.
5. Déposer ce fichier dans le dépôt GitHub, sur la branche de travail
   indiquée par Claude :
   - aller sur https://github.com/tokophobe/Fiches ;
   - choisir la branche (bouton en haut à gauche, qui affiche `main`) ;
   - ouvrir le dossier `supabase/copie-de-test` ;
   - **Add file** → **Upload files** → glisser le fichier → **Commit changes**
     (laisser « Commit directly to the … branch »).
6. Prévenir Claude : il prépare le script de construction de la base de
   test (`2-creer-la-base-de-test.sql`) et le vérifie avant de vous le
   donner.

### Étape 3 — Construire la base de test ✅ (fait le 4 nov. 2026)

1. Supabase → projet **darwin-test** (vérifier le nom !).
2. **SQL Editor** → **New query** → coller tout le contenu de
   `supabase/copie-de-test/2-creer-la-base-de-test.sql` → **Run**.
3. Le message « Success » doit s'afficher. Le script peut être relancé
   sans risque.

### Étape 4 — Réglages de connexion de la base de test ✅ (fait le 4 nov. 2026)

Supabase → projet **darwin-test** → **Authentication** :

1. **Sign In / Providers** (ou « Providers » → Email) : décocher
   **Confirm email**, puis enregistrer. Les comptes de test sont ainsi
   utilisables tout de suite, sans email de confirmation.
2. **URL Configuration** :
   - **Site URL** : l'adresse Netlify de l'étape 5 (par exemple
     `https://darwin-test.netlify.app`) ;
   - **Redirect URLs** → **Add URL** : `https://*--darwin-test.netlify.app/**`
     puis `https://darwin-test.netlify.app/**` (en remplaçant
     `darwin-test` par le nom choisi à l'étape 5).

### Étape 5 — Créer l'adresse de test chez Netlify ✅ (fait le 4 nov. 2026)

Site Netlify **darwin-test**, en mode **privé** (il faut être connecté
à Netlify pour l'ouvrir, y compris sur l'iPhone). Le compte Netlify
existait déjà (connexion par email), relié ensuite à GitHub.

1. Aller sur https://app.netlify.com → **Sign up** → **GitHub**
   (s'inscrire avec son compte GitHub). C'est gratuit.
2. **Add new project** (ou « Add new site ») → **Import an existing
   project** → **GitHub** → autoriser Netlify → choisir **tokophobe/Fiches**.
3. Les réglages sont lus dans le fichier `netlify.toml` du dépôt : ne rien
   changer, cliquer sur **Deploy**.
4. **Project configuration** (ou « Site configuration ») → **Change
   project name** → `darwin-test` (ou un nom libre) : l'adresse devient
   `https://darwin-test.netlify.app`.
5. Vérifier que **Deploy Previews** est activé (Project configuration →
   Build & deploy → Branches and deploy contexts) : « Any pull request
   against your production branch ».

### Étape 6 — Premier essai (compte de test créé et administrateur le 4 nov. 2026)

1. Ouvrir `https://darwin-test.netlify.app` : le bandeau orange
   « VERSION DE TEST » doit apparaître en bas.
2. Créer un compte (le même email que d'habitude, ou un autre).
3. Supabase → **darwin-test** → SQL Editor → exécuter
   `supabase/copie-de-test/3-me-donner-les-droits-admin.sql` (droits
   d'administrateur dans la base de test).
4. Essayer : créer une boîte et des fiches, réviser, créer une classe,
   publier une boîte dans la Librairie.

### Plus tard — Paiements en mode test (Stripe)

Les fonctions de paiement ne sont pas installées dans la base de test.
On pourra le faire plus tard avec les clés « mode test » de Stripe
(aucun vrai paiement). En attendant, les pages d'abonnement de la copie
de test afficheront une erreur : c'est normal.

---

## Au quotidien

1. Claude prépare une version et ouvre une demande de fusion.
2. Sur la page de la demande de fusion, une minute après, Netlify ajoute
   un commentaire et une ligne dans les vérifications (« deploy/netlify »,
   « Deploy Preview ») avec un lien du type
   `https://deploy-preview-19--darwin-test.netlify.app`. On l'ouvre (le
   bandeau « VERSION DE TEST » doit être là) et on essaie.
3. Si tout va bien : **Merge**. La version part sur l'appli réelle.

**Scripts SQL (migrations)** : toujours dans cet ordre —
1. d'abord dans **darwin-test**, et on essaie le lien de test ;
2. puis, une fois la fusion décidée, dans **darwin** (réel).
Chaque script doit être enregistré dans le dépôt (dossier `supabase/`).

## Si la mise en ligne de l'appli réelle échoue

Après une fusion, ouvrir https://github.com/tokophobe/Fiches/actions : la
ligne « pages build and deployment » la plus récente doit avoir une coche
verte (en ligne en 1 à 20 minutes selon la charge de GitHub).

- **Croix rouge, « Timeout reached »** : GitHub a été trop lent. Relancer
  une fois (« Re-run jobs » sur la page de l'échec).
- **Croix rouge, « Deployment failed, try again later »** (la mise en
  ligne reste « deployment_queued » plusieurs minutes) : GitHub est
  encombré. Relancer une fois ; si la relance échoue aussi, fusionner une
  nouvelle petite modification (cas du 6 nov. 2026, v269).
- **Croix rouge, « Deployment cancelled »** juste après une relance :
  GitHub refuse de remettre en ligne une version dont la mise en ligne a
  été annulée. Une relance ne sert alors plus à rien : il faut une
  nouvelle version (n'importe quelle petite modification fusionnée dans
  `main`, par exemple une mise à jour de la documentation).
- En cas de doute, https://www.githubstatus.com indique les incidents en
  cours chez GitHub (« Pages », « Actions »).
- Pendant ce temps, l'appli réelle reste sur la version précédente : rien
  n'est cassé pour les utilisateurs. La copie de test (Netlify) a déjà la
  nouvelle version.

## En cas de doute

- Le bandeau « VERSION DE TEST » est absent alors qu'on croit être sur la
  copie de test → on est sur l'appli réelle : ne rien y essayer.
- Le projet Supabase gratuit se met en pause après une semaine sans
  activité : Supabase → darwin-test → **Restore project** (ou « Resume »).
