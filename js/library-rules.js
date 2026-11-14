/* ============================================================
   Fiches — règles de la Librairie (v275, chapitres v293). Logique pure, sans écran ni
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

  /* v293 : Librairie rangée par chapitres quand une matière est choisie
     (spéc. §7.1). `items` : les boîtes affichées, dans leur ordre actuel,
     chacune { id, packKey, chapterRef } — packKey pour une boîte toute
     prête (rangée d'après le programme), chapterRef (« niveau|matière|titre
     du chapitre ») pour une boîte d'enseignant rangée par darwin.
     `entries` : les matières du programme concernées, dans l'ordre
     ({ key: « niveau|matière », niveau, chapitres }). Renvoie une liste à
     afficher : { kind: "chapter" | "sub", title } et { kind: "item", id }.
     Dans un chapitre : ses boîtes « l'essentiel », puis les boîtes
     d'enseignants, puis chaque sous-thème avec ses boîtes ; les boîtes
     sans chapitre finissent sous « Autres chapitres ». Un titre n'est
     montré que s'il a au moins une boîte. */
  const OTHER_CHAPTERS = "Autres chapitres";
  function normTitle(t) {
    return String(t || "").trim().toLowerCase();
  }
  function chapterRefKey(ref) {
    const parts = String(ref || "").split("|");
    if (parts.length < 3) return "";
    return `${parts[0]}|${parts[1]}|${normTitle(parts.slice(2).join("|"))}`;
  }
  function groupByChapters(items, entries) {
    const byPack = new Map();
    const byRef = new Map();
    (items || []).forEach((it) => {
      if (it.packKey && !byPack.has(it.packKey)) byPack.set(it.packKey, it);
      const rk = chapterRefKey(it.chapterRef);
      if (rk) {
        if (!byRef.has(rk)) byRef.set(rk, []);
        byRef.get(rk).push(it);
      }
    });
    const placed = new Set();
    const take = (it) => {
      if (!it || placed.has(it.id)) return null;
      placed.add(it.id);
      return { kind: "item", id: it.id };
    };
    const out = [];
    const list = entries || [];
    const several = list.length > 1;
    list.forEach((e) => {
      (e.chapitres || []).forEach((c) => {
        const rows = [];
        (c.b || []).forEach((k) => {
          const r = take(byPack.get(k));
          if (r) rows.push(r);
        });
        (byRef.get(`${e.key}|${normTitle(c.t)}`) || []).forEach((it) => {
          const r = take(it);
          if (r) rows.push(r);
        });
        (c.s || []).forEach((st) => {
          const sub = [];
          (st.b || []).forEach((k) => {
            const r = take(byPack.get(k));
            if (r) sub.push(r);
          });
          if (sub.length) rows.push({ kind: "sub", title: st.t }, ...sub);
        });
        if (rows.length) out.push({ kind: "chapter", title: several && e.niveau ? `${e.niveau} · ${c.t}` : c.t }, ...rows);
      });
    });
    const rest = (items || []).filter((it) => !placed.has(it.id));
    if (rest.length) {
      // Rien n'a de chapitre : pas de titre du tout (liste simple).
      if (out.length) out.push({ kind: "chapter", title: OTHER_CHAPTERS, other: true });
      rest.forEach((it) => out.push({ kind: "item", id: it.id }));
    }
    return out;
  }

  const api = { recencyWeight, shuffleKey, videoPrefOnVisit, VIDEO_PREF_MAX_VISITS, VIDEO_PREF_MAX_MS, groupByChapters, chapterRefKey, OTHER_CHAPTERS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LibraryRules = api;
})(typeof window !== "undefined" ? window : globalThis);
