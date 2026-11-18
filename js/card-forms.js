/* ============================================================
   Fiches — formes d'une fiche (spéc. §4.7, décidé les 16-17 nov. 2026).
   Logique pure, sans écran ni stockage, l'heure étant passée en
   paramètre : testée dans tests/card-forms.test.js.

   Quatre formes, en deux niveaux :
     niveau 1 (question basique) : (a) QCM, (b) question / réponse ;
     niveau 2 (question poussée) : (c) texte à trous, (d) question / réponse.
   Toute fiche a au moins (b). Champs d'une fiche :
     (a) `wrongs` : 3 mauvaises réponses (existant) ;
     (c) `cloze` : { text: "… ___ … ___ …", blanks: [{ answer, wrongs: [3] }] } ;
     (d) `q2` / `a2` : question et réponse poussées ;
     suivi : `form` (forme actuelle), `formMax` (plus haute atteinte),
             `formStreak` (réussites de suite à la forme actuelle).
             `formRatings` (v297) : dernière note à chaque forme, pour la
             jauge — { a: 0-3, b: 0-3, c: 0-3, d: 0-3 }.
   Étape 1 : règles seules ; branchées dans l'appli en v296 (étape 2) ;
   jauge (§4.6) en v297.
   ============================================================ */
(function (root) {
  "use strict";

  const ORDER = ["a", "b", "c", "d"];
  /** Délai avant la première interrogation sous une forme supérieure. */
  const FORM_UP_DELAY_MIN = 60;
  const BLANK = /_{3,}/g;

  function clean(v) {
    return String(v == null ? "" : v).trim();
  }
  function hasWrongs(list) {
    return Array.isArray(list) && list.map(clean).filter(Boolean).length === 3;
  }

  /** Texte à trous valable : autant de trous « ___ » dans le texte que de
   *  réponses, chacune avec ses 3 mauvaises réponses. */
  function validCloze(cloze) {
    if (!cloze || typeof cloze !== "object" || !Array.isArray(cloze.blanks) || !cloze.blanks.length) return false;
    const holes = (clean(cloze.text).match(BLANK) || []).length;
    return holes === cloze.blanks.length && cloze.blanks.every((b) => b && clean(b.answer) && hasWrongs(b.wrongs));
  }

  /** Morceaux de texte autour des trous (un de plus que de trous) :
   *  « A ___ B ___ C » → ["A ", " B ", " C"]. */
  function clozeSegments(text) {
    return String(text == null ? "" : text).split(BLANK);
  }

  /* v299 : saisie d'un texte à trous dans l'écran de création d'une fiche :
     la phrase s'écrit avec les mots à cacher entre crochets,
     « Le penseur chinois [Confucius] enseigne… ». */
  const BRACKET = /\[([^\[\]]*)\]/g;

  /** Mots entre crochets, dans l'ordre. */
  function bracketAnswers(text) {
    return Array.from(String(text == null ? "" : text).matchAll(BRACKET), (m) => m[1].trim());
  }

  /** Phrase à crochets d'un texte à trous existant (pour le modifier). */
  function clozeToBrackets(cloze) {
    if (!cloze || !Array.isArray(cloze.blanks)) return "";
    let i = 0;
    return String(cloze.text || "").replace(BLANK, () => `[${(cloze.blanks[i++] || {}).answer || ""}]`);
  }

  /** v301 : texte à trous en une ligne (pages qui comparent deux
   *  versions d'une fiche) : la phrase à crochets, puis les réponses
   *  fausses de chaque trou. */
  function clozeSummary(cloze) {
    if (!validCloze(cloze)) return "";
    const wrongs = cloze.blanks.map((b, i) => `trou ${i + 1} : ${b.wrongs.map(clean).join(" · ")}`).join(" ; ");
    return `${clozeToBrackets(cloze)} — réponses fausses : ${wrongs}`;
  }

  /** Réponses fausses de chaque trou, saisies une ligne par trou, séparées
   *  par « ; » (Darwin Admin) ; et l'inverse. */
  function parseBlankWrongs(text) {
    return String(text == null ? "" : text).split("\n").map((l) => l.split(";").map(clean).filter(Boolean)).filter((l) => l.length);
  }
  function blankWrongsText(cloze) {
    return validCloze(cloze) ? cloze.blanks.map((b) => b.wrongs.map(clean).join(" ; ")).join("\n") : "";
  }

  /** Texte à trous à partir de la phrase à crochets et des 3 mauvaises
   *  réponses de chaque trou. Renvoie { cloze } (null si la phrase est
   *  vide) ou { error } (message pour l'auteur de la fiche). */
  function clozeFromBrackets(text, wrongsList) {
    const src = clean(text);
    if (!src) return { cloze: null };
    const opened = (src.match(/\[/g) || []).length;
    const closed = (src.match(/\]/g) || []).length;
    if (opened !== closed || /\[[^\]]*\[/.test(src)) return { error: "Texte à trous : un crochet [ ou ] est mal placé. Chaque mot à cacher s'écrit entre [ et ]." };
    const answers = bracketAnswers(src);
    if (!answers.length) return { error: "Texte à trous : mets entre crochets les mots à cacher, par exemple « Le penseur chinois [Confucius] enseigne… »." };
    if (answers.some((a) => !a)) return { error: "Texte à trous : un des crochets est vide." };
    if (/_{3,}/.test(src.replace(BRACKET, ""))) return { error: "Texte à trous : écris les mots à cacher entre crochets, pas avec des tirets « ___ »." };
    const norm = (t) => clean(t).replace(/\s+/g, " ").toLowerCase();
    const blanks = [];
    for (let i = 0; i < answers.length; i++) {
      const wrongs = ((wrongsList || [])[i] || []).map(clean).filter(Boolean);
      if (wrongs.length !== 3) return { error: `Texte à trous : il faut 3 réponses fausses pour le trou ${i + 1} (« ${answers[i]} »).` };
      if (new Set([answers[i], ...wrongs].map(norm)).size !== 4) return { error: `Texte à trous : les 4 propositions du trou ${i + 1} (« ${answers[i]} ») doivent être différentes.` };
      blanks.push({ answer: answers[i], wrongs });
    }
    return { cloze: { text: src.replace(BRACKET, "___"), blanks } };
  }

  /** Formes disponibles pour cette fiche. */
  function forms(card) {
    const c = card || {};
    return {
      a: hasWrongs(c.wrongs),
      b: true,
      c: validCloze(c.cloze),
      d: !!(clean(c.q2) && clean(c.a2)),
    };
  }
  /** La fiche a-t-elle une question poussée (niveau 2) ? */
  function hasLevel2(card) {
    const f = forms(card);
    return f.c || f.d;
  }

  /** Forme disponible la plus proche en dessous (ou égale). */
  function atOrBelow(f, form) {
    for (let i = ORDER.indexOf(form); i >= 0; i--) if (f[ORDER[i]]) return ORDER[i];
    return "b";
  }
  function above(f, form) {
    for (let i = ORDER.indexOf(form) + 1; i < ORDER.length; i++) if (f[ORDER[i]]) return ORDER[i];
    return null;
  }
  function below(f, form) {
    for (let i = ORDER.indexOf(form) - 1; i >= 0; i--) if (f[ORDER[i]]) return ORDER[i];
    return null;
  }

  /** Forme sous laquelle poser la fiche. Fiche sans `form` (fiches
   *  actuelles) : QCM tant que `qcmMode` n'est pas `false`, comme avant.
   *  Une forme retirée de la fiche retombe sur la plus proche en dessous.
   *  Échéance proche (sprint) : la forme la plus haute déjà atteinte. */
  function currentForm(card, opts) {
    const c = card || {};
    const f = forms(c);
    if (opts && opts.sprint && ORDER.includes(c.formMax)) return atOrBelow(f, c.formMax);
    if (ORDER.includes(c.form)) return atOrBelow(f, c.form);
    return f.a && c.qcmMode !== false ? "a" : "b";
  }

  /** Nouvelle forme après une note (0 = Je ne sais pas … 3 = Parfaitement)
   *  donnée à la forme `form` (tableau du §4.7).
   *  Renvoie { form, formMax, formStreak, change: "up" | "down" | "same" }. */
  function afterRating(card, form, rating) {
    const c = card || {};
    const f = forms(c);
    const streak = Number(c.form === form ? c.formStreak : 0) || 0;
    let next = form;
    let nextStreak = 0;
    if (form === "a") {
      // Juste du premier coup (« Je sais ») → (b).
      if (rating >= 2) next = "b";
    } else if (form === "b") {
      if (rating === 0) next = below(f, "b") || "b";
      else if (rating >= 2) {
        nextStreak = rating === 3 ? 2 : streak + 1;
        if (nextStreak >= 2 && above(f, "b")) next = above(f, "b");
      }
    } else if (form === "c") {
      // Tout juste à la 1re tentative (« Je sais »), 2 fois de suite → (d).
      if (rating >= 2) {
        nextStreak = streak + 1;
        if (nextStreak >= 2 && above(f, "c")) next = above(f, "c");
      }
    } else if (form === "d") {
      if (rating === 0) next = below(f, "d") || "d";
    }
    const change = ORDER.indexOf(next) > ORDER.indexOf(form) ? "up" : ORDER.indexOf(next) < ORDER.indexOf(form) ? "down" : "same";
    if (change !== "same") nextStreak = 0;
    else nextStreak = Math.min(nextStreak, 2);
    const prevMax = ORDER.includes(c.formMax) ? c.formMax : form;
    const formMax = ORDER.indexOf(next) > ORDER.indexOf(prevMax) ? next : prevMax;
    return { form: next, formMax, formStreak: nextStreak, change };
  }

  /** Montée de forme (décision Q24) : la note qui fait monter n'allonge pas
   *  le délai. Le dernier délai reste celui d'avant, la date de dernière
   *  interrogation devient celle de la montée, et la fiche revient 1 heure
   *  plus tard sous sa nouvelle forme. Champs à fusionner dans la fiche. */
  function scheduleFormUp(card, now, delayMin) {
    const d = typeof delayMin === "number" && delayMin > 0 ? delayMin : FORM_UP_DELAY_MIN;
    return {
      dd: card && typeof card.dd === "number" ? card.dd : 0,
      lastReviewed: now.toISOString(),
      dueDate: new Date(now.getTime() + d * 60000).toISOString(),
    };
  }

  /** Note d'un texte à trous, donnée par l'appli (pas par l'élève) :
   *  tout juste à la 1re tentative → 2 (Je sais) ; à la 2e → 1 (Vague
   *  idée) ; encore faux → 0 (Je ne sais pas). */
  function clozeRating(firstAllRight, secondAllRight) {
    if (firstAllRight) return 2;
    return secondAllRight ? 1 : 0;
  }

  /* ---------- Jauge de progression (§4.6, décidé le 18 nov. 2026) ----------
     Une case par forme de la fiche : (b) seul = 1 case, (a)+(b) = 2,
     fiche complète = 4. Chaque case garde la dernière note obtenue à sa
     forme ; une forme jamais posée compte « Je ne sais pas ». En (a) et
     (c), « Je sais » compte « Parfaitement » (ces formes n'ont pas de
     « Parfaitement » : la fiche monte). */

  function isNote(n) {
    return Number.isInteger(n) && n >= 0 && n <= 3;
  }

  /** Notes par forme d'une fiche notée avant la v297 (sans `formRatings`),
   *  d'après sa seule dernière note `lastRating` : elle porte sur la forme
   *  `lastRatedForm` (sinon la forme actuelle) ; une forme déjà dépassée
   *  compte comme sue. Seules les formes atteintes sont renseignées. */
  function legacyFormRatings(card, lastRating) {
    const c = card || {};
    const f = forms(c);
    const cur = currentForm(c);
    const rated = ORDER.includes(c.lastRatedForm) && f[c.lastRatedForm] ? c.lastRatedForm : cur;
    const top = ORDER.indexOf(rated) > ORDER.indexOf(cur) ? rated : cur;
    const out = {};
    ORDER.forEach((k) => {
      if (!f[k] || ORDER.indexOf(k) > ORDER.indexOf(top)) return;
      if (k === rated) {
        if (isNote(lastRating)) out[k] = lastRating;
      } else if (ORDER.indexOf(k) < ORDER.indexOf(cur)) out[k] = 3;
    });
    return out;
  }

  /** Notes par forme connues de la fiche (`formRatings`, sinon reprises de
   *  l'ancienne dernière note). */
  function formRatingsOf(card, lastRating) {
    const c = card || {};
    if (c.formRatings && typeof c.formRatings === "object") return c.formRatings;
    return legacyFormRatings(c, lastRating === undefined ? c.lastRating : lastRating);
  }

  /** Notes après une note `rating` donnée à la forme `form`. */
  function withFormRating(card, form, rating, lastRating) {
    return { ...formRatingsOf(card, lastRating), [form]: rating };
  }

  /** Cases de la jauge d'une fiche : une note (0-3) par forme qu'elle a,
   *  dans l'ordre (a) (b) (c) (d) (forme jamais notée : sue si déjà
   *  dépassée, sinon « Je ne sais pas »). */
  function gaugeNotes(card, lastRating) {
    const f = forms(card);
    const notes = formRatingsOf(card, lastRating);
    // v300 : une forme jamais notée mais déjà dépassée (par exemple un
    // texte à trous ajouté à une fiche déjà en question poussée, qui n'y
    // redescendra jamais si elle est sue) compte comme sue ; une forme
    // ajoutée au-dessus de la forme actuelle part en gris.
    const cur = ORDER.indexOf(currentForm(card));
    return ORDER.filter((k) => f[k]).map((k) => {
      const n = isNote(notes[k]) ? notes[k] : ORDER.indexOf(k) < cur ? 3 : 0;
      return (k === "a" || k === "c") && n === 2 ? 3 : n;
    });
  }

  /** Nombre de cases par note [0, 1, 2, 3] pour un ensemble de fiches ;
   *  `lastRatingOf(card)` donne l'ancienne dernière note (fiches d'avant
   *  la v297). Le total des cases remplace le nombre de fiches. */
  function gaugeCounts(cards, lastRatingOf) {
    const counts = [0, 0, 0, 0];
    (cards || []).forEach((c) => {
      gaugeNotes(c, lastRatingOf ? lastRatingOf(c) : undefined).forEach((n) => {
        counts[n] += 1;
      });
    });
    return counts;
  }

  const api = {
    ORDER, FORM_UP_DELAY_MIN, validCloze, clozeSegments, bracketAnswers, clozeToBrackets, clozeFromBrackets, clozeSummary, parseBlankWrongs, blankWrongsText, forms, hasLevel2, currentForm, afterRating, scheduleFormUp, clozeRating,
    legacyFormRatings, withFormRating, gaugeNotes, gaugeCounts,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CardForms = api;
})(typeof window !== "undefined" ? window : globalThis);
