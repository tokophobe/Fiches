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
  relecture, étape A), `js/card-forms.js` (formes d'une fiche, spéc. §4.7 :
  (a) QCM, (b) question, (c) texte à trous `cloze`, (d) question poussée
  `q2`/`a2` ; suivi `form`, `formMax`, `formStreak`). Branché en v296
  (étape 2) : dans `app.js`, `reviewForm` donne la forme posée ;
  texte à trous (v298) dans la fiche du QCM (`qcm-panel`, `qcmState` avec
  `kind: "cloze"`, `startCloze`, `drawCloze`, `checkCloze` lancé tout
  seul quand tous les trous sont remplis, v299) ; saisie dans l'écran
  d'une fiche (v299) : phrase à [crochets] (`CardForms.clozeFromBrackets`
  / `clozeToBrackets`), `setLevel2Fields` / `readLevel2Fields`,
  `nextAfterRating` applique
  montée / descente, `lastRatedForm` évite le « Tu es sûr ? » d'une forme
  à l'autre ; `qcmMode` n'est plus qu'un reflet de `form === "a"`. Les
  champs `q2`, `a2`, `cloze` doivent suivre la fiche partout
  (`LEVEL2_FIELDS` dans `app.js` et `admin/admin.js`, `shareableCard`
  dans `sync.js`, `cardContentKey`, `tools/maj_boites.py`). Jauge (v297,
  spéc. §4.6) : une case par forme, dernière note à chaque forme dans
  `formRatings` (fiches plus anciennes : `legacyFormRatings`) ;
  `CardForms.gaugeCounts` sert à `buildPersGaugeSvg` et au tri des
  échéances. Listes de fiches (v302) : `cardSectionsHtml` (une section
  par forme, la plus poussée seule par défaut ; bouton filtre
  `.card-forms-filter-btn`, classe `card-forms-all` sur `<body>`, choix
  gardé dans `fiches_card_forms_all`) ; `dmCardFields` (appli) et
  `cardFieldsText` (Darwin Admin, qui charge aussi `card-forms.js`)
  comparent ces champs (`CardForms.clozeSummary`). Forme (cbis) (v303,
  essai) : texte à trous sans propositions, entre (c) et (d), règles de
  (b) ; `ORDER` = a, b, c, cbis, d ; allumée par `CardForms.setCbisEnabled`
  depuis `loadDevSettings` (réglage `cardForms.cbis`, Darwin Admin →
  Révision) ; dans `app.js`, sur la fiche normale : `revealState`,
  `clozeRevealHtml`, `revealNextBlank` (appelé par le toucher de la
  fiche). Pour ajouter un test sur une
  autre règle, extraire de la même façon la logique concernée.
- **Lancer les tests avant chaque livraison.** Quand une règle de la
  spécification change, mettre à jour son test dans la même branche ;
  nommer chaque test en français d'après la règle qu'il vérifie.

## Architecture

- `index.html` : l'appli (tous les écrans sont dans ce fichier). Les
  scripts sont chargés dans cet ordre, sans modules ni bundler :
  `config.js`, `error-report.js`, `user-scope.js` (dans le `<head>`),
  puis supabase-js (CDN), `sm2.js`, `revision-algo.js`, `profile-rules.js`, `library-rules.js`, `card-forms.js`, `db.js`, `sync.js`, `taxonomy.js`,
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
  à la main. `genere` écrit aussi `data/chapitres.json` (v293) : petit
  index « niveau|matière » → chapitres et clés des boîtes, qui range la
  Librairie par chapitres (`LibraryRules.groupByChapters`,
  `libraryChapterRows` dans `app.js`) ; une boîte d'enseignant a son
  chapitre dans `library_collections.programme_chapter`
  (« niveau|matière|titre », choisi par darwin dans `openSubmission`,
  `supabase/v293_migration.sql`). **Après chaque lot de boîtes** : lancer
  `python3 tools/build_site_pages.py` puis `genere`, rattacher à la main dans `data/programme.json` chaque nouvelle
  boîte qui couvre un chapitre « à créer » (déplacer la boîte, supprimer
  le chapitre ajouté), relancer `genere` et livrer dans ce dépôt-ci.
