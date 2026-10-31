# darwin — fiches de révision

**darwin** (dépôt « Fiches ») est une application web installable (PWA)
de révision par fiches question / réponse. Elle repose sur la
**répétition espacée** : plus on répond juste à une fiche, moins souvent
l'appli la repose (algorithme SM-2, celui d'Anki).

Version actuelle : **v245** (affichée dans les Réglages de l'appli).

## Fonctionnalités

- **Fiches et boîtes** : chaque boîte (histoire, maths…) a ses fiches, sa
  file de révision et ses statistiques. Programme de révision, mode
  renforcement et calendrier des échéances.
- **Compte utilisateur** : on se connecte sur n'importe quel appareil et
  on retrouve ses fiches. L'appli marche aussi **hors-ligne** : les
  modifications sont envoyées dès que le réseau revient.
- **Librairie** : boîtes publiées et partagées, classées par catégorie,
  niveau et matière (voir « Taxonomie » plus bas), avec notes et
  signalements.
- **Classes** : un enseignant crée une classe, les élèves la rejoignent ;
  partage de boîtes, évènements (contrôles…) et messagerie de classe.
- **Défi du jour** : 10 questions de culture générale par jour, les mêmes
  pour tout le monde, sur le site et dans l'appli.
- **Abonnements** payants via Stripe : formule individuelle, « Super
  enseignant » (par classe) et « Super école ». Le détail et les prix
  figurent dans `legal/cgv.html` et `site/index.html`.
- **Darwin Admin** (`admin/`) : l'outil d'administration (réglages de
  l'appli, apparence, abonnements, aperçu en direct).

## Organisation des fichiers

```
index.html            l'appli (tous les écrans)
manifest.json, sw.js  installation et fonctionnement hors-ligne
_headers              réglages de cache (Netlify ; ignoré par GitHub Pages)
css/                  styles (couleurs et polices en haut de style.css)
js/                   code de l'appli (app.js = l'essentiel)
admin/                Darwin Admin
site/                 site vitrine public
legal/                CGU, CGV, confidentialité, mentions légales…
guide/                pages d'aide
data/taxonomie.xlsx   classement de la Librairie (modifiable dans Excel)
supabase/             base de données (SQL) et fonctions serveur Stripe
tools/                scripts Python (lancement, pages du site)
icons/                icônes de l'appli
CLAUDE.md             description technique du projet pour Claude Code
```

## Le serveur : Supabase

Les comptes, la synchronisation, la Librairie, les classes et les
abonnements utilisent un projet **Supabase**. Son adresse et sa clé
publique « anon » sont dans `js/config.js`. Cette clé est publique par
conception : ce sont les règles de sécurité de la base (RLS, « chacun ne
lit et n'écrit que ses lignes ») qui protègent les données. La clé
`service_role` et les clés Stripe secrètes, elles, ne doivent **jamais**
apparaître dans le code.

### Modifications de la base (fichiers SQL)

Chaque fichier de `supabase/` s'exécute **une fois**, à la main :
Supabase → **SQL Editor** → **New query** → coller le fichier → **Run**.
L'en-tête de chaque fichier explique à quoi il sert et s'il doit passer
avant ou après un autre.

- Nouveau projet : `supabase-schema.sql`, puis
  `supabase/fix_personal_sync_rls_scope.sql`, puis les autres fichiers
  `supabase/*.sql` dans l'ordre de leur numéro de round, en respectant
  les indications « APRÈS … » de leurs en-têtes.
- Projet existant : lorsqu'une nouvelle version ajoute un fichier SQL,
  il suffit d'exécuter celui-là.

### Paiements Stripe

La mise en place (produits, clés, fonctions serveur, webhook, passage en
réel) est décrite pas à pas dans
[`supabase/functions/README-stripe.md`](supabase/functions/README-stripe.md).

## Publier une nouvelle version

1. À chaque changement de l'appli, augmenter le numéro de version à deux
   endroits, avec la même valeur :
   - `CACHE_NAME` dans `sw.js` (`fiches-cache-v245` → `fiches-cache-v246`) ;
   - `APP_VERSION` en haut de `js/app.js` (`"v245"` → `"v246"`).

   Sans ce changement, les téléphones gardent l'ancienne version en
   mémoire. Avec lui, l'appli détecte la nouveauté à l'ouverture et se met
   à jour toute seule.
2. Fusionner les modifications dans la branche `main` sur GitHub :
   l'appli est mise en ligne automatiquement en 1 à 2 minutes.
3. Vérifier dans les **Réglages** de l'appli que le nouveau numéro
   s'affiche.

Hébergement : **GitHub Pages**, à l'adresse
https://tokophobe.github.io/Fiches/ (dépôt → Settings → Pages : source
« Deploy from a branch », branche `main`, dossier `/ (root)`). Chaque
fusion dans `main` est publiée automatiquement. Un nom de domaine (par
exemple darwin-revision.fr) pourra être ajouté dans la même page,
rubrique « Custom domain ».

## Tester sur son ordinateur

L'appli ne s'ouvre pas en double-cliquant sur `index.html` : le mode
hors-ligne exige une adresse `localhost` ou HTTPS. Depuis le dossier du
projet :

```bash
python3 -m http.server 8080
```

puis ouvrir http://localhost:8080 dans le navigateur.

## Installer l'appli sur un téléphone

- **Android (Chrome)** : ouvrir l'adresse de l'appli → menu ⋮ →
  « Installer l'application ».
- **iPhone (Safari)** : ouvrir l'adresse → bouton Partager → « Sur l'écran
  d'accueil ».

## Taxonomie de la Librairie (fichier Excel)

Le classement proposé quand on publie une boîte dans la Librairie
(catégorie → cycle → niveau → année → spécialité → matière) et les filtres
de recherche sont lus **directement** dans `data/taxonomie.xlsx`.

Pour le modifier :

1. Ouvrir `data/taxonomie.xlsx` dans Excel et le modifier (onglet
   « listes » + les matrices de correspondance : une cellule non vide =
   un lien). Garder les mêmes noms d'onglets et la même disposition (ids
   et libellés dans l'onglet « listes », matrices à partir de la cellule
   C3).
2. Remplacer `data/taxonomie.xlsx` sur le site (même nom, même dossier).

Pas besoin de nouvelle version de l'appli : elle relit le fichier à
chaque ouverture. Pour vérifier : Réglages développeur → « Librairie —
taxonomie (Excel) » → « Relire l'Excel ».

Les matières sont proposées d'après la spécialité choisie (onglet
« spécialités-matières »). Pour un niveau sans spécialité (CP à 3ème),
elles viennent de l'onglet « niveaux-matières ».

