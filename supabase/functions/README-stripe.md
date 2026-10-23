# Mettre en place les paiements Stripe (mode test)

Tout se fait dans les tableaux de bord de Stripe et de Supabase. Aucune ligne de commande n'est nécessaire. En **mode test**, aucun argent ne circule : on paie avec des cartes fictives. Le passage en réel est décrit à la fin.

Prévoir environ 30 minutes.

## 1. Stripe : compte, produit, clés
1. Crée un compte sur **dashboard.stripe.com**. Tu arrives en mode test, appelé « environnement de test » ou « sandbox » : reste-y.
2. **Catalogue de produits → Ajouter un produit**.
   - Nom : `darwin — Individuel`.
   - Premier prix : **2,00 €**, **récurrent**, **mensuel**. Coche « TTC » (taxes incluses) si l'option apparaît.
   - Second prix, sur le **même produit** (« Ajouter un autre prix ») : **20,00 €**, **récurrent**, **annuel**.
   - Enregistre, puis copie les **identifiants des deux prix** : ils commencent par `price_…`.
3. **Développeurs → Clés API** : copie la **clé secrète** (`sk_test_…`). Ne la mets jamais dans l'appli ni sur le site.
4. **Paramètres → Facturation → Portail client** : active le portail. Autorise :
   - la mise à jour du moyen de paiement ;
   - la résiliation, de préférence « à la fin de la période de facturation » ;
   - l'historique des factures ;
   - le changement de formule (« Changements d'abonnement ») : ajoute le produit avec ses deux prix, pour qu'un abonné puisse passer du mensuel à l'annuel, ou l'inverse.

## 2. Supabase : base et fonctions
1. **Éditeur SQL** : exécute `supabase/round65_migration.sql`.
2. **Edge Functions → Deploy a new function → Via Editor**, trois fois. Pour chacune, nomme la fonction, colle tout le fichier, puis clique sur « Deploy » :

   | Nom de la fonction | Fichier à coller |
   |---|---|
   | `create-checkout` | `supabase/functions/create-checkout/index.ts` |
   | `customer-portal` | `supabase/functions/customer-portal/index.ts` |
   | `stripe-webhook` | `supabase/functions/stripe-webhook/index.ts` |

3. Dans la fonction **`stripe-webhook`**, onglet **Details / Settings** : désactive **« Enforce JWT Verification »** (Verify JWT). Stripe n'envoie pas de jeton Supabase ; c'est la signature Stripe qui protège cette fonction.
4. **Edge Functions → Secrets** : ajoute

   | Nom | Valeur |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_test_…` |
   | `STRIPE_PRICE_INDIVIDUEL` | `price_…` (2 € / mois) |
   | `STRIPE_PRICE_INDIVIDUEL_ANNUEL` | `price_…` (20 € / an) |
   | `APP_URL` | l'adresse exacte de l'appli, par exemple `https://tokophobe.github.io/Fiches/index.html` |
   | `STRIPE_WEBHOOK_SECRET` | voir l'étape 3 ci-dessous |

   Facultatif :
   - `STRIPE_TRIAL_DAYS` : 30 par défaut ; 0 = pas d'essai ;
   - `STRIPE_AUTOMATIC_TAX=1` : calcul de la TVA par Stripe Tax.

## 3. Stripe : prévenir Supabase (webhook)
1. **Développeurs → Webhooks** (ou Workbench → Destinations d'évènements) → **Ajouter une destination**.
2. URL : `https://<ton-projet>.supabase.co/functions/v1/stripe-webhook`. Le nom du projet figure dans `js/config.js`, par exemple `pyqffmweflicfpbniroz`.
3. Évènements à envoyer :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copie le **secret de signature** (`whsec_…`) dans le secret Supabase `STRIPE_WEBHOOK_SECRET`.

## 4. Ouvrir les paiements et tester
1. **Darwin Admin → Abonnements → « Ouvrir les paiements (Stripe) »** : active l'option.
2. Avec un **compte de test** (pas l'administrateur), va dans **Abonnements** et touche **« Mensuel — 1 mois gratuit, puis 2 € / mois »** ou **« Annuel — 1 mois gratuit, puis 20 € / an »**.
3. Cartes de test (date future quelconque, CVC quelconque) :

   | Carte | Résultat |
   |---|---|
   | `4242 4242 4242 4242` | Paiement accepté |
   | `4000 0027 6000 3184` | Validation 3-D Secure demandée |
   | `4000 0000 0000 0341` | Carte enregistrée mais prélèvement refusé (statut « impayé » à la fin de l'essai) |

4. Ce qu'on doit voir :
   - de retour dans l'appli, le robot dit « Merci ! Ton mois d'essai a commencé… » ;
   - la page Abonnements affiche l'essai et le bouton « Gérer mon abonnement » ;
   - Darwin Admin → Comptes indique « Essai » ;
   - « Gérer mon abonnement » puis « Annuler l'abonnement » : la page affiche « résilié, actif jusqu'au … ».
5. Pour simuler la fin de l'essai sans attendre 30 jours : dans Stripe, utilise les **horloges de test** (Test clocks / Simulations), ou crée un prix de test avec `STRIPE_TRIAL_DAYS=0`.
6. En cas de problème : Supabase → Edge Functions → la fonction → **Logs** ; Stripe → Webhooks → la destination → évènements envoyés et réponses.

## 5. Passer en réel (plus tard)
- Activer le compte Stripe : structure juridique, identité, IBAN.
- En **mode réel**, recréer le produit et le prix, puis récupérer les clés `sk_live_…`.
- Créer un **nouveau webhook** en mode réel, avec un nouveau `whsec_…`.
- Remplacer les 4 secrets Supabase (clé, les deux prix, secret du webhook).
- Activer « Réserver la Librairie aux abonnés » dans Darwin Admin le jour du lancement.

## Comment ça marche
- **L'appli ne voit jamais de carte bancaire.** La page de paiement et le portail sont hébergés par Stripe.
- **`create-checkout`** :
  - vérifie le compte connecté ;
  - crée le client Stripe une seule fois ;
  - offre l'essai seulement si le compte n'en a jamais eu (`trial_used`) ;
  - refuse si un abonnement est déjà en cours.
- **`stripe-webhook`** :
  - vérifie la signature ;
  - relit l'abonnement chez Stripe, pour avoir toujours l'état à jour même si les évènements arrivent dans le désordre ;
  - met à jour la table `subscriptions` ;
  - ignore un évènement déjà traité (table `stripe_events`) ;
  - n'écrase jamais un abonnement récent avec la fin d'un ancien.
- **`has_library_access`** (côté serveur) et l'appli lisent la même table. Un abonnement actif ou en essai donne accès aux fiches complètes de la Librairie.
- **Supprimer mon compte** est refusé tant qu'un abonnement continue d'être prélevé. Une fois l'abonnement résilié, c'est possible ; le client Stripe et ses factures restent chez Stripe, ce qui est une obligation comptable.
- **Tests automatiques** : `FICHES_NO_SERVE=1 deno test -A supabase/functions/tests/`.
