# CLAUDE.md — Fiches (« darwin »)

Application de révision par fiches (répétition espacée), en **PWA
statique** sans étape de build : HTML / CSS / JavaScript « vanilla »
servis tels quels. Le nom affiché aux utilisateurs est **darwin**.
Le propriétaire n'est pas développeur : tout ce qui lui est adressé
(messages, commentaires, documentation) est **en français**, en langage
simple.

## Accompagnement du propriétaire

Le propriétaire apprend à développer avec Claude Code. Il demande des
**conseils proactifs**, en fin de réponse et en quelques lignes : façon
d'utiliser Claude Code, méthode de développement, et **alerter tôt** sur
tout ce qui risquerait d'obliger un jour à « tout reprendre » (dette
technique, choix difficiles à défaire, absence de tests, risques de mise
en ligne). Rester concret et proportionné : un conseil utile, pas un cours.

## Spécification fonctionnelle (à lire en premier)

`docs/SPECIFICATION.md` est **la référence de la logique de l'appli**,
partagée avec le propriétaire, qui y écrit aussi ses demandes.

- Le lire **avant** toute modification de l'appli. Traiter les demandes
  de sa rubrique « Demandes » comme des demandes du propriétaire.
- Si une demande contredit une règle existante, ou si le code ne fait
  pas ce que dit le document : **le signaler et demander** avant de
  coder.
- À chaque modification livrée, dans la **même branche** que le code :
  mettre à jour les règles et écrans concernés, cocher la demande et la
  déplacer dans le journal des changements (version, date, résumé), et
  noter les nouvelles questions dans « Questions ouvertes ».
- Langage simple, sans code ni noms de fonctions dans le document.

## Rédaction de fiches et de boîtes (contenu)

