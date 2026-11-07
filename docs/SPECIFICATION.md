# darwin — spécification fonctionnelle

> **Ce document est la référence de la logique de l'appli.** Il décrit ce
> que fait darwin, sans code. On le tient à jour à chaque changement.
>
> - **Vous** (propriétaire) : écrivez vos demandes dans la rubrique
>   [Demandes](#9-demandes), avec vos mots. Vous pouvez aussi modifier
>   directement n'importe quelle règle : la modification vaut demande.
> - **Claude** : lit ce document avant chaque modification de l'appli,
>   signale toute contradiction avant de coder, puis met à jour les règles,
>   les écrans et le [journal des changements](#10-journal-des-changements)
>   dans la même branche que le code.
>
> Si l'appli et ce document ne disent pas la même chose, c'est soit un
> bug, soit une décision à prendre (rubrique [Questions
> ouvertes](#8-questions-ouvertes)).

**Version de l'appli décrite : v253** — première rédaction le 2 novembre 2026,
à partir du code.

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Les concepts](#2-les-concepts)
3. [Comptes et usages](#3-comptes-et-usages)
4. [L'algorithme de révision](#4-lalgorithme-de-révision)
5. [Boîtes, dossiers et organisation](#5-boîtes-dossiers-et-organisation)
6. [Classes](#6-classes)
7. [Librairie et abonnements](#7-librairie-et-abonnements)
8. [Questions ouvertes](#8-questions-ouvertes)
9. [Demandes](#9-demandes)
10. [Journal des changements](#10-journal-des-changements)
11. [Annexe : les écrans](#11-annexe--les-écrans)
12. [Annexe : réglages de Darwin Admin](#12-annexe--réglages-de-darwin-admin)

---

## 1. Vue d'ensemble

**darwin** est une appli de révision par fiches question / réponse. Elle
décide elle-même **quand** reposer chaque fiche, selon les réponses
données et les échéances (contrôles, examens) notées dans l'agenda.

| Pour qui | Ce qu'il fait |
|---|---|
| **Élève** | Crée ses boîtes de fiches, révise, prend des boîtes dans la Librairie, rejoint les classes de ses enseignants. |
| **Enseignant** | Crée des classes, y partage des boîtes et des échéances, échange avec ses élèves. |
| **Administrateur** (darwin) | Règle l'appli depuis **Darwin Admin**, gère la Librairie, les abonnements, les établissements. |

L'appli s'installe sur un téléphone ou un ordinateur depuis le navigateur.
Elle fonctionne **hors connexion** : les changements partent vers le
serveur dès que le réseau revient. Une connexion à un compte est
**obligatoire** pour l'utiliser.

---

## 2. Les concepts

| Mot | Définition |
|---|---|
| **Compte** | Une adresse email + mot de passe. Toutes les données personnelles (boîtes, fiches, progression, agenda) appartiennent au compte et se retrouvent sur tous ses appareils. |
| **Usage** | « Élève » et/ou « Enseignant », choisis dans Mon compte. |
| **Compte élève / compte enseignant** | L'environnement utilisé, quand le compte a les deux usages (voir §3.2). |
| **Fiche** | Une question, une réponse ; en option : un complément (« en savoir plus »), 3 réponses fausses (mode QCM), un lien « Pour aller plus loin ». |
| **Boîte** | Un ensemble de fiches. Trois types, voir §5.1 : **à moi**, **de classe**, **de la Librairie**. |
| **Dossier** | Range des boîtes et d'autres dossiers, dans l'organisation. |
| **Dans / hors de mes révisions** | État d'une boîte : l'algorithme s'applique à ses fiches, ou non (la progression est gardée). Voir §5.2. |
| **Échéance (évènement)** | Une date dans l'agenda (contrôle, examen…), reliée à des boîtes. Elle fait passer ces boîtes en **mode sprint** (§4.3). |
| **Classe** | Un groupe créé par un enseignant, rejoint par des élèves avec un code. |
| **Librairie** | Le catalogue de boîtes publiées, accessible avec un abonnement (ou quelques boîtes gratuites). |
| **Collection** | Une boîte publiée dans la Librairie (c'est le mot utilisé dans le code). |
| **Signalement** | Un message envoyé à l'auteur d'une fiche pour lui signaler une erreur. |

---

## 3. Comptes et usages

### 3.1 Création du compte et connexion

À l'inscription, on donne : email, mot de passe, prénom, nom, date de
naissance, usages (élève et/ou enseignant, au moins un), niveau scolaire
(facultatif), et on accepte les conditions d'utilisation et la politique
de confidentialité.

La page est présentée en blocs, sans titre (v262) : prénom, nom, date de
naissance ; email, mot de passe ; « Utilisation de l'appli » ; niveau
scolaire. L'usage élève s'appelle « en utilisateur normal — pour un usage
personnel ou pour rejoindre les classes de tes enseignants » et il est
**coché par défaut**.

**Présentation commune (v262)** : un seul aspect pour toute l'appli —
- boutons principaux d'une seule couleur (celle du logo darwin) ;
  « Annuler », « Retour »… en gris ; « Supprimer » en rouge ;
- zones de saisie et textes d'exemple : même police, même taille, même
  gris pour l'exemple ;
- classement (catégorie → cycle → niveau…) : blocs emboîtés comme dans
  la Librairie, partout (création du compte, Mon compte, création ou
  classement d'une boîte, publication).

- **Connexion obligatoire** : sans compte connecté, seule la page Mon
  compte est accessible.
- **Mot de passe oublié** : un email permet d'en choisir un nouveau.
- **Moins de 15 ans** : l'email d'un parent est demandé ; le parent reçoit
  un email pour donner son accord. En attendant, le compte est
  **limité** : on peut créer ses fiches et réviser, mais pas :
  rejoindre ou créer une classe, écrire dans une messagerie, signaler une
  fiche à son auteur, s'abonner, gérer un établissement. La limite se lève
  à l'accord du parent, ou automatiquement le jour des 15 ans.
- **Suppression du compte** (Mon compte) : tout est effacé définitivement
  (boîtes, fiches, progression, agenda, messages, boîtes publiées, classes
  de l'enseignant).

### 3.2 Compte élève / compte enseignant

| Usages cochés | À l'ouverture de l'appli | Environnement |
|---|---|---|
| Élève seulement | Accueil | Élève |
| Enseignant seulement | Accueil | Enseignant |
| Les deux | Page « Avec quel compte veux-tu continuer ? » (deux boutons ronds), puis accueil | Celui choisi |
| Aucun (anciens comptes « usage personnel ») | Accueil, avec un bandeau qui demande de choisir | Élève |

- Le choix entre les deux comptes est proposé **à chaque ouverture** de
  l'appli ; le dernier choix est mémorisé sur l'appareil.
- **Repère visuel** (seulement avec les deux usages) : pastille
  « ÉLÈVE » (bleu) ou « ENSEIGNANT » (vert, v261 ; orange avant) dans la
  barre du haut, et un dégradé de la même couleur en haut de l'écran, qui
  s'efface vers le bas (v264 : sans trait).
- **Robot aux couleurs du compte** (v264) : en compte enseignant, ce qui
  est bleu sur le robot (écran, yeux, réacteur, reflets) passe en vert, et
  la petite diode de la caméra passe en bleu.
- **Changer de compte** : toucher la pastille, **sur l'accueil
  uniquement**. Ailleurs, un message rappelle de passer par l'accueil.

**Ce qui change selon le compte utilisé (v250) :**

| | Compte élève | Compte enseignant |
|---|---|---|
| Bouton d'accueil « Mes classes » | Classes rejointes ; « Rejoindre une classe » s'il n'y en a aucune | Classes créées ; « Créer une classe » s'il n'y en a aucune |
| Organisation des boîtes | Dossier « Mes classes » en tête : boîtes des classes rejointes | Dossier « Mes classes » en tête : classes animées et leurs boîtes partagées |
| Autres dossiers et boîtes | Communs aux deux comptes | Communs aux deux comptes |
| Révisions (v256) | Oui | **Non** : bouton « Réviser » grisé (un message explique de passer au compte élève), sans ses pastilles |
| Dans / hors de mes révisions (v256) | Pictos, affichage grisé, menu « Retirer de / Ajouter à mes révisions » | Rien de tout cela |
| Progression (v256) | Jauge « Ma progression » sur la page d'une boîte, affichage en jauge dans l'organisation | Pas de jauge |
| Nouvelle boîte (v256) | Rangée dans un dossier, elle entre dans mes révisions | Rangée dans un dossier, elle reste **hors** de mes révisions (on pourra l'y ajouter depuis le compte élève) |
| Mon agenda (v256) | Évènements créés dans le compte élève + échéances reçues des classes suivies | Évènements créés dans le compte enseignant + échéances données à ses classes |
| Librairie : bouton d'une boîte (v257) | « Ajouter à mes révisions » / « Retirer de mes révisions » | « Ajouter aux révisions » / « Retirer des révisions » (celles du compte élève) |
| Librairie (le reste), fiches, statistiques, défi du jour | Identiques | Identiques |

---

## 4. L'algorithme de révision

> L'algorithme (« v2 », validé le 7 octobre) compte en **minutes** et
> tient compte des échéances de l'agenda.
>
> ✅ **Vérifié par des tests automatiques** (v252) : chaque règle de cette
> section a son test, lancé par GitHub à chaque modification du code. Si
> une règle change ici, son test change avec elle.

### 4.1 Les 4 réponses

Après avoir vu la réponse, on note la fiche :

| Bouton | Note | Sens |
|---|---|---|
| Je ne sais pas | 0 | Raté |
| Vague idée | 1 | Partiellement su |
| Je sais | 2 | Su |
| Parfaitement | 3 | Su sans effort |

Sous chaque bouton, l'appli affiche dans combien de temps la fiche
reviendra si on choisit cette note.

Chaque fiche retient : sa **dernière note**, la date de sa **dernière
interrogation**, son **dernier délai** (DD) et sa **prochaine date**.

### 4.2 Mode « fond » (pas d'échéance à venir)

Le nouveau délai se calcule ainsi :

> **nouveau délai = (DD − TE) + TE × coefficient**, puis ramené entre un
> **plancher** et un **plafond**.
>
> DD = dernier délai appliqué ; TE = temps écoulé depuis la dernière
> interrogation.

Autrement dit : si on se souvient bien après longtemps, le délai grandit
d'autant plus.

**Valeurs par défaut** (réglables dans Darwin Admin) :

| Note | Coefficient | Plancher | Plafond | En pratique |
|---|---|---|---|---|
| 0 — Je ne sais pas | 0 | 3 jours | 3 jours | toujours **3 jours** |
| 1 — Vague idée | 0 | 1 jour | 1 jour | toujours **1 jour** |
| 2 — Je sais | 2 | 3 jours | 30 jours | entre 3 et 30 jours |
| 3 — Parfaitement | 3 | 5 jours | 120 jours | entre 5 et 120 jours |

**Choix assumé (décision Q1) :** « Je ne sais pas » repousse plus loin que
« Vague idée ». Quand on commence à avoir une vague idée, ça vaut le coup
de renforcer tout de suite ; une fiche pas du tout sue peut attendre tant
qu'il n'y a pas d'échéance (et elle revient quand même deux fois dans la
séance en cours). Cela évite d'avoir trop de fiches à revoir chaque jour.

### 4.3 Mode « sprint » (échéance à venir)

Une boîte passe en sprint dès qu'une **échéance à venir** de l'agenda la
concerne (directement, ou via un dossier relié à l'échéance). Seules
comptent les échéances du **compte élève** (v256) : une échéance qu'un
enseignant donne à sa classe ne met pas ses propres boîtes en sprint.

- Au passage en sprint, toutes ses fiches deviennent **à revoir tout de
  suite**, et l'appli mémorise leur délai d'avant.
- Pendant le sprint, le délai est le plus court entre :
  - le délai du mode fond ;
  - **D − D / coefficient sprint**, où D = temps restant jusqu'à **8 h le
    jour de l'échéance** la plus proche.
- **Le jour même** de l'échéance : 30 minutes.
- Coefficients sprint par défaut : 1,03 / 1,05 / 2 / 3 (notes 0 à 3).
  Plus le coefficient est grand, plus la fiche revient tard avant
  l'échéance.
- **Une nouvelle échéance plus proche** remet les fiches à revoir tout de
  suite.
- **Fin du sprint** (plus aucune échéance à venir) : retour au mode fond.
  Prochaine interrogation = lendemain de la dernière échéance + le délai
  d'avant le sprint (ou, à défaut, le plancher de la dernière note).

### 4.4 La séance de révision

Une séance continue tant qu'on répond. Ordre de passage :

1. les fiches **dues** (la plus en retard d'abord) ;
2. les fiches notées 0 ou 1 **pendant la séance**, jusqu'à ce qu'elles
   aient été revues deux fois ;
3. toutes les autres, par date prévue (on révise alors « en avance »).

- **Au moins 10 autres fiches** entre deux passages d'une même fiche (ou
  toutes les autres, s'il y en a moins).
- Quand les fiches dues sont vues et les fiches ratées revues deux fois,
  le robot **propose la boîte suivante** des révisions conseillées (sauf
  en « Révisions prioritaires »).
- **Annuler** la dernière note est possible juste après.
- **Évaluation** (v272) : tant que la réponse n'a pas été vue, le texte
  « Cherche la réponse, tourne la fiche, puis évalue-toi » remplace les
  quatre boutons. Quand la fiche se retourne, le texte s'efface et les
  boutons apparaissent l'un après l'autre ; à la fiche suivante, les
  boutons s'effacent et le texte revient. En mode jour, les smileys des
  notes « claires » sont un peu foncés pour rester lisibles (même teinte ;
  les jauges et graphiques gardent leurs couleurs) ; en mode nuit, rien ne
  change.
- Quand les fiches dues sont toutes vues et qu'il reste des fiches ratées
  à revoir, le bas de l'écran passe de « N fiches à revoir » à « On revoit
  les fiches difficiles » ; le robot l'explique alors par un message (une
  fois par séance, v271).
- **Fiche QCM** : si elle a 3 réponses fausses, elle se présente en QCM.
  Une fiche QCM repassée en mode normal puis ratée repasse en QCM.
  Quand la fiche a un complément de réponse (suite de la réponse, « en
  savoir plus » ou lien), il s'affiche une fois la bonne réponse trouvée,
  et la fiche **reste affichée** avec un bouton « Continuer », même quand
  on a répondu juste du premier coup (v271). Sans complément, la fiche
  passe seule à la suivante après une bonne réponse.

### 4.5 Où se révise-t-on ? (page « Réviser »)

| Entrée | Ce qui est révisé |
|---|---|
| **Révisions prioritaires** | Les boîtes reliées aux échéances à venir, échéance la plus proche d'abord. On peut décocher des boîtes. |
| **Renforcer mes connaissances** | Les boîtes **sans** échéance, triées par **retard moyen** (le plus en retard d'abord). |
| **Sélection manuelle** | Une boîte, un dossier, ou une sélection de boîtes, au choix. |

Seules les boîtes **dans mes révisions** (§5.2) et **non verrouillées**
(§7.3) sont concernées, et seules les échéances du compte élève (§4.3).
Les pastilles du bouton « Réviser » de l'accueil comptent les échéances
proches qui ont des fiches à revoir et les boîtes à renforcer. Les
révisions n'existent pas dans le compte enseignant (§3.2).

**Seconde présentation, à l'essai (v267) : « parcours guidé ».** Même
contenu, plus explicite sur la méthode :
- en haut, la situation du jour (« N fiches à revoir aujourd'hui ») et une
  phrase qui résume la méthode ;
- un « chemin du jour » en trois étapes numérotées, l'étape conseillée en
  avant, chacune avec ses chiffres et son « pourquoi » : 1. Préparer mes
  échéances (prochaine échéance, jours restants, fiches à revoir ; sans
  échéance, invitation à en ajouter une dans l'agenda) ; 2. Entretenir ce
  que je sais (boîtes et fiches à revoir) ; 3. Réviser ce que je veux ;
- « Comment noter mes réponses ? » : les quatre réponses et le délai
  avant le retour de la fiche (lu dans les réglages de l'algorithme).
**Troisième présentation, à l'essai (v268, refaite en v269 d'après la
maquette du propriétaire) : « mixte ».** La page à trois boutons, avec en
plus un bouton « Comment ça marche ? ». Ce bouton lance une animation en
trois temps (v270) : le texte des ronds s'efface et leur picto grandit
jusqu'à remplir le rond ; puis chaque grand rond glisse lentement vers la
gauche en rapetissant, jusqu'au petit rond de son cadre ; enfin les trois
cadres apparaissent l'un après l'autre. Les cadres s'affichent **repliés**
(titre et notion en une ligne : « Apprentissage rapide pour le jour J »,
« Apprentissage de fond, sur la durée », « Ce que je veux, quand je
veux »), pour tout voir sur un seul écran ; sous le titre, le début du
texte apparaît déjà et s'efface en dégradé, pour montrer qu'il y a une
suite (v271) ; le triangle en bas de chaque cadre, ou un toucher sur cet
aperçu, le déplie ; il se replie avec la même animation, à l'envers
(v272). Les schémas sont alignés à droite au-dessus de chaque cadre (v272).
Sur la page à trois ronds, chaque rond a un contour de la couleur de son
cadre (v271). Chaque cadre a sa couleur, son schéma, son petit rond et
son bouton :
- **« Ici, le plus urgent ! »** (orange, des bonds qui se resserrent
  entre un chronomètre et le calendrier de l'échéance ; dessins du
  propriétaire, v271) : le sprint avant les échéances ; d'où
  viennent les échéances (son agenda, celles des enseignants des classes
  rejointes) ; la prochaine échéance ou « aucune échéance prévue » ; bouton
  « Réviser pour mes échéances » ou « Ajouter une échéance » ;
- **« Là, le travail de fond… »** (vert, des bonds de plus en plus longs) :
  la consolidation, la courbe de l'oubli, le QCM puis l'auto-évaluation, et
  ce que devient la fiche après chacune des quatre réponses ; bouton
  « Renforcer mes connaissances » ;
- **« Révisions libres »** (bleu, des cases cochées au choix) : bouton « Choisir ».
« OK » ramène aux trois ronds (même animation à l'envers). Les cadres
sont de nouveau repliés à chaque ouverture.
La page à trois boutons reste celle par défaut. Pour comparer, des liens
« Autres présentations » n'apparaissent qu'aux administrateurs (choix
mémorisé sur l'appareil). Voir §8, Q11.

### 4.6 La jauge de progression

Barre à 4 couleurs (du gris au vert) : part des fiches de la boîte (ou du
dossier) selon leur **dernière note** (jamais notée = 0).

---

## 5. Boîtes, dossiers et organisation

### 5.1 Les types de boîtes

| Type | D'où elle vient | Picto | Fiches modifiables ? |
|---|---|---|---|
| **À moi** | Créée par l'utilisateur | Boîte avec un crayon | Oui |
| **De classe** | Partagée par un enseignant d'une classe rejointe | Pile de feuilles | Non (copie en lecture seule, mise à jour en direct quand l'enseignant la modifie) |
| **De la Librairie** | Prise dans la Librairie | Picto « partage » | Non (copie mise à jour depuis la Librairie). Une fiche erronée se **signale** à l'auteur. Un administrateur peut la corriger pour tous. |

Pictos des dossiers : dossier classique ; dossier de classe : deux
personnages.

### 5.2 Dans / hors de mes révisions

| | Dans mes révisions | Hors de mes révisions |
|---|---|---|
| L'algorithme s'applique | Oui | Non (progression gardée) |
| Proposée dans Réviser, Révisions prioritaires, Renforcer | Oui | Non |
| Visible dans l'organisation | Oui, picto flèches en cercle **vertes** | Oui, picto flèches **barrées grises** (ou grisée, selon l'affichage choisi) |

```mermaid
stateDiagram-v2
    [*] --> Dans: créée depuis l'organisation
    [*] --> Hors: créée sans choisir de dossier
    Dans --> Hors: menu ⌄ « Retirer de mes révisions »
    Hors --> Dans: menu ⌄ « Ajouter à mes révisions »
```

Cas particuliers :

- **Boîte de classe** : toujours dans mes révisions, pas de choix.
- **Boîte de la Librairie prise avec l'offre gratuite** : la retirer
  **libère** une place gratuite mais **efface sa progression** (la boîte
  disparaît).
- **Boîte de la Librairie** : la remettre dans mes révisions demande un
  accès à la Librairie (abonnement ou place gratuite).

### 5.3 L'organisation des boîtes (page « Organisation de mes boîtes de fiches »)

C'est la page centrale : **toutes** les boîtes de l'utilisateur y sont, à
leur place dans l'arborescence.

- **En tête : « Mes classes »**, rangé automatiquement, non modifiable :
  - compte élève : les classes rejointes et leurs boîtes ;
  - compte enseignant : les classes animées et l'arborescence de leurs
    boîtes partagées (lecture seule ; toucher une boîte ouvre la boîte
    d'origine de l'enseignant).
- Puis les dossiers et boîtes de l'utilisateur, par ordre alphabétique.
- **En haut** (v264) : deux boutons ronds, « + Nouvelle boîte » et
  « Librairie » (même bouton que sur l'accueil, même effet). Dessous, le
  champ **« Rechercher une boîte… »** (par nom, sans tenir compte des
  accents ; résultats en liste), puis la barre d'outils. Quand la liste
  défile, la recherche et la barre d'outils restent en haut ; les deux
  boutons ronds passent sous le bandeau.
- **Barre d'outils** : « + Nouveau dossier » ; trois filtres
  **exclusifs** (un seul à la fois, aucun par défaut, enlevés à chaque
  retour sur la page ; re-toucher le filtre actif l'enlève), qui grisent
  ce qui n'est pas concerné :
  - « Afficher les boîtes activées pour la révision » (compte élève) ;
  - « Afficher mes boîtes publiées » ;
  - « Afficher mes boîtes non publiées ».
  Quand on active un filtre, le robot explique en une phrase ce qu'il
  montre (utile sur téléphone, sans texte au survol). Sa bulle reste
  affichée jusqu'à ce qu'on la ferme (croix ou toucher sur la bulle), même
  si l'on touche ailleurs (v272).
  Pour les deux derniers, les boîtes qui ne sont pas les miennes (classe,
  Librairie) sont toujours grisées ; un dossier reste normal s'il contient
  au moins une boîte concernée. Enfin, nombre de fiches ou jauge à droite
  de chaque ligne.
- **Menu ⌄ d'une ligne** :

| Action | Dossier | Boîte à moi | Boîte de la Librairie | Boîte de classe | Dossier de classe |
|---|---|---|---|---|---|
| Renommer | ✅ | ✅ | ✅ | ❌ | ❌ |
| Déplacer | ✅ | ✅ | ✅ | ❌ | ❌ |
| Retirer de / Ajouter à mes révisions | — | ✅ | ✅ | ❌ | — |
| Supprimer | ✅ (s'il est vide) | ❌ (depuis la page de la boîte) | — | ❌ | ❌ |

- **Toucher une boîte** ouvre sa page (§5.4). Toucher un dossier le
  déplie ou le replie.
- **Créer une boîte** : nom + classification (catégorie → … → matière),
  puis choix du dossier ; elle entre dans mes révisions. Annuler le choix
  du dossier la laisse à la racine, hors de mes révisions.

### 5.4 La page d'une boîte

**Boîte à moi** :

1. Titre : picto + nom de la boîte.
2. Bouton rond « + Ajouter une fiche ».
3. **Ma progression** (jauge) + bouton « Réviser » si la boîte est dans
   mes révisions.
4. **Pour aller plus loin** : lien vers un contenu externe (vidéo,
   cours…) + « Ajouter un lien » / « Modifier ».
5. Bloc **Fiches** (replié : nombre de fiches ; déplié : recherche par
   mot-clé, filtre des fiches signalées 🚩, liste des fiches avec leur
   menu ⌄ : éditer, déplacer, supprimer).
6. Bloc **Librairie** : « Publiée » / « Non publiée », puis la
   classification ou « Classification à définir ». Un seul bouton :
   **Classifier** → **Publier dans la Librairie** → **Voir dans la
   Librairie**. Tant que la boîte n'est pas publiée, un lien
   **« Modifier »** à côté de la classification permet de la changer
   (une fois publiée, c'est la classification de la publication qui
   compte).
7. Bouton « Supprimer la boîte » (définitif, avec ses fiches).

**Boîte de classe ou de la Librairie** : titre + picto, Ma progression
(+ Réviser), Pour aller plus loin (s'il y a un lien), bloc Fiches.

### 5.5 Mes créations (supprimée en v254)

Cette page n'existe plus : tout ce qu'elle faisait se fait depuis
l'organisation (créer une boîte, la retrouver, filtre Publiées / Non
publiées) et la page de la boîte (publication, classification,
suppression). Abandonné avec elle : la recherche de ses boîtes par
classification et par tags (voir §8, Q5).

### 5.6 Les fiches

- **Créer** : depuis une boîte (« + Ajouter une fiche ») — la fiche va
  dans cette boîte — ou depuis l'accueil, en choisissant la boîte.
- Après « Ajouter à la boîte », on reste sur la page pour enchaîner.
- **Éditer / déplacer / supprimer** : menu ⌄ de la fiche. Impossible pour
  une fiche de classe ou de la Librairie.
- **Signaler** (drapeau 🚩) : sur une fiche à moi, la marque « à
  corriger » ; sur une fiche de classe ou de la Librairie, ouvre un
  message à son auteur (voir §6.5).

### 5.7 Règles d'écriture des fiches

Ces règles valent pour **toutes** les fiches : celles des utilisateurs,
les boîtes toutes prêtes de darwin, et celles que Claude rédige.

1. **Fiche QCM : la question doit avoir du sens sans les propositions.**
   Une fiche QCM est d'abord posée avec ses 4 propositions, puis aussi en
   mode normal, **sans** elles. On n'écrit donc jamais « Laquelle de ces
   propositions est correcte ? », « Parmi les réponses suivantes… »,
   « Quel est l'intrus ? » (sans la liste), « Coche la bonne réponse »…
   - ❌ « Laquelle de ces villes est la capitale de l'Australie ? »
   - ✅ « Quelle est la capitale de l'Australie ? »
   - ✅ Accepté : les choix sont écrits **dans la question** elle-même
     (« Quel est l'intrus : pomme, poire, chou, kiwi ? »).
2. **Une seule question par fiche.** « Où ? » = une fiche, « Quand ? » = une
   autre fiche ; jamais « Où et quand… ? ». Une fiche qui pose plusieurs
   questions est découpée en plusieurs fiches.
3. **Questions courtes, réponses courtes.** Les précisions vont dans
   « En savoir plus » (texte court sous la réponse).
4. **Toutes les fiches des boîtes toutes prêtes sont en QCM** : 3 réponses
   fausses plausibles, de même forme que la bonne réponse, et jamais
   justes elles aussi.
5. **Liens « Pour aller plus loin »** : on ne crée pas de contenu, on
   pointe vers un contenu existant, pertinent et pédagogique (vidéo,
   animation…).
   - **Boîte** : toujours un lien, vers un contenu plus long qui traite
     tout le sujet (ex. : une vidéo de cours complète).
   - **Fiche** : seulement si c'est utile, et jamais un contenu trop long
     (vidéo) ou trop dense (page de type Wikipédia).
6. **Contrôles automatiques** de la règle 1 :
   - **dans l'appli**, en enregistrant une fiche QCM dont la question
     renvoie à des propositions, le robot prévient et propose de
     reformuler (on peut garder quand même) ; un rappel est écrit sous
     les cases des réponses fausses ;
   - **dans Darwin Admin** (Librairie → onglet « Questions QCM ») : liste
     des questions à revoir dans toute la Librairie en ligne et dans le
     fichier des boîtes toutes prêtes.

---

## 6. Classes

### 6.1 Côté enseignant

- **Créer une classe** : le robot demande un nom (modèle de nommage
  conseillé, avec l'année scolaire). Un **code d'invitation** est créé.
- **Page de la classe** :
  - « Renommer » juste sous le nom de la classe ; code d'invitation
    (copiable) affiché comme une simple information ;
  - bouton rond **Messagerie de la classe** (pastille : messages non lus) ;
  - bloc **Boîtes partagées** : arborescence propre à la classe,
    « + Dossier », « + Partager » (depuis mes boîtes ou depuis la
    Librairie), menu ⌄ pour ranger ;
  - bloc **Agenda de la classe** : échéances à venir, « + Ajouter » ;
  - bloc **Élèves** (nombre, puis la liste : prénom et nom, jamais
    l'email) ;
  - bouton « Supprimer la classe ».
- **Partager une boîte à moi** : une copie part dans la classe ; elle est
  **mise à jour chez les élèves** quand l'enseignant modifie sa boîte.
  Un message automatique l'annonce dans la messagerie.
- **Partager une boîte de la Librairie** dans une classe : soumis aux
  droits de son abonnement (§7.4).
- **Échéance de classe** : en l'ajoutant, l'enseignant relie des boîtes ;
  celles qui ne sont pas encore partagées le sont automatiquement.

### 6.2 Côté élève

- **Rejoindre une classe** avec le code donné par l'enseignant.
- Les boîtes partagées apparaissent **toutes seules** dans
  l'organisation, dossier « Mes classes », en lecture seule, toujours à
  jour.
- Les échéances de la classe arrivent dans **Mon agenda** et déclenchent
  le mode sprint sur les boîtes concernées.
- **Quitter la classe** retire ses boîtes de l'appareil.

### 6.3 Mes classes (page)

Bouton rond « Rejoindre une classe » (élève) ou « Créer une classe »
(enseignant), puis la liste des classes, chacune dans un bloc (nom, nombre
d'élèves, nombre d'échéances à venir). La dernière liste connue s'affiche
tout de suite, la liste à jour suit.

### 6.4 Agenda

- **Mon agenda** (accueil) : les évènements du **compte utilisé** (v256).
  En haut, « + Ajouter un événement » et, sur la même ligne à droite, deux
  pictogrammes pour choisir l'affichage : liste ou mois (v272).
  Compte élève : ceux créés dans le compte élève et les échéances reçues
  des classes suivies. Compte enseignant : ceux créés dans le compte
  enseignant et les échéances données à ses classes. Chaque évènement
  retient le compte où il a été créé ; ceux d'avant la v256 sont côté
  élève. Affichage en liste ou par mois.
- Partager un évènement avec une classe ne se fait que depuis le compte
  enseignant.
- Alerte de l'accueil « l'évènement n'a pas de boîte associée » : dans le
  compte enseignant, seulement pour les échéances données à une classe.
- **Agenda de la classe** : seulement les échéances de la classe (bloc de
  la page de la classe).
- Une échéance : titre, date, boîtes et dossiers reliés, commentaire,
  classe éventuelle. Une échéance reçue d'un enseignant ne peut être ni
  modifiée ni supprimée par l'élève (sauf suppression une fois passée).

### 6.5 Messagerie et signalements

- **Messagerie** : une discussion par classe (enseignant + tous les
  élèves), en temps réel. Pastille de messages non lus sur « Mes
  classes » (accueil) et sur la page de la classe.
- **Signalements** : un élève signale une fiche erronée à son auteur ;
  l'auteur les retrouve dans « Signalements reçus », l'élève dans
  « Signalements émis ». Un bouton d'accueil « Signalements » n'apparaît
  que s'il y en a.

---

## 7. Librairie et abonnements

### 7.1 Consulter et prendre une boîte

- La Librairie se parcourt par **classification** (catégorie → cycle →
  niveau → année → spécialité → matière), lue dans le fichier Excel
  `data/taxonomie.xlsx`, avec filtres et recherche.
- Chaque boîte : nom, auteur (prénom et nom), description,
  classification, nombre de fiches, « pouces » des utilisateurs, aperçu
  des fiches.
- Sans accès, l'aperçu montre des réponses **coupées**.
- **« Ajouter à mes révisions »** : choix du dossier, puis une copie de la
  boîte arrive dans l'organisation ; elle suit les corrections faites dans
  la Librairie.

### 7.2 Publier une boîte

Deux chemins existent aujourd'hui :

| Depuis | Comment | Visible |
|---|---|---|
| **Une boîte à moi** (page de la boîte) | Classifier, puis « Publier dans la Librairie » : nom, classification, description | **Tout de suite** dans la Librairie |
| **Une boîte partagée avec une classe** (enseignant) | Proposition envoyée à darwin | Après relecture et publication depuis **Darwin Admin** |

- La boîte publiée est une **copie figée** au moment de la publication :
  si l'auteur modifie ensuite sa boîte, **la Librairie ne change pas**.
- Seul un **administrateur** peut corriger les fiches publiées (la
  correction s'applique à tous ceux qui ont pris la boîte).
- Une boîte ne peut être publiée qu'une fois.
- Voir la question Q3 (§8) : qui garde les droits sur une boîte publiée ?

### 7.3 Accès à la Librairie

| Situation | Accès |
|---|---|
| Abonnement **Super élève** actif ou à l'essai | Toute la Librairie |
| Abonnement **Super enseignant** actif | Toute la Librairie pour lui-même |
| Enseignant désigné par un établissement **Super école** | Idem |
| Administrateur | Tout |
| **Offre gratuite** | **2 boîtes** de la Librairie au choix (réglable) ; les remplacer efface la progression |
| Fin d'abonnement | Les boîtes prises hors offre gratuite sont **verrouillées** (cadenas) : visibles, mais ni révisables ni ouvrables |

⚙️ Tant que l'interrupteur « appliquer les abonnements » de Darwin Admin
est éteint, tout compte connecté a accès à la Librairie.

### 7.4 Les formules (d'après les CGV)

| Formule | Prix | Contenu |
|---|---|---|
| Super élève | 2 €/mois ou 20 €/an, 1er mois d'essai gratuit | Toute la Librairie |
| Super enseignant | 1 €/mois/classe (3 classes min.) ou 10 €/an/classe | Super élève pour lui + ses élèves (60 max par classe) révisent les boîtes de la Librairie qu'il partage dans ses classes |
| Super école | 50 €/an par enseignant désigné | Chaque enseignant désigné : Super enseignant pour 15 classes max |

- **Offre gratuite enseignant** : 1 classe, 2 boîtes de la Librairie dans
  cette classe (réglable).
- **Parrainage** : 1 mois offert au filleul, 2 mois au parrain (max 12 par
  an).
- Paiement par **Stripe** ; gestion de l'abonnement dans Mon compte.

Le site vitrine affiche les mêmes noms et prix (décision Q2 : les CGV
font foi).

### 7.5 Défi du jour

10 questions de culture générale par jour (2 de chaque niveau, de 1 à 5),
**les mêmes pour tout le monde**, sur le site et dans l'appli.

- Dans l'appli, la partie du jour et la série de jours sont **les mêmes
  sur tous les appareils d'un compte** (v265) : un défi commencé ou fini
  sur le PC apparaît ainsi sur l'iPhone, et ne peut pas être refait. Si
  deux appareils ne sont pas d'accord, la partie la plus avancée
  l'emporte (terminée d'abord, sinon celle qui a le plus de réponses).

---

## 8. Questions ouvertes

> Décisions à prendre ou incohérences repérées. Répondez directement
> sous chaque question ; Claude reportera la réponse dans les règles.

**Q3 — Droits sur une boîte publiée dans la Librairie.**
Aujourd'hui : publication immédiate, copie figée, l'auteur ne peut plus la
mettre à jour, seul darwin peut corriger. Proposition de Claude : publier =
proposer (relecture par darwin) ; ensuite l'auteur propose ses
modifications, darwin garde le dernier mot ; l'auteur ne supprime pas, il
demande le retrait ; une phrase dans les CGU.
> Réponse : d'accord pour que Publier = proposer avec relecture par darwin. Pour la gestion des modifications et suppression, je ne sais pas encore trop ; fais ce que tu propose mais laisse ce sujet en suspend quelquepart
>
> ⏳ *Claude : chantier « publication avec relecture » (avec Q4), à préparer d'abord sous forme de plan. La gestion des modifications et des suppressions restera ensuite ouverte ici.*

**Q4 — Deux chemins de publication différents** (immédiat pour une boîte à
moi, relecture pour une boîte de classe). Faut-il les unifier ? (lié à Q3)
> Réponse : oui
>
> ⏳ *Claude : à réaliser avec Q3 (chantier « publication avec relecture »).*

**Q11 — Page Réviser : quelle présentation garder ?** La page à trois
boutons, le « parcours guidé » (v267) ou la présentation « mixte » (v268,
§4.5) ? Pour comparer : sur la page Réviser, liens « Autres
présentations » en bas (visibles seulement pour les administrateurs).
> Réponse :

**Q12 — Où ranger le fichier des boîtes toutes prêtes ?** (7 nov. 2026)
Le dépôt GitHub est public, et GitHub Pages comme les copies de test
publient tout son contenu : un fichier des boîtes posé dans le dépôt
devient téléchargeable gratuitement, alors que ces boîtes sont payantes.
Depuis v271, le fichier n'est plus suivi dans le dépôt (il reste visible
dans son historique). Pistes : un dépôt privé séparé pour le contenu, puis
une mise à jour automatique de la Librairie (base de données) à chaque
nouvelle version du fichier ; l'import par Darwin Admin reste la porte
d'entrée. À décider avec le propriétaire.

**Q8 — Avant l'ouverture au public : une adresse de test.**
Aujourd'hui, fusionner une branche publie la version pour tout le monde,
sur la même base de données. Avant le lancement, mettre en place une
copie de l'appli (avec sa propre base) pour essayer chaque version avant
sa mise en ligne. Rappelé par le bilan de lancement (`tools/lancement.py`).
> Réponse (3 nov. 2026) : d'accord pour attendre le lancement. *(La date
> est celle de la réponse, pas celle du lancement, qui n'est pas fixé.)*
> Réponse (4 nov. 2026) : on la met en place maintenant, pour pouvoir
> essayer aussi la synchronisation, les classes et la Librairie.
>
> ✅ *En place le 4 nov. 2026 : https://darwin-test.netlify.app (base
> darwin-test) et un lien de test par demande de fusion. Mode d'emploi :
> `docs/COPIE-DE-TEST.md`. Reste à faire plus tard : les paiements en mode
> test (Stripe). La structure de la base réelle est désormais enregistrée
> dans le dépôt.*

### Décisions prises

| Question | Décision | Où c'est appliqué |
|---|---|---|
| Q1 — « Je ne sais pas » à 3 jours, « Vague idée » à 1 jour | Voulu pour l'instant (renforcer tout de suite ce qu'on commence à savoir ; pas trop de fiches par jour). | §4.2 (v253) |
| Q2 — Prix et noms des formules | Les CGV font foi ; site vitrine corrigé. | §7.4, site (v253) |
| Q7 — Modifier la classification d'une boîte classée | Oui, lien « Modifier » tant qu'elle n'est pas publiée. | §5.4 (v253) |
| Q9 — Prendre une boîte de la Librairie dans le compte enseignant | Bouton « Ajouter aux révisions » / « Retirer des révisions » (révisions du compte élève) ; « Ajouter à mes révisions » / « Retirer de mes révisions » dans le compte élève. | §3.2 (v257) |
| Q10 — Titre de la page Organisation | « Organisation de mes boîtes de fiches » (5 nov. 2026, pour les deux comptes). | §5.3 (v264) |
| Q6 — Différences élève / enseignant | Agenda par compte ; classes du compte utilisé dans l'organisation, le reste commun ; pas de révisions dans le compte enseignant (Réviser grisé, ni dans/hors révisions, ni progression) ; échéances données à une classe sans effet sur ses propres révisions ; nouvelle boîte du compte enseignant hors révisions. | §3.2, §4.3, §4.5, §6.4 (v256) |
| Q5 — Supprimer « Mes créations » | Oui, après vérification. « Mes fiches » ouvre directement l'organisation. Remplacé par un filtre Publiées / Non publiées qui grise le reste ; recherche par classification et par tags abandonnée. | §5.3, §5.5 (v254) |

---

## 9. Demandes

> Écrivez ici ce que vous voulez changer, avec vos mots. Une demande par
> puce. Claude les réalise, puis les déplace dans le journal des
> changements.
>
> Modèle : `- [ ] (date) Ce que je veux…`

- [ ] 

---

## 10. Journal des changements

| Version | Date | Changements |
|---|---|---|
| v272 | 8 nov. 2026 | Page Réviser : ronds un peu plus grands, schémas plus petits alignés à droite, repliement des cadres animé, smileys de l'explication sans cadre et plus grands. Révision : animation entre le texte d'invitation et les boutons d'évaluation ; smileys clairs foncés en mode jour. Organisation : le robot explique chaque filtre quand on l'active (bulle fermée par la croix). Agenda : « Liste » et « Mois » deviennent deux pictogrammes à droite de « + Ajouter un événement ». |
| v271 | 7 nov. 2026 | Révision : une fiche QCM avec un complément de réponse reste affichée avec « Continuer », même après une bonne réponse du premier coup (la suite d'une réponse sur plusieurs lignes passait toute seule) ; message du robot au passage aux fiches difficiles. Page Réviser « mixte » : contours colorés des trois ronds, aperçu du texte en dégradé dans les cadres repliés, nouveaux schémas dessinés par le propriétaire. |
| v270 | 6 nov. 2026 | Page Réviser « mixte » : animation en trois temps (texte des ronds effacé et picto agrandi, vol plus lent des grands ronds vers les petits, apparition des cadres l'un après l'autre) ; cadres repliés par défaut (titre et notion), dépliables par un triangle en bas. |
| v269 | 6 nov. 2026 | Page Réviser « mixte » refaite d'après la maquette du propriétaire : la page à trois boutons plus « Comment ça marche ? », qui réduit les ronds (ils glissent à gauche) et fait apparaître trois cadres d'explication colorés avec schémas (le plus urgent, le travail de fond, les révisions libres) ; « OK » pour revenir. |
| v268 | 6 nov. 2026 | Page Réviser : troisième présentation à l'essai, « mixte » : compacte par défaut, triangles ▸ pour déplier les explications ; une couleur et un schéma pour chaque façon de réviser (sprint avant les échéances, consolidation, révisions libres) ; schéma de la courbe de l'oubli. Liens « Autres présentations » pour les administrateurs (Q11). |
| v267 | 5 nov. 2026 | Page Réviser : seconde présentation à l'essai, « parcours guidé » (situation du jour, chemin en trois étapes avec leur « pourquoi », sens des quatre réponses). La page à trois boutons reste celle par défaut ; les administrateurs peuvent passer de l'une à l'autre (Q11). |
| v266 | 5 nov. 2026 | Corrigé : après un retour à l'accueil par la flèche « < », le bouton du défi du jour gardait son ancien état (« À jouer » alors que le défi était fait sur un autre appareil). L'accueil est désormais remis à jour quel que soit le chemin pour y revenir. |
| v265 | 5 nov. 2026 | Défi du jour synchronisé entre les appareils d'un compte (un défi fait sur le PC restait « à jouer » sur l'iPhone et pouvait être refait). « Annuler » dans la bulle du robot quand on choisit le dossier d'une boîte. |
| v264 | 5 nov. 2026 | Accueil à l'échelle : tout tient à l'écran sur tous les appareils (les pictos du bas sortaient de l'écran sur certains téléphones et sur PC), plus de défilement ; sur tablette et grand écran, l'accueil remplit la hauteur ; même placement qu'avant sur l'iPhone de référence. Défi du jour en « carte de jeu ». Pastille de Signalements décalée. Bandeau du compte sans trait, dégradé plus haut ; robot vert en compte enseignant. Organisation : nouveau titre, bouton Librairie, trois filtres exclusifs renommés, recherche et barre d'outils qui restent en haut. Classement : contour gris. Corrigé : « Connecte-toi… » à tort dans la Librairie (connexion expirée non renouvelée) ; « Annuler » (et la croix du robot) quand on choisit le dossier d'une boîte. |
| v263 | 5 nov. 2026 | Bandeau de couleur du compte (élève / enseignant) : affiché dès le choix du compte à l'ouverture, sans attendre le serveur (l'appli se croyait en compte élève jusque-là), et sur toute la largeur, depuis le haut de l'écran. |
| v262 | 4 nov. 2026 | Une seule couleur pour tous les boutons principaux. Créer un compte : blocs sans titre, « Utilisation de l'appli », niveau scolaire dans son bloc. Classement en blocs emboîtés comme la Librairie, partout. Nouvelle fiche : un bloc par champ. Même police pour toutes les zones de saisie et leurs textes d'exemple. Ajouter un évènement : blocs sans titre, « (facultatif) » sur les champs concernés. |
| v261 | 4 nov. 2026 | Retouches visuelles : accueil (petits boutons en pictogramme, liseré fin en dégradé, vert pour le compte enseignant, lévitation du robot relancée quand elle se figeait) ; Créer un compte en blocs, « utilisateur normal » coché par défaut ; Nouvelle fiche (cases QCM toujours visibles « (facultatif) », aides derrière un picto ⓘ lues par le robot) ; Ajouter un évènement en blocs, boutons côte à côte ; boutons au même aspect partout ; page d'une classe sans « (élève) / (enseignant) », Renommer sous le titre, code d'invitation en simple information. |
| v260 | 4 nov. 2026 | Corrigé : la page d'une classe ouverte depuis « Mes classes » pouvait montrer d'anciennes informations (par ex. un dossier supprimé par l'enseignant) jusqu'à la réouverture ; elle relit désormais la classe à jour à chaque ouverture. |
| v259 | 4 nov. 2026 | Corrigé : le menu ⌄ des boîtes dans le bloc « Boîtes partagées » d'une classe (et tout menu ⌄ dans un bloc repliable) était coupé par le bord du bloc, donc invisible. |
| v258 | 4 nov. 2026 | Copie de test (Q8, en cours) : l'appli choisit seule sa base — base de test aux adresses de test (Netlify, essais en local), avec un bandeau « VERSION DE TEST » ; base réelle partout ailleurs. Aucun changement pour les utilisateurs. |
| v257 | 4 nov. 2026 | Q9 : dans le compte enseignant, le bouton d'une boîte de la Librairie s'appelle « Ajouter aux révisions » / « Retirer des révisions ». Q10 : titre de l'Organisation inchangé. |
| v256 | 3 nov. 2026 | Q6 : compte enseignant sans révisions (Réviser grisé avec message, ni dans/hors révisions, ni progression ; nouvelle boîte hors révisions). Agenda propre à chaque compte. Les échéances données à une classe ne mettent plus en sprint les boîtes de l'enseignant. |
| v255 | 3 nov. 2026 | Mise à jour plus fiable sur iPhone : à l'installation d'une nouvelle version, tous les fichiers sont repris en ligne (un iPhone pouvait garder l'ancienne appli en se croyant à jour). Aucun changement visible. |
| v254 | 3 nov. 2026 | Q5 : page « Mes créations » supprimée, « Mes fiches » ouvre directement l'organisation. Nouveau filtre Publiées / Non publiées dans l'organisation. Corrigé : une boîte publiée ouverte depuis l'organisation pouvait s'afficher « Non publiée ». |
| v253 | 3 nov. 2026 | Décisions Q1, Q2, Q7 : choix « Je ne sais pas » / « Vague idée » confirmé ; prix et noms des formules du site alignés sur les CGV ; lien « Modifier » la classification sur la page d'une boîte non publiée. |
| v252 | 3 nov. 2026 | Tests automatiques de l'algorithme de révision (§4) et du repérage des questions QCM (§5.7), lancés par GitHub à chaque modification. Aucun changement visible dans l'appli. |
| v251 | 3 nov. 2026 | Règle d'écriture des fiches QCM (§5.7) : avertissement dans l'appli à l'enregistrement, rappel sous les réponses fausses, onglet « Questions QCM » dans Darwin Admin (vérification de la Librairie et du fichier des boîtes toutes prêtes). Vérification du fichier des boîtes toutes prêtes du 22 octobre (1 176 boîtes, 100 fiches QCM) : aucune question à corriger. |
| v250 | 2 nov. 2026 | Page d'une boîte : Ma progression et Pour aller plus loin hors des blocs, bloc Librairie (Classifier → Publier), plus de bloc Mes révisions. Mes classes plus rapide, en blocs. Choix élève/enseignant immédiat. Page de classe : messagerie en bouton rond, agenda en liste. « Mon agenda ». |
| v249 | 2 nov. 2026 | Page de boîte unique pour ses boîtes. Classes de l'enseignant en tête de l'organisation. Recherche par nom. |
| v248 | 2 nov. 2026 | Organisation : toutes les boîtes, états dans/hors révisions avec pictos, + Nouvelle boîte, affichage grisé. Blocs repliables (boîte, classe). Rejoindre/Créer une classe sur l'accueil. |
| v247 | 1 nov. 2026 | Comptes élève/enseignant. Suppression de la page École. Mes classes et Agenda sur l'accueil. Agenda et messagerie de classe. |
| v246 | 31 oct. 2026 | Aide en touchant le robot. Boutons plus petits. Fiches affichées dans la page d'une boîte. |
| ≤ v245 | — | Historique antérieur (non détaillé ici). |

---

## 11. Annexe : les écrans

| Écran | Accès | Contenu |
|---|---|---|
| **Choix du compte** | Ouverture (deux usages) | Mon compte élève / Mon compte enseignant |
| **Accueil** | — | Boutons ronds : Réviser, Défi du jour, Mes fiches, Mes classes (ou Rejoindre / Créer une classe), Mon agenda, Librairie. En simple pictogramme, sans cercle ni intitulé (v261) : Statistiques, Réglages, Mon compte, Signalements (s'il y en a). Bandeau défilant d'alertes. Robot qui lévite. Défi du jour en « carte de jeu » orange inclinée (v264). **À l'échelle** (v264), sans défilement : robot, logo et boutons forment un seul dessin, agrandi ou réduit pour tenir en entier dans l'écran (largeur et hauteur), sur téléphone, tablette et ordinateur ; placement réglé dans Darwin Admin sur le dessin de référence (iPhone). |
| **Réviser** | Accueil | Révisions prioritaires, Renforcer mes connaissances, Sélection manuelle |
| **Séance de révision** | Réviser | Fiche, 4 boutons de note, jauge, mini-histogramme des échéances |
| **Organisation** | Accueil (Mes fiches) | §5.3 |
| **Page d'une boîte** | Organisation | §5.4 |
| **Nouvelle fiche / Modifier la fiche** | Page d'une boîte, accueil | Question, réponse, complément, QCM, lien |
| **Mes classes** | Accueil | §6.3 |
| **Page d'une classe** | Mes classes | §6.1 |
| **Messagerie de la classe** | Page d'une classe | Discussion |
| **Mon agenda / Agenda de la classe** | Accueil / page d'une classe | §6.4 |
| **Librairie** | Accueil | §7.1 |
| **Statistiques** | Accueil | Chiffres de révision |
| **Réglages** | Accueil | Préférences de l'appareil, mises à jour (numéro de version) |
| **Mon compte** | Accueil | Profil, usages, niveau, abonnement, déconnexion, suppression |
| **Défi du jour** | Accueil | §7.5 |

**Partout** : robot en haut des pages — le toucher affiche l'aide de la
page ; bouton « ? » pour l'aide sur un élément précis ; bouton mode nuit ;
état de la synchronisation ; pastille « n à revoir ».

---

## 12. Annexe : réglages de Darwin Admin

Darwin Admin (`admin/`) permet de régler, pour tous les utilisateurs :

- l'**algorithme** (coefficients, planchers, plafonds — §4) ;
- les **abonnements** : appliquer ou non, durée de l'essai, offre gratuite
  (boîtes, classes), parrainage, ouverture du paiement ;
- l'**apparence** : couleurs, pictos, disposition des boutons de
  l'accueil, textes d'aide du robot ;
- la **Librairie** : propositions des enseignants, corrections,
  modération, vérification des questions QCM (§5.7) ;
- les **établissements** (Super école) : devis, factures, enseignants
  désignés.
