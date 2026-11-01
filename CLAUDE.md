# CLAUDE.md — Fiches (« darwin »)

Application de révision par fiches (répétition espacée SM-2), en **PWA
statique** sans étape de build : HTML / CSS / JavaScript « vanilla »
servis tels quels. Le nom affiché aux utilisateurs est **darwin**.
Le propriétaire n'est pas développeur : tout ce qui lui est adressé
(messages, commentaires, documentation) est **en français**, en langage
simple.

## Architecture

- `index.html` : l'appli (tous les écrans sont dans ce fichier). Les
  scripts sont chargés dans cet ordre, sans modules ni bundler :
  `config.js`, `error-report.js`, `user-scope.js` (dans le `<head>`),
  puis supabase-js (CDN), `sm2.js`, `db.js`, `sync.js`, `taxonomy.js`,
  `settings-model.js`, `defi-questions.js`, `defi.js`, `learn-links.js`,
  `app.js`.
- `js/app.js` (~18 000 lignes) : toute la logique de l'interface, dans une
  IIFE. Ne pas le lire en entier : chercher (`grep`) la fonction ou le
  libellé concerné.
- `js/db.js` : stockage local IndexedDB (l'appli marche hors-ligne).
- `js/sync.js` : synchronisation avec Supabase, données rattachées au
  compte (`owner_id`).
- `js/user-scope.js` : sépare les données locales par compte connecté.
- `js/sm2.js` : algorithme de répétition espacée.
- `js/settings-model.js` : réglages « développeur », **partagé** entre
  l'appli et `admin/`.
- `js/taxonomy.js` : lit `data/taxonomie.xlsx` directement (classement de
  la Librairie : catégorie → cycle → niveau → spécialité → matière).
- `js/defi.js` + `js/defi-questions.js` : le défi du jour (QCM), commun au
  site et à l'appli.
- `css/style.css` : variables de design dans le bloc `:root` en haut.
- `admin/` : « Darwin Admin », l'appli d'administration (réglages,
  abonnements, aperçu avec `index.html?preview=1` et
  `js/preview-inspector.js`).
- `site/` : site vitrine public. `legal/` : pages légales (CGU, CGV,
  confidentialité…). `guide/` : pages d'aide.
- `sw.js` : service worker (cache hors-ligne). `_headers` : en-têtes pour
  Netlify (ignoré par GitHub Pages).
- `tools/` : scripts Python (`lancement.py` : bilan / passage en public ;
  `build_site_pages.py` : génère les pages SEO depuis
  `packs/bibliotheque.json`, dossier absent du dépôt pour l'instant).

## Compte élève / compte enseignant (v247)

- Usages (`user_metadata.usages`) : `eleve` et/ou `enseignant` (l'ancien
  `perso` n'est plus proposé ni pris en compte).
- `activeRole()` dans `js/app.js` donne l'environnement utilisé
  (`student` / `teacher`) ; avec les deux usages, choix à l'ouverture
  (vue `role-picker`) puis bascule depuis l'accueil (pastille
  `#role-indicator`). Classes CSS sur `<body>` : `has-two-roles`,
  `role-student`, `role-teacher`. Le choix est mémorisé dans
  `fiches_active_role` (par compte, `js/user-scope.js`).
- Les différences entre les deux environnements sont à préciser avec le
  propriétaire au fur et à mesure.

## Backend : Supabase + Stripe

- Projet Supabase configuré dans `js/config.js` (URL + clé **anon**,
  publique par conception ; la sécurité repose sur les règles RLS).
  Ne **jamais** mettre la clé `service_role` ni une clé Stripe secrète
  dans le code client.
- SQL : `supabase-schema.sql` (base) puis les scripts de `supabase/`.
  Le propriétaire les exécute **à la main** dans l'éditeur SQL de
  Supabase. Toute migration doit donc être :
  - un nouveau fichier `supabase/roundNN_migration.sql` (ou nom
    descriptif), avec un en-tête en commentaire qui explique en français
    quoi faire et dans quel ordre ;
  - **idempotente** (`if not exists`, `create or replace`, `drop policy if
    exists`…), car elle peut être rejouée.
  - Signaler clairement dans la réponse qu'il faut l'exécuter.
- Fonctions Edge (Deno, TypeScript) dans `supabase/functions/` :
  `create-checkout`, `customer-portal`, `stripe-webhook`,
  `update-super-classes`. Déployées à la main (copier-coller dans le
  tableau de bord). Mode d'emploi : `supabase/functions/README-stripe.md`.
- Tests des fonctions (sans réseau, doublures en mémoire) :
  ```bash
  FICHES_NO_SERVE=1 deno test -A supabase/functions/tests/
  ```

## Livrer une nouvelle version (important)

À **chaque** modification de l'appli :
1. Incrémenter `CACHE_NAME` dans `sw.js` (`fiches-cache-v245` → `v246`).
2. Mettre la même valeur dans `APP_VERSION` en haut de `js/app.js`
   (`"v245"` → `"v246"`).
3. Si un fichier JS/CSS est ajouté, l'ajouter à `CORE_ASSETS` dans `sw.js`
   et la balise `<script>` / `<link>` dans `index.html`.

Sans l'étape 1, les utilisateurs gardent l'ancienne version en cache.

Les commentaires du code font référence aux numéros de version
(« v237 », « Round 65 ») : continuer cette convention pour les nouveautés
notables.

## Hébergement

GitHub Pages, branche `main`, dossier racine :
https://tokophobe.github.io/Fiches/. **Toute fusion dans `main` est mise
en ligne automatiquement** (1 à 2 minutes) pour tous les utilisateurs :
ne proposer une fusion que pour du travail terminé et vérifié. GitHub
Pages ignore `_headers` ; c'est `updateViaCache: "none"` (dans
`js/app.js`) qui garantit la détection des nouvelles versions de `sw.js`.

## Tester en local

Un service worker exige `localhost` ou HTTPS :
```bash
python3 -m http.server 8080
```
puis ouvrir http://localhost:8080. Chromium + Playwright sont disponibles
dans les sessions cloud pour vérifier une modification dans un vrai
navigateur. Sans serveur Supabase accessible, l'appli fonctionne en local
(IndexedDB) ; les fonctions en ligne (compte, sync, Librairie) ne sont pas
testables ainsi.

## Conventions

- JavaScript sans framework ni dépendance npm ; garder ce style (pas de
  build, pas de TypeScript côté client).
- Commentaires et textes d'interface en français.
- Préférer des modifications ciblées dans `app.js` plutôt que de grandes
  réécritures ; ne pas le découper sans que le propriétaire le demande.
- Travailler sur une branche, jamais directement sur `main`.
- Le `README.md` est en partie ancien (il décrit une appli « sans
  compte ») ; se fier au code et à ce fichier en priorité.

## Points en suspens (à revoir plus tard avec le propriétaire)

- **Prix et noms des formules incohérents** entre `site/index.html` et
  `legal/cgv.html` : formule de base « Individuel » (site) vs « Super
  élève » (CGV) ; Super école à 5 €/mois/enseignant (site) vs 50 €/an
  (CGV). Les offres vont encore évoluer : ne rien corriger sans demande,
  mais le rappeler quand on touche aux prix ou aux abonnements.
- `packs/bibliotheque.json` (utilisé par `tools/build_site_pages.py`)
  n'est pas dans le dépôt.
