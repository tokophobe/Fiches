# Fiches — révision espacée

Une PWA toute simple : tu entres des questions/réponses, l'appli te les
pose, et plus tu réponds juste, moins souvent elle te les repose
(algorithme SM-2, celui d'Anki).

Tout est stocké **en local sur ton appareil** (IndexedDB) — pas de
compte, pas de serveur, ça marche hors-ligne une fois installée.

## Structure du projet

```
fiches-pwa/
├── index.html
├── manifest.json
├── sw.js                 # service worker (cache hors-ligne)
├── css/style.css
├── js/
│   ├── sm2.js             # algorithme de répétition espacée
│   ├── db.js               # stockage IndexedDB
│   └── app.js               # logique de l'appli
└── icons/                     # icônes 192/512 (normales + maskable)
```

## Tester en local

Un service worker exige HTTPS *ou* `localhost` — tu ne peux pas juste
double-cliquer sur `index.html`. Le plus simple :

```bash
cd fiches-pwa
python3 -m http.server 8080
# puis ouvre http://localhost:8080 dans le navigateur
```

(N'importe quel serveur statique fonctionne : `npx serve`, VS Code
« Live Server », etc.)

## Déployer pour de vrai (gratuit)

N'importe quel hébergeur de site statique convient. Deux options simples :

**Netlify (glisser-déposer)**
1. Va sur https://app.netlify.com/drop
2. Glisse le dossier `fiches-pwa` entier
3. Ouvre l'URL fournie sur ton téléphone

**GitHub Pages**
1. Crée un dépôt et pousse le contenu de `fiches-pwa/` à la racine
2. Repo → Settings → Pages → source = branche principale, dossier `/`
3. L'appli sera sur `https://<utilisateur>.github.io/<repo>/`

## Installer sur ton téléphone

- **Android (Chrome)** : ouvre l'URL → menu ⋮ → « Installer l'application »
- **iOS (Safari)** : ouvre l'URL → bouton Partager → « Sur l'écran d'accueil »

Une fois installée, l'icône apparaît comme une vraie appli et elle
fonctionne hors-ligne.

## Synchroniser entre plusieurs appareils (Supabase)

Par défaut, les fiches restent uniquement sur l'appareil (IndexedDB). Pour
avoir les mêmes fiches sur ton PC et ton téléphone, connecte l'appli à un
projet Supabase gratuit — pas de compte à créer dans l'appli elle-même,
juste un **code de synchronisation** que tu entres sur chaque appareil.

**1. Crée un projet Supabase**
- Va sur https://supabase.com → « New project » (le plan gratuit suffit largement)
- Une fois le projet créé, ouvre **SQL Editor** → **New query**, colle le
  contenu de `supabase-schema.sql` (à la racine de ce dossier), clique **Run**
- Va dans **Project Settings → API** : note l'**URL du projet** et la clé
  **anon / public** (surtout pas la clé `service_role`, qui est secrète)

**2. Connecte l'appli**
- Ouvre l'appli → onglet **Sync**
- Colle l'URL et la clé anon
- Clique **Générer** pour créer un code de synchronisation, puis **Connecter**
- Sur ton autre appareil : mêmes URL/clé, mais entre **exactement le même
  code** au lieu d'en générer un nouveau

À partir de là, tout ajout, modification, suppression ou révision se
synchronise automatiquement (et en temps réel si les deux appareils sont
ouverts en même temps). L'appli reste utilisable hors-ligne : les
modifications faites sans connexion sont envoyées dès que le réseau revient
(l'onglet Sync affiche le nombre de fiches en attente).

**À savoir sur la sécurité** : il n'y a pas de compte utilisateur, donc le
code de synchronisation joue le rôle de mot de passe — garde-le pour toi.
La configuration proposée (policy Supabase ouverte à la clé « anon ») est
adaptée à un usage personnel, pas à des données sensibles.

## Comment fonctionne la répétition espacée

Chaque fiche a trois valeurs : un facteur de facilité, un intervalle
(en jours) et un compteur de bonnes réponses d'affilée. Après avoir
répondu, tu notes la fiche :

- **Encore** → tu la reverras dans moins d'un jour
- **Difficile** → l'intervalle progresse lentement
- **Bien** → l'intervalle suit la progression normale (1 j → 6 j → ×facteur)
- **Facile** → l'intervalle grandit plus vite

Tout ça vit dans `js/sm2.js`, une soixantaine de lignes commentées si
tu veux l'ajuster.

## Modifier le design

Les couleurs, polices et espacements sont centralisés en haut de
`css/style.css` (bloc `:root`). Change les variables, tout le reste
suit.