Pour toute fiche ou boîte rédigée (boîtes toutes prêtes de
`bibliotheque.json`, exemples, tests…), suivre les règles d'écriture du
§5.7 de `docs/SPECIFICATION.md`. En particulier : **une fiche QCM est
aussi posée sans ses propositions**, sa question doit donc avoir du sens
toute seule (jamais « Laquelle de ces propositions… », « Parmi les
réponses suivantes… », « Quel est l'intrus ? » sans la liste). Vérifier
avec `qcmQuestionNeedsChoices` (`js/settings-model.js`).

## Tests automatiques (v252)

- `node --test tests/*.test.js` (aucune dépendance) ; lancés aussi par
  GitHub Actions (`.github/workflows/tests.yml`) à chaque envoi.
- La logique testable vit hors de `app.js`, dans des fichiers sans
  écran ni stockage, l'heure étant passée en paramètre : `js/revision-algo.js`
  (algorithme, §4 de la spécification), `js/profile-rules.js` (agenda et
  révisions selon le compte élève / enseignant). Pour ajouter un test sur une
  autre règle, extraire de la même façon la logique concernée.
- **Lancer les tests avant chaque livraison.** Quand une règle de la
  spécification change, mettre à jour son test dans la même branche ;
  nommer chaque test en français d'après la règle qu'il vérifie.

## Architecture

- `index.html` : l'appli (tous les écrans sont dans ce fichier). Les
  scripts sont chargés dans cet ordre, sans modules ni bundler :
  `config.js`, `error-report.js`, `user-scope.js` (dans le `<head>`),
  puis supabase-js (CDN), `sm2.js`, `revision-algo.js`, `profile-rules.js`, `db.js`, `sync.js`, `taxonomy.js`,
  `settings-model.js`, `defi-questions.js`, `defi.js`, `learn-links.js`,
  `app.js`.
- `js/app.js` (~18 000 lignes) : toute la logique de l'interface, dans une
  IIFE. Ne pas le lire en entier : chercher (`grep`) la fonction ou le
  libellé concerné.
- `js/db.js` : stockage local IndexedDB (l'appli marche hors-ligne).
- `js/sync.js` : synchronisation avec Supabase, données rattachées au
  compte (`owner_id`).
- `js/user-scope.js` : sépare les données locales par compte connecté.
- `js/revision-algo.js` : algorithme de révision (calcul des délais,
  sprint, ordre des fiches d'une séance) — testé dans `tests/`.
- `js/sm2.js` : ancien algorithme SM-2, seul `isDue` sert encore.
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
- v256 (Q6) : pas de révisions dans le compte enseignant. Classe
  `profile-teacher` sur `<body>` (aussi pour un compte seulement
  enseignant) : masque en CSS pictos et affichages « dans / hors
  révisions » et la jauge ; les pages de révision sont bloquées dans le
  gestionnaire des onglets (`REVISION_VIEWS`,
  `showTeacherNoRevisionMessage`). Agenda par compte et échéances qui
  comptent pour les révisions : `js/profile-rules.js` (champ `profile`
  des évènements, `profileCalendarEvents` / `revisionCalendarEvents`).
- Les autres différences sont à préciser avec le propriétaire (spéc. §3.2).

## Organisation des boîtes (v248, v254)

- La page Organisation montre **toutes** les boîtes de l'utilisateur, dans
  ou hors de ses révisions (`outOfRevisions`) ; pictos : `boxIconMarkup`
  (type de boîte) et `revisionStateIconMarkup` (état). v264 : trois
  filtres exclusifs (`setOrgFilter` : `rev` / `published` /
  `unpublished`, classes `org-pub-yes` / `org-unpub-yes`) ; recherche et
  barre d'outils (`#manage-toolbar-sticky`) collantes dans la page. La page « Mes créations » a été supprimée en v254 ;
  il reste du code mort `manageMode === "creations"` dans `app.js`.
- Pages d'une boîte et d'une classe : blocs repliables `.info-block`
  (`applyInfoBlockStates`, `infoRowBlock`).

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
   (`"v245"` → `"v246"`) **et** dans `ADMIN_VERSION` en haut de
   `admin/admin.js` (sinon Darwin Admin affiche à tort « une version plus
   récente est en ligne »).
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

**Copie de test (v258, Q8)** : mode d'emploi dans `docs/COPIE-DE-TEST.md`.
Netlify (`netlify.toml`) publie chaque demande de fusion à une adresse
`…netlify.app` ; `js/config.js` y branche la base Supabase de TEST
(`tcyvrkiccmlozwkvhpul`), avec un bandeau « VERSION DE TEST ». La base
RÉELLE (`pyqffmweflicfpbniroz`) sert partout ailleurs. Une migration SQL
s'exécute d'abord dans la base de test, puis dans la réelle, et doit
**toujours** être enregistrée dans `supabase/`.
⚠ Constat du 4 nov. 2026 : des scripts exécutés sur la base réelle
(`round69`, `71`, `76`, `77`, `79`, `80`, `82`…) manquent au dépôt. La
structure de référence est l'export de la base réelle
(`supabase/copie-de-test/`).

## Tailles d'écran (v263)

- Téléphones : « zoom automatique » (script en tête d'`index.html`,
  réglage `autoZoom` de Darwin Admin) — chaque page est mise en page pour
  390 px de large puis agrandie/réduite pour remplir la largeur. Petite
  dette technique (la norme est une mise en page fluide), gardée tant
  qu'elle donne satisfaction.
- Pages de contenu : colonne fluide de 560 px maximum (`.desk`).
- Accueil (v264) : un seul dessin de référence (`#home-stage`, 390 × hauteur
  utile) mis à l'échelle par `fitHomeStage` pour tenir en largeur ET en
  hauteur ; sans défilement quand il tient (`body.home-fits`). Repères inchangés pour Darwin Admin : ronds en % de 354 × 640
  (à 18 px du bord), robot / logo darwin en % de 354 px et de 816 px.
- À chaque livraison qui touche l'affichage : planche de captures sur
  iPhone SE, iPhone 13, iPhone Pro Max, iPad, PC 1366×768 et 1920×1080,
  à montrer au propriétaire.

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

- Boîtes toutes prêtes : `bibliotheque.json` (contenu payant), rangé dans
  le **dépôt privé `tokophobe/Fiches-contenu`** (v273). **Ne jamais le
  committer ici** (il est dans `.gitignore`) : ce dépôt est public et
  GitHub Pages / Netlify servent tout son contenu. Pour mettre à jour les
  boîtes : cloner Fiches-contenu, copier le fichier à la racine de ce
  dépôt-ci (copie de travail ignorée par git), le modifier par lots de 50
  boîtes avec `tools/maj_boites.py` (règles du §5.7 ; marqueurs `w`/`wq`
  tenus à jour pour Darwin Admin), puis le recopier et le pousser dans
  Fiches-contenu. Le propriétaire le publie depuis Darwin Admin
  (Librairie → Boîtes toutes prêtes → « Importer la dernière version »,
  qui le lit sur GitHub avec une clé en lecture seule enregistrée dans son
  navigateur).
