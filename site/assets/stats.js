/* Compteur de visites du site public de darwin (v240), sans cookie.
   Envoie seulement : la page vue (sans paramètres) et le nom de domaine
   du site d'où vient le visiteur (ex. www.google.com). Rien n'est écrit
   sur l'appareil ; aucune adresse IP ni aucun identifiant n'est gardé
   (voir supabase/round80_migration.sql, count_page_view). */
(function () {
  "use strict";
  var c = window.DARWIN_STATS || {};
  if (!c.url || !c.key || !window.fetch) return;
  if (navigator.webdriver) return; // robots de test
  try {
    var path = location.pathname || "/";
    // Le site peut être publié dans un sous-dossier : on garde la partie
    // à partir de « revision/ » ou le nom du fichier.
    var m = /\/(revision\/[^/]+|[^/]*)$/.exec(path);
    path = "/" + (m ? m[1] : "");
    var ref = "";
    if (document.referrer) {
      var r = new URL(document.referrer);
      if (r.hostname && r.hostname !== location.hostname) ref = r.hostname.toLowerCase();
    }
    fetch(c.url.replace(/\/+$/, "") + "/rest/v1/rpc/count_page_view", {
      method: "POST",
      keepalive: true,
      headers: { apikey: c.key, Authorization: "Bearer " + c.key, "Content-Type": "application/json" },
      body: JSON.stringify({ p_path: path, p_referrer: ref }),
    }).catch(function () {});
  } catch (e) {
    /* jamais bloquant */
  }
})();