- Fiches hors sujet (14 nov. 2026, spéc. §5.7 règle 8) : aucune fiche sur
  l'organisation de l'école (axes ou thèmes d'un programme, épreuves) hors
  des boîtes de méthode, ni (16 nov. 2026) sur la méthode d'un exercice
  (dissertation, commentaire, introduction, plan… : `METHODE_FICHE`) ;
  `tools/maj_boites.py verifie` les signale (`hors_sujet`). À chaque relecture, vérifier aussi que chaque fiche
  correspond au titre de sa boîte.
- QCM qui se devine (18 nov. 2026, spéc. §5.7 règle 9) : pas d'indice
  dans la question, bonne réponse pas plus longue que les fausses
  (précisions en 2e ligne de la réponse), fausses réponses crédibles ;
  texte à trous : articles dans les trous, pas de trous collés.
  `tools/maj_boites.py qualite [CLE…]` liste les alertes (lancé aussi
  tout seul après `applique` et `decoupe`, qui se terminent en erreur s'il
  reste des alertes, 19 nov. 2026) ; une alerte se
  relit, ce n'est pas toujours une erreur : `accepte CLE#N` note la
  question dans le champ `qualite_ok` de la boîte (ignoré par Darwin
  Admin). Toute la Librairie traitée le 18 nov. 2026, puis remise à 0 alerte le
  19 nov. 2026 avec les contrôles « forme » et « formes poussées » ; lancer
  `qualite` sur chaque nouvelle boîte. Au primaire, pas de 2e ligne :
  réponse courte, explication dans `more` (« Pour aller plus loin »). Méthode : lister les alertes
  d'un niveau, écrire un lot (`applique`), relancer `qualite`, corriger
  le reste, `accepte` les alertes où le mot commun est la notion même. Corriger avant d'écrire les formes
  poussées d'une boîte.
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
  a pas (1 259 liens Wikipédia au 13 nov. 2026, tous sur des fiches : les liens de boîte sont tous des vidéos depuis la v292).
- Transcriptions des vidéos (15 nov. 2026) : YouTube bloque les serveurs
  (page « sorry ») ; ne pas contourner. Le propriétaire lance sur son Mac
  `outils/transcriptions.py` du dépôt privé (mode d'emploi
  `outils/MODE-EMPLOI-TRANSCRIPTIONS-MAC.md`, module youtube-transcript-api)
  et dépose `transcriptions.json.gz` dans Fiches-contenu
  ({videos: {id: {langue, auto, segments: [[début, durée, texte]]} ou
  {erreur}}}). Sert à vérifier chaque vidéo contre les fiches de sa boîte
  et à créer des extraits pour les fiches : lien
  `…watch?v=ID&t=DÉBUT&end=FIN` (secondes), géré par `js/learn-links.js`
  (v295, testé dans `tests/learn-links.test.js`). Jamais de transcription
  dans ce dépôt public. Mémoire (15 nov. 2026) : `transcriptions.json.gz`
  est l'archive permanente (chaque entrée datée ; l'outil la relit et ne
  redemande que les vidéos nouvelles) ; noter chaque vérification de
  vidéo et chaque extrait créé dans `Fiches-contenu/verifications-videos.json`
  ({id: {date, verdict, boites, extraits}}) et ne pas refaire ce qui y
  figure.
  Formes (c)/(d) (18 nov. 2026) : on les écrit d'abord pour les boîtes
  dont la vidéo est transcrite, en un seul passage par boîte (vérifier la
  vidéo, ajuster les fiches, écrire (c)/(d), créer les extraits). Lot
  d'essai : 5 boîtes de 3e, réécrites le 19 nov. 2026 après les remarques
  du propriétaire (spéc. §5.7 règle 11 : réponse (d) = texte à trous
  complété, question (d) différente de (b) et qui ne donne pas les trous,
  un trou par information importante, QCM de même forme ; contrôles
  automatiques dans `qualite`). 2e remarques (19 nov. 2026, chimie) : (d)
  demande plus que (b) et ne donne pas le plus difficile, pas de nom qui
  « tombe du ciel », complément qui explique les fausses réponses,
  « Exemple : » devant un exemple, rester dans l'essentiel du programme,
  extraits calés sur les segments de la transcription (`cale` dans
  `Fiches-contenu/outils/formes/run.py`). **Ne jamais plagier une vidéo** (spéc. §5.7
  règle 10) : écrire avec nos mots, la transcription ne sert qu'à vérifier
  et à minuter les extraits. Outils dans `Fiches-contenu/outils/formes/`
  (`voir.py` : fiches + transcription par tranches de 20 s).
  Lot 1 (20 nov. 2026) : 20 boîtes `r3e-` (5 maths, 10 histoire, 5
  géographie, 334 fiches, 180 extraits), fichiers dans
  `Fiches-contenu/outils/formes/lot1/` ; vidéos de `r3e-geo-metropoles`
  et `r3e-geo-periurbanisation` échangées. Lot 2 (20 nov. 2026) : les 17
  autres boîtes `r3e-` transcrites (272 fiches, 121 extraits), fichiers
  dans `lot2/` ; toutes les boîtes `r3e-` ont maintenant leurs formes
  (c)/(d). 21 nov. 2026 : 84 nouvelles transcriptions (206 boîtes à
  faire) ; lot 3 (`lot3/`) : les 16 boîtes `r35-brevet-` de maths,
  physique, chimie et technologie (297 fiches, 70 extraits). `run.py` ne
  remplace jamais un lien vidéo déjà présent sur une fiche ; `voir2.py`
  donne une vue compacte. Lot 4 (`lot4/`) : les 15 boîtes `r35-brevet-`
  de SVT, histoire, géographie et EMC (261 fiches). Vidéos à remplacer
  (rediffusions de directs) : `r35-brevet-svt-terre`,
  `r35-brevet-geo-urbain-rural`. Lot 5 (21 nov. 2026, essai langues) : 3 boîtes ;
  `r35-brevet-ang-temps` refaite après les 3es remarques (question (b)
  qui donne le verbe, texte à trous = exercice autonome avec le verbe entre
  parenthèses, forme (d) = traduction de cette phrase) ; **éviter la chaîne
  Englishhello**. Alternatives (21 nov. 2026, spéc. §5.7 règle 9) : une
  question ne cite jamais une partie de ses propositions (« A ou B ? »,
  « Vrai ou faux ? ») ; `qualite` le signale et l'alerte ne s'accepte
  pas (`question_alternative`) ; 309 fiches reformulées le 21 nov. 2026 ;
  23 nov. 2026 : aussi « conducteur ou isolant ? » quand les propositions
  sont plus longues (`alternative_courte`), 84 fiches reformulées
  (`Fiches-contenu/outils/corrections/alternatives_r4.py`). Lot 12
  (`lot12/`, 23-24 nov. 2026) : les 25 boîtes `r37-` de 3e transcrites
  (maths, SVT, histoire des arts, italien, français, oral du brevet, arts
  plastiques, musique ; 393 fiches, 120 extraits) ; vidéos partielles
  notées dans `verifications-videos.json` (« agir dans la cité », arts
  plastiques, musique : à compléter ou remplacer). Lot 13 (`lot13/`, 24 nov.
  2026) : les 20 boîtes de 4e transcrites (`r37-4e-`, `r38-a4-4e-`,
  `r4e-` ; 326 fiches, 97 extraits) ; vidéos à remplacer : anglais
  comparatifs (phrases à répéter), `r4e-fr-fausses-informations`
  (niveau primaire) ; `r4e-svt-puberte` double `r37-4e-svt-reproduction-puberte`. Lot 6 (`lot6/`) : 8 boîtes
  `r35-brevet-fr-` (135 fiches) ; (c) = petit exercice autonome à 2 trous
  ou plus qui s'opposent, (d) = même exercice sans propositions ; vidéos
  de l'indicatif (Englishhello) et des homophones changées, à transcrire ;
  chaîne « français pratique » (`r35-brevet-fr-modes`) à vérifier. Lot 7 (`lot7/`) : 5 boîtes de
  langues du brevet (anglais, espagnol, allemand ; 94 fiches) ; (d) =
  traduction de la phrase du texte à trous ; vidéo de
  `r35-brevet-esp-grammaire` à remplacer (83 min, ser/estar seulement). Lot 8 (`lot8/`) : 10 boîtes `r3e-`
  de SVT et de physique (160 fiches, 65 extraits). Lot 9 (`lot9/`) : 9
  anciennes boîtes `brevet-…` de 3e (141 fiches, 30 extraits). Lot 10
  (`lot10/`) : les 7 dernières boîtes de 3e transcrites (français, latin,
  grec, italien ; 116 fiches) : toute la 3e transcrite est faite. Lot 11
  (`lot11/`) : les 8 boîtes de 4e transcrites (134 fiches, 36 extraits). Texte à trous
  qui se suffit (21 nov. 2026, remarque du propriétaire) : jamais de
  « Ce vers… », « Il… », « On les… » renvoyant à la question (d) ; nommer
  le sujet, citer le vers, l'équation ou la phrase de départ ; `qualite`
  le signale (`texte_a_trous_sans_sujet`) ; 188 fiches corrigées
  (`Fiches-contenu/outils/corrections/sujets_r1.py`) ; 2e passe (22 nov.
  2026, Verdun) : renvois au milieu du texte (« s'y », « cette … »,
  « ces espaces ») et « C'est … » (repéré par `qualite`), 73 fiches
  (`sujets_r2.py`). Les renvois au milieu du texte ne se détectent pas
  sûrement : relire chaque texte à trous **sans sa question**. **Y
  veiller à chaque lot.** Complément qui répète la réponse (22 nov. 2026, remarque
  du propriétaire) : interdit ; `qualite` le signale (`complement_redit`) ;
  39 fiches corrigées (`Fiches-contenu/outils/corrections/redites_r1.py`).
  Article devant un trou (22 nov. 2026, « l'offensive du ___ ») : il ne
  doit convenir qu'à toutes les propositions ; `qualite` repère l'article
  à la fois devant le trou et dans une proposition, mais pas « du Marne »
  (genre d'un nom propre) : à relire ; 13 fiches (`articles_r1.py`).
  Fausses réponses d'un texte à trous (24 nov. 2026) : jamais la bonne
  réponse d'un autre trou (sauf boîtes de langue, `boite_de_langue`), pas
  de « seulement » / « uniquement » ; `qualite` le signale
  (`fausses_trompeuses`) ; 362 fiches (`croises_r1.py` et
  `corrections_croises.txt`). Toute information à apprendre est un trou
  (24 nov. 2026, remarque « apologue », spéc. §5.7 règle 11) : hors des
  trous, seulement ce que donne la question (d) et les mots de liaison ;
  `qualite` signale un mot de la fiche écrit en clair dans le texte et
  absent de q2 (`infos_hors_trous`, sauf exercices de langue
  `exercice_de_langue`) ; 1 573 textes signalés le 24 nov. 2026, environ
  la moitié à réécrire (le reste : sujet du texte, unité…, à accepter).
  Suite : français et langues du brevet,
  puis lycée et autres niveaux.
- Vidéos des boîtes toutes prêtes : chaque vidéo doit être publique,
  intégrable et venir d'une chaîne d'enseignement (pas de webinaire,
  rediffusion en direct, interview, chaîne pour étrangers apprenant le
  français). Vérifier avec `python3 tools/verifier_videos.py --liste`
  (accès à www.youtube.com, autorisé dans l'environnement cloud
  « Fiches (darwin) »).
