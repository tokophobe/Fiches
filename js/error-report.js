/* ============================================================
   Fiches — v236 : remontée des erreurs.

   Les erreurs JavaScript non prévues (et les promesses rejetées sans
   traitement) sont envoyées à Supabase (fonction report_client_error,
   voir supabase/round76_migration.sql) et listées dans Darwin Admin →
   onglet « Erreurs ». Rien n'est envoyé d'autre que le message, la pile
   d'appels, la page, la version et le navigateur : jamais le contenu des
   fiches ni ce que l'utilisateur a saisi.

   Chargé tout en haut de la page (juste après js/config.js) pour voir
   aussi les erreurs du démarrage. Fonctionne sans le client Supabase :
   simple appel fetch à l'API REST.

   window.FichesErrors.report(kind, message, stack) : remonter à la main
   une erreur attrapée par le code.
   ============================================================ */
(function () {
  "use strict";
  var APP = /\/admin\//.test(location.pathname) ? "admin" : "app";
  var MAX_PER_PAGE = 10;
  var sent = 0;
  var seen = {};

  function fnv(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ("0000000" + h.toString(16)).slice(-8);
  }
  // Retire de la pile ce qui change d'un appareil à l'autre (adresse du
  // site, paramètres « ?v= »), pour que la même erreur ait la même
  // empreinte chez tout le monde.
  function cleanStack(stack) {
    return String(stack || "")
      .replace(/https?:\/\/[^\s)]+?\/((?:js|admin|css)\/[^\s?):]+)(\?[^\s):]*)?/g, "$1")
      .slice(0, 4000);
  }
  function accessToken() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!/^sb-.*-auth-token$/.test(k)) continue;
        var v = JSON.parse(localStorage.getItem(k) || "null");
        if (v && v.access_token) return v.access_token;
        if (v && v.currentSession && v.currentSession.access_token) return v.currentSession.access_token;
      }
    } catch (e) {}
    return "";
  }
  function ignored(message, stack) {
    var m = String(message || "");
    if (!m) return true;
    // Bruit connu, sans rapport avec l'appli.
    if (/ResizeObserver loop|^Script error\.?$|Load failed|Failed to fetch|NetworkError|cancelled|annulé|AbortError/i.test(m)) return true;
    if (/(chrome|moz|safari(-web)?)-extension:\/\//i.test(String(stack || ""))) return true;
    return false;
  }

  function report(kind, message, stack) {
    try {
      message = String(message || "").slice(0, 500);
      stack = cleanStack(stack);
      if (ignored(message, stack)) return;
      if (sent >= MAX_PER_PAGE) return;
      var firstLine = (stack.split("\n").filter(function (l) { return /\.js/.test(l); })[0] || "").trim();
      var fp = fnv(APP + "\u0001" + message.replace(/\d+/g, "#") + "\u0001" + firstLine);
      if (seen[fp]) return;
      seen[fp] = true;
      sent++;
      var cfg = window.FICHES_CONFIG || {};
      if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return;
      var token = accessToken() || cfg.supabaseAnonKey;
      fetch(cfg.supabaseUrl.replace(/\/+$/, "") + "/rest/v1/rpc/report_client_error", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json", apikey: cfg.supabaseAnonKey, Authorization: "Bearer " + token },
        body: JSON.stringify({
          p_app: APP,
          p_version: String(window.FICHES_APP_VERSION || ""),
          p_kind: String(kind || "error").slice(0, 20),
          p_message: message,
          p_stack: stack,
          p_page: (location.pathname + location.hash).slice(0, 300),
          p_user_agent: String(navigator.userAgent || "").slice(0, 300),
          p_fingerprint: fp,
        }),
      }).catch(function () {});
    } catch (e) {}
  }

  window.addEventListener("error", function (ev) {
    // Erreur de chargement d'une image ou d'un script : pas une erreur JS.
    if (!ev || (ev.target && ev.target !== window)) return;
    var err = ev.error;
    report("error", (err && err.message) || ev.message, (err && err.stack) || (ev.filename ? ev.filename + ":" + ev.lineno + ":" + ev.colno : ""));
  });
  window.addEventListener("unhandledrejection", function (ev) {
    var r = ev && ev.reason;
    var msg = r && r.message ? r.message : typeof r === "string" ? r : "";
    if (!msg) return;
    report("rejection", msg, r && r.stack);
  });
  window.FichesErrors = { report: report };
})();
