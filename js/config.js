/* ============================================================
   Fiches — configuration du serveur (Supabase), intégrée à l'appli.

   Round 29 : chaque utilisateur se contente de créer son compte et de se
   connecter ; il n'a plus à saisir lui-même l'adresse et la clé du projet
   Supabase. Renseigne ici, UNE FOIS, l'URL du projet et sa clé publique
   « anon » (Supabase → Project Settings → API). Cette clé est faite pour
   être publique : ce sont les règles de sécurité (RLS) de la base qui
   protègent les données de chacun.

   Astuce : Réglages développeur → « Configuration du serveur » affiche le
   contenu exact à coller ici, repris de cet appareil.

   Tant que ces deux valeurs sont vides, l'appli utilise celles saisies
   dans la page Synchronisation de l'appareil (ancien fonctionnement).
   ============================================================ */
window.FICHES_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
};
