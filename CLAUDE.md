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

## Consignes permanentes du propriétaire (11 nov. 2026)

- **Propreté du code, en continu** : coder dans les règles de l'art, de
  façon structurée ; à chaque intervention, nettoyer ce qui est touché
  (code mort, doublons, styles CSS qui s'écrasent les uns les autres —
  `css/style.css` est très gros et contient des règles empilées) et le
  signaler. Un nettoyage plus large se propose, il ne s'impose pas en
  douce.
- **Appli pas encore ouverte au public** (date non fixée) : ne pas perdre
  de temps sur des cas qui n'existent pas encore (ex. boîtes créées par
  des enseignants pendant le développement : pas de reprise de données
  sophistiquée). Tenir à jour ce qu'il reste à faire avant l'ouverture
  (§8 de la spécification et bilan `tools/lancement.py`) et dire quand on
  pourra être prêt.
- **Le nom « darwin » peut changer** (vérification juridique en cours) :
  ne pas l'éparpiller davantage ; le jour venu, le changement devra
  toucher toute l'appli, le site, les pages légales et Darwin Admin
  (≈ 560 occurrences dans 38 fichiers au 11 nov. 2026).
- **Avant l'ouverture au public, rappeler** au propriétaire qu'il faut
  d'abord rédiger avec lui une **feuille de route d'exploitation** très
  complète : tâches quotidiennes / hebdomadaires / mensuelles (relecture
  des propositions dans Darwin Admin, signalements, quotas Supabase,
  Stripe, sauvegardes…), points de vigilance et seuils (quand changer de
  forfait), obligations administratives (déclarations de chiffre
  d'affaires…), pour qu'aucun utilisateur ne soit bloqué par un oubli.
  Brouillon commencé le 12 nov. 2026 :
  `docs/FEUILLE-DE-ROUTE-EXPLOITATION.md` (questions ❓ en attente de
  réponse ; à tenir à jour à chaque nouvelle tâche d'administration).

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
  révisions selon le compte élève / enseignant, droit de publier),
  `js/library-rules.js` (Librairie : ordre au hasard, mémoire du bouton
  « vidéos de cours », v275), `js/publication-rules.js` (publication avec
  relecture, étape A). Pour ajouter un test sur une
  autre règle, extraire de la même façon la logique concernée.
- **Lancer les tests avant chaque livraison.** Quand une règle de la
  spécification change, mettre à jour son test dans la même branche ;
  nommer chaque test en français d'après la règle qu'il vérifie.

## Architecture

- `index.html` : l'appli (tous les écrans sont dans ce fichier). Les
  scripts sont chargés dans cet ordre, sans modules ni bundler :
  `config.js`, `error-report.js`, `user-scope.js` (dans le `<head>`),
  puis supabase-js (CDN), `sm2.js`, `revision-algo.js`, `profile-rules.js`, `library-rules.js`, `db.js`, `sync.js`, `taxonomy.js`,
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
  `programme.py` : page « Le programme » du site et `docs/PROGRAMME.md` ;
  `build_site_pages.py` : génère les pages « Fiches par matière »
  `site/revision/` et `site/sitemap.xml` depuis `bibliotheque.json` (copie
  de travail à la racine) et recopie dans `site/assets/` les fichiers du
  défi du jour (`js/defi.js`, `js/defi-questions.js`, `css/defi.css`) ;
  à relancer après chaque lot de boîtes, comme `programme.py`).
- Site vitrine (v288) : `site/index.html`, `site/defi.html`,
  `site/programme.html`, styles communs `site/assets/site.css` et polices
  locales `site/assets/fonts.css`. Le site de la v272 n'avait jamais été
  enregistré dans le dépôt (restauré le 13 nov. 2026 depuis la copie du
  propriétaire) : **tout fichier du site doit être committé**.

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
- v275 : publier dans la Librairie (et filtres « mes boîtes publiées /
  non publiées », « Mes boîtes publiées ») réservé au profil enseignant
  (`ProfileRules.canPublishToLibrary`, CSS `body:not(.profile-teacher)`).
  L'auteur des boîtes n'est plus affiché.
