/* ============================================================
   Fiches — règles de la Librairie (v275). Logique pure, sans écran ni
   stockage, l'heure étant passée en paramètre : testée dans
   tests/library-rules.test.js (docs/SPECIFICATION.md, §7.1).
   ============================================================ */
(function (root) {
  "use strict";

  const DAY_MS = 86400000;

  /** Ordre au hasard des boîtes : une boîte publiée récemment a plus de
   *  chances d'être en tête. Poids de 5 pour une boîte du jour, qui
   *  redescend vers 1 en quelques semaines (1 + 4 × e^(−âge/21 jours)). */
  function recencyWeight(publishedAtMs, nowMs) {
    const ageDays = Number.isFinite(publishedAtMs) ? Math.max(0, (nowMs - publishedAtMs) / DAY_MS) : 365;
    return 1 + 4 * Math.exp(-ageDays / 21);
  }

  /** Clé de tri au hasard pondéré (plus petite = plus haut dans la
   *  liste) ; `u` est un nombre au hasard entre 0 et 1. */
  function shuffleKey(weight, u) {
    return -Math.log(u || 1e-9) / weight;
  }

  /** Bouton « Afficher les vidéos de cours » : actif par défaut. Masquer
   *  les vidéos est retenu (`pref` = { since, visits }) pendant les 10
   *  visites suivantes de la Librairie ET au plus 5 jours ; au-delà,
   *  l'affichage par défaut revient. Renvoie l'état à appliquer pour CETTE
   *  visite et la mémoire à garder (null = oubliée). */
  const VIDEO_PREF_MAX_VISITS = 10;
  const VIDEO_PREF_MAX_MS = 5 * DAY_MS;
  function videoPrefOnVisit(pref, nowMs) {
    if (!pref) return { showVideos: true, pref: null };
    const visits = (Number(pref.visits) || 0) + 1;
    const since = Number(pref.since) || 0;
    if (visits > VIDEO_PREF_MAX_VISITS || nowMs - since >= VIDEO_PREF_MAX_MS) return { showVideos: true, pref: null };
    return { showVideos: false, pref: { since, visits } };
  }

  const api = { recencyWeight, shuffleKey, videoPrefOnVisit, VIDEO_PREF_MAX_VISITS, VIDEO_PREF_MAX_MS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LibraryRules = api;
})(typeof window !== "undefined" ? window : globalThis);
