/* ============================================================
   Fiches — configuration du serveur (Supabase), intégrée à l'appli.

   Round 29 : chaque utilisateur se contente de créer son compte et de se
   connecter ; il n'a plus à saisir lui-même l'adresse et la clé du projet
   Supabase. Les clés « anon » ci-dessous sont faites pour être publiques :
   ce sont les règles de sécurité (RLS) de la base qui protègent les
   données de chacun. (Ne JAMAIS mettre ici la clé « service_role ».)

   v258 : COPIE DE TEST (voir docs/COPIE-DE-TEST.md). Deux bases :
   - la base de TEST, utilisée SEULEMENT aux adresses de test : liens
     Netlify (…netlify.app) des demandes de fusion, et essais en local
     (localhost) ;
   - la base RÉELLE partout ailleurs (adresse réelle de l'appli, et un
     futur nom de domaine sans rien changer ici).
   Le choix est automatique : rien à modifier ici d'une version à l'autre.
   Dans la copie de test, un bandeau « VERSION DE TEST » est affiché.

   Astuce : Darwin Admin (admin/) → Réglages › Technique → « Configuration
   du serveur » affiche la configuration utilisée.
   ============================================================ */
(function () {
  var REAL = {
    supabaseUrl: "https://pyqffmweflicfpbniroz.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cWZmbXdlZmxpY2ZwYm5pcm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMTkxMzksImV4cCI6MjEwMDc5NTEzOX0.R8wXf53YGnAMoCInWax1y1yHPX6BRTBV5Ui2u-pDj4k",
  };
  var TEST = {
    supabaseUrl: "https://tcyvrkiccmlozwkvhpul.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeXZya2ljY21sb3p3a3ZocHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3OTIzMDMsImV4cCI6MjEwOTM2ODMwM30.klk6RBV10L2PBcS4S3k9Bx9VSWuB1MWvrx7a6iLoVC0",
  };
  // Adresses de test (et elles seules) : base de test.
  var host = String(location.hostname || "").toLowerCase();
  var isTestHost = host === "localhost" || host === "127.0.0.1" || /\.netlify\.app$/.test(host);
  var isReal = !isTestHost;
  var cfg = isReal ? REAL : TEST;
  window.FICHES_CONFIG = {
    supabaseUrl: cfg.supabaseUrl,
    supabaseAnonKey: cfg.supabaseAnonKey,
    environment: isReal ? "real" : "test",
  };
  if (!isReal) {
    // Bandeau « VERSION DE TEST », pour ne jamais confondre les deux.
    try {
      document.documentElement.classList.add("env-test");
      var style = document.createElement("style");
      style.textContent =
        "html.env-test body::after{content:'VERSION DE TEST';position:fixed;left:50%;bottom:0;transform:translateX(-50%);" +
        "z-index:2147483647;background:#d9480f;color:#fff;font:700 11px/1 system-ui,sans-serif;letter-spacing:.08em;" +
        "padding:4px 10px;border-radius:6px 6px 0 0;pointer-events:none;}";
      (document.head || document.documentElement).appendChild(style);
    } catch (e) {
      /* sans bandeau : l'appli marche quand même */
    }
  }
})();