- Chantier « publication avec relecture » (plan validé le 9 nov. 2026,
  spéc. §7.2, étapes A à F) : toute boîte destinée à la Librairie devient
  une proposition (`library_submissions`) relue par darwin ; licence non
  exclusive acceptée une fois par boîte (`library_license_acceptances`) ;
  échanges dans `library_submission_messages`. Étape A :
  `supabase/publication_relecture_A_migration.sql`, règles dans
  `js/publication-rules.js`, brouillon juridique
  `docs/brouillon-licence-publication.md`. Étape B (v278) :
  `supabase/publication_relecture_B_migration.sql` (publication directe
  réservée à darwin, boîtes d'enseignants « en relecture » via
  `library_collections.review_hold`) ; dans `app.js` :
  `refreshPublicationState`, `licenseNeededFor`,
  `boxInPublicationCircuit`, renvoi automatique `scheduleLibraryResubmit`
  (appelé par `pushSharedBoxUpdatesForSubject`). `Sync.library.share`
  ne sert plus qu'à un administrateur. Étape D (v279) :
  `supabase/publication_relecture_D_migration.sql`
  (`admin_withdraw_submission`) ; vue `darwin-messages`
  (`renderDarwinMessagesView`, `applyDarwinVersionToBox`,
  `requestLibraryWithdrawal`) rangée dans `reports-hub`, pastille dans
  `refreshReportsBadge` ; Darwin Admin `openSubmission` : tous les champs
  des fiches, fil des messages, retrait. v280
  (`supabase/v280_migration.sql`) : accord en deux cases
  (`commercial_consent`, `box_hash`), textes de licence dans
  `library_license_texts` (l'appli affiche celui de
  `PublicationRules.LICENSE_VERSION`), mention de l'auteur
  (`author_mode` / `author_label`, `set_box_author_mention`),
  `admin_update_published_submission`, réponse automatique aux demandes
  de retrait (`auto_reply`), temps réel (`class_messages`,
  `library_submission_messages` dans la publication `supabase_realtime` ;
  `startLiveNotifications` dans `app.js`, `startLibraryLive` dans
  `admin.js`). Suivi des modifications : `PublicationRules.wordDiff`.
  Étape E (v287, `supabase/v287_migration.sql`) : « Signaler cette
  boîte » (`openReportView(s, null)`, colonne `card_reports.scope`) ;
  signalements Librairie lus et traités par darwin seulement (RLS,
  `admin_handle_report`, `PublicationRules.reportRecipient`) ; réglage
  `libraryPolicy.darwinOnly` appliqué par la vue `library_catalog`
  (`library_darwin_only()`) ; déclencheur
  `keep_published_boxes_on_user_delete` sur `auth.users`. Reste
  l'étape C (export / import des décisions pour la relecture par Claude)
  et F (plus tard).
  À l'étape C, charger `publication-rules.js` aussi dans `admin/`.
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
- Programme couvert (v288, spéc. §7.6) : `data/programme.json` (classes →
  matières → chapitres → boîtes ; un chapitre découpé a aussi `sousthemes` : [{titre, boites}], ses `boites` étant alors « l'essentiel ») est la référence ; `python3
  tools/programme.py genere` (avec `bibliotheque.json` présent) rafraîchit
  titres et nombres de fiches, ajoute les nouvelles boîtes comme chapitres
  et réécrit `docs/PROGRAMME.md`, `site/programme.html` et
  `docs/PLAN-CREATION.md` (boîtes à créer numérotées par priorité, suivies
  aussi par le bilan `tools/lancement.py`) ; ne pas modifier ces fichiers
  à la main. **Après chaque lot de boîtes** : lancer
  `python3 tools/build_site_pages.py` puis `genere`, rattacher à la main dans `data/programme.json` chaque nouvelle
  boîte qui couvre un chapitre « à créer » (déplacer la boîte, supprimer
  le chapitre ajouté), relancer `genere` et livrer dans ce dépôt-ci.
- Fiches datées (14 nov. 2026) : `tools/fiches_a_verifier.py` retrouve, par
  thèmes, les fiches dont le contenu change avec le temps (zone euro,
  population, tourisme, CO₂…) et écrit la liste dans le dépôt privé
  (`Fiches-contenu/A-VERIFIER-CHAQUE-ANNEE.md`, jamais ici : elle contient
  le texte des fiches). Relecture chaque été (feuille de route §4). Toute
  nouvelle fiche datée doit être retrouvée par un thème du script.
- Liens des fiches (spéc. §5.7, règle 5 et Q21) : le titre de la vidéo
  doit correspondre au sujet précis de la fiche (vérifier le titre via
  oEmbed). À chaque relecture de boîte, remplacer chaque lien Wikipédia
  par une courte vidéo de cours sur ce sujet, ou le retirer s'il n'y en
  a pas (1 259 liens Wikipédia au 13 nov. 2026).
- Vidéos des boîtes toutes prêtes : chaque vidéo doit être publique,
  intégrable et venir d'une chaîne d'enseignement (pas de webinaire,
  rediffusion en direct, interview, chaîne pour étrangers apprenant le
  français). Vérifier avec `python3 tools/verifier_videos.py --liste`
  (accès à www.youtube.com, autorisé dans l'environnement cloud
  « Fiches (darwin) »).