Éviter de changer les ids déjà utilisés : les boîtes publiées gardent
l'id et le libellé de leur classement.

## Ouverture au public

`tools/lancement.py` fait le bilan de ce qui reste à faire avant
l'ouverture (pages encore cachées des moteurs de recherche, cases à
compléter dans les pages légales…) puis, avec `--go <adresse du site>`,
bascule le site en mode public. Les instructions sont en tête du fichier.

`tools/build_site_pages.py` génère les pages publiques « Fiches de
révision — matière / niveau » à partir de `packs/bibliotheque.json` (ce
dossier n'est pas encore dans le dépôt).

## Comment fonctionne la répétition espacée

Chaque fiche a trois valeurs : un facteur de facilité, un intervalle (en
jours) et un compteur de bonnes réponses d'affilée. Après avoir répondu,
on note la fiche :

- **Encore** → elle revient dans moins d'un jour ;
- **Difficile** → l'intervalle progresse lentement ;
- **Bien** → progression normale (1 j → 6 j → × facteur) ;
- **Facile** → l'intervalle grandit plus vite.

Tout est dans `js/sm2.js`.

## Modifier le design

Les couleurs, polices et espacements sont regroupés en haut de
`css/style.css` (bloc `:root`). La plupart se règlent aussi sans toucher
au code, depuis Darwin Admin.
