/* Tests des formes d'une fiche (js/card-forms.js ; docs/SPECIFICATION.md,
   §4.7). Un test par ligne du tableau « Passage d'une forme à l'autre »,
   puis les formes manquantes, les fiches actuelles et l'exemple chiffré
   de la montée de forme (décision Q24). */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

globalThis.window = globalThis.window || {};
require(path.join(__dirname, "..", "js", "settings-model.js"));
const M = globalThis.window.FichesSettingsModel;
const A = require(path.join(__dirname, "..", "js", "revision-algo.js"));
const F = require(path.join(__dirname, "..", "js", "card-forms.js"));

const AGAIN = 0, HARD = 1, GOOD = 2, EASY = 3;
const DAY = 1440;
// Fiche complète (a) + (b) + (c) + (d) : l'exemple de Confucius (§4.7).
const CONFUCIUS = {
  question: "Quel penseur chinois enseigne le respect des ancêtres, de l'ordre et des devoirs ?",
  answer: "Confucius",
  wrongs: ["Lao Tseu", "Bouddha", "Aristote"],
  cloze: {
    text: "Le penseur chinois ___ enseigne le respect ___, de ___ et des ___.",
    blanks: [
      { answer: "Confucius", wrongs: ["Lao Tseu", "Bouddha", "Aristote"] },
      { answer: "des ancêtres", wrongs: ["des animaux", "des étrangers", "des rois"] },
      { answer: "l'ordre", wrongs: ["la liberté", "la guerre", "la richesse"] },
      { answer: "devoirs", wrongs: ["loisirs", "voyages", "fêtes"] },
    ],
  },
  q2: "Qui est Confucius ?",
  a2: "Un penseur chinois qui enseigne le respect des ancêtres, de l'ordre et des devoirs.",
};
// Fiche de correspondance (a) + (b) + (d) : house / maison (§4.7).
const HOUSE = { question: "Que veut dire house en anglais ?", answer: "maison", wrongs: ["route", "musique", "jardin"], q2: "Comment dit-on maison en anglais ?", a2: "house" };
const at = (card, form, extra) => Object.assign({}, card, { form }, extra || {});
const after = (card, form, rating, extra) => F.afterRating(at(card, form, extra), form, rating);

/* ---------- Les formes d'une fiche ---------- */

test("Formes : la fiche de Confucius a les quatre formes, house / maison a (a), (b) et (d)", () => {
  assert.deepEqual(F.forms(CONFUCIUS), { a: true, b: true, c: true, cbis: false, d: true });
  assert.deepEqual(F.forms(HOUSE), { a: true, b: true, c: false, cbis: false, d: true });
});

test("Formes : toujours au moins (b) ; une fiche simple n'a que (b)", () => {
  assert.deepEqual(F.forms({ question: "Q", answer: "R" }), { a: false, b: true, c: false, cbis: false, d: false });
});

test("Formes : un texte à trous n'est valable que si chaque trou a sa réponse et ses 3 propositions fausses", () => {
  assert.equal(F.validCloze(CONFUCIUS.cloze), true);
  assert.equal(F.validCloze({ text: "Le ___ et le ___.", blanks: [{ answer: "x", wrongs: ["a", "b", "c"] }] }), false);
  assert.equal(F.validCloze({ text: "Le ___.", blanks: [{ answer: "x", wrongs: ["a", "b"] }] }), false);
});

/* ---------- Tableau « Passage d'une forme à l'autre » (§4.7) ---------- */

test("(a) QCM — Je ne sais pas (2 erreurs) : reste en (a)", () => {
  assert.equal(after(CONFUCIUS, "a", AGAIN).form, "a");
});
test("(a) QCM — Vague idée (1 erreur) : reste en (a)", () => {
  assert.equal(after(CONFUCIUS, "a", HARD).form, "a");
});
test("(a) QCM — Je sais (juste du premier coup) : passe en (b)", () => {
  const r = after(CONFUCIUS, "a", GOOD);
  assert.equal(r.form, "b");
  assert.equal(r.change, "up");
});

test("(b) question — Je ne sais pas : retour en (a)", () => {
  const r = after(CONFUCIUS, "b", AGAIN);
  assert.equal(r.form, "a");
  assert.equal(r.change, "down");
});
test("(b) question — Vague idée : reste en (b) et la série repart de zéro", () => {
  const r = after(CONFUCIUS, "b", HARD, { formStreak: 1 });
  assert.equal(r.form, "b");
  assert.equal(r.formStreak, 0);
});
test("(b) question — Je sais une fois : reste en (b)", () => {
  const r = after(CONFUCIUS, "b", GOOD, { formStreak: 0 });
  assert.equal(r.form, "b");
  assert.equal(r.formStreak, 1);
});
test("(b) question — Je sais 2 fois de suite : passe en (c)", () => {
  assert.equal(after(CONFUCIUS, "b", GOOD, { formStreak: 1 }).form, "c");
});
test("(b) question — Parfaitement : passe en (c) tout de suite", () => {
  assert.equal(after(CONFUCIUS, "b", EASY).form, "c");
});

test("(c) texte à trous — Je ne sais pas (2 tentatives ratées) : reste en (c)", () => {
  assert.equal(after(CONFUCIUS, "c", AGAIN).form, "c");
});
test("(c) texte à trous — Vague idée (juste à la 2e tentative) : reste en (c)", () => {
  const r = after(CONFUCIUS, "c", HARD, { formStreak: 1 });
  assert.equal(r.form, "c");
  assert.equal(r.formStreak, 0);
});
test("(c) texte à trous — tout juste à la 1re tentative une fois : reste en (c)", () => {
  assert.equal(after(CONFUCIUS, "c", GOOD, { formStreak: 0 }).form, "c");
});
test("(c) texte à trous — tout juste à la 1re tentative 2 fois de suite : passe en (d)", () => {
  assert.equal(after(CONFUCIUS, "c", GOOD, { formStreak: 1 }).form, "d");
});

test("(d) question poussée — Je ne sais pas : retour en (c)", () => {
  const r = after(CONFUCIUS, "d", AGAIN);
  assert.equal(r.form, "c");
  assert.equal(r.change, "down");
});
test("(d) question poussée — Vague idée, Je sais, Parfaitement : reste en (d)", () => {
  for (const n of [HARD, GOOD, EASY]) assert.equal(after(CONFUCIUS, "d", n).form, "d");
});

test("Texte à trous : la note est donnée par l'appli selon les tentatives", () => {
  assert.equal(F.clozeRating(true, true), GOOD);
  assert.equal(F.clozeRating(false, true), HARD);
  assert.equal(F.clozeRating(false, false), AGAIN);
});

test("« 2 fois de suite » : la série ne compte que les réussites à la même forme", () => {
  // Une réussite notée en (a) ne compte pas pour la série de (b).
  const r = F.afterRating(at(CONFUCIUS, "a", { formStreak: 1 }), "b", GOOD);
  assert.equal(r.form, "b");
  assert.equal(r.formStreak, 1);
});

/* ---------- Formes manquantes (règles par défaut) ---------- */

test("Sans (a) : Je ne sais pas en (b) laisse la fiche en (b)", () => {
  assert.equal(after({ question: "Q", answer: "R", q2: "Q2", a2: "R2" }, "b", AGAIN).form, "b");
});
test("Sans (c) : de (b), on passe directement en (d), et un échec en (d) ramène en (b)", () => {
  assert.equal(after(HOUSE, "b", EASY).form, "d");
  assert.equal(after(HOUSE, "d", AGAIN).form, "b");
});
test("Sans (d) : (c) est la forme la plus haute, ses réussites la laissent en (c)", () => {
  const noD = Object.assign({}, CONFUCIUS, { q2: "", a2: "" });
  assert.equal(after(noD, "c", GOOD, { formStreak: 1 }).form, "c");
});
test("(b) seul : comme aujourd'hui, la fiche reste en (b) quelle que soit la note", () => {
  const simple = { question: "Q", answer: "R" };
  for (const n of [AGAIN, HARD, GOOD, EASY]) assert.equal(after(simple, "b", n, { formStreak: 1 }).form, "b");
});

/* ---------- Fiches actuelles et échéances ---------- */

test("Fiches actuelles (sans forme mémorisée) : QCM tant que le mode QCM n'est pas coupé, comme aujourd'hui", () => {
  const qcm = { question: "Q", answer: "R", wrongs: ["x", "y", "z"] };
  assert.equal(F.currentForm(qcm), "a");
  assert.equal(F.currentForm(Object.assign({}, qcm, { qcmMode: false })), "b");
  assert.equal(F.currentForm({ question: "Q", answer: "R" }), "b");
});
test("Une forme retirée de la fiche retombe sur la forme disponible la plus proche en dessous", () => {
  assert.equal(F.currentForm(Object.assign({}, HOUSE, { form: "c" })), "b");
});
test("Échéance proche (sprint) : la fiche est posée à sa forme la plus haute déjà atteinte", () => {
  assert.equal(F.currentForm(at(CONFUCIUS, "b", { formMax: "d" }), { sprint: true }), "d");
  assert.equal(after(CONFUCIUS, "a", GOOD, { formMax: "a" }).formMax, "b");
});

/* ---------- Montée de forme et calendrier (décision Q24) ---------- */

test("Montée de forme : retour 1 heure plus tard, le dernier délai reste celui d'avant", () => {
  const samedi = new Date(2026, 10, 7, 10, 0, 0, 0);
  const card = { dd: 5 * DAY, lastReviewed: new Date(2026, 10, 2, 10, 0, 0, 0).toISOString() };
  const up = F.scheduleFormUp(card, samedi);
  assert.equal(up.dd, 5 * DAY);
  assert.equal(up.lastReviewed, samedi.toISOString());
  assert.equal(new Date(up.dueDate) - samedi, 60 * 60000);
});
test("Exemple du §4.7 : « Je sais » en (b) après la montée → environ 5 jours (1 h plus tard) ou 6 jours (le lendemain)", () => {
  const S = M.DEFAULT_REVISION_ALGO_SETTINGS;
  const samedi = new Date(2026, 10, 7, 10, 0, 0, 0);
  const card = Object.assign({ dd: 5 * DAY }, F.scheduleFormUp({ dd: 5 * DAY }, samedi));
  const uneHeure = A.computeNext(card, GOOD, S, new Date(samedi.getTime() + 60 * 60000), null, {});
  assert.ok(Math.abs(uneHeure.dd - (5 * DAY + 60)) < 1, `≈ 5 jours : ${uneHeure.dd / DAY}`);
  const lendemain = A.computeNext(card, GOOD, S, new Date(samedi.getTime() + DAY * 60000), null, {});
  assert.ok(Math.abs(lendemain.dd - 6 * DAY) < 1, `6 jours : ${lendemain.dd / DAY}`);
});

/* ---------- Jauge de progression : une case par forme (§4.6, 18 nov. 2026) ---------- */

// Note donnée à la forme posée : nouvelle forme + note retenue pour la jauge.
function rate(card, rating) {
  const posed = F.currentForm(card);
  const step = F.afterRating(card, posed, rating);
  return { ...card, form: step.form, formMax: step.formMax, formStreak: step.formStreak, lastRatedForm: posed, lastRating: rating, formRatings: F.withFormRating(card, posed, rating, card.lastRating) };
}
const B_ONLY = { question: "Capitale de l'Italie ?", answer: "Rome" };
const AB = { question: "Capitale de l'Espagne ?", answer: "Madrid", wrongs: ["Séville", "Barcelone", "Valence"] };

test("jauge : une case par forme — (b) seul 1, (a)+(b) 2, fiche complète 4", () => {
  assert.equal(F.gaugeNotes(B_ONLY).length, 1);
  assert.equal(F.gaugeNotes(AB).length, 2);
  assert.equal(F.gaugeNotes(CONFUCIUS).length, 4);
  assert.deepEqual(F.gaugeCounts([B_ONLY, AB, CONFUCIUS]), [7, 0, 0, 0], "au début, tout est gris : 7 cases sur 7");
});

test("jauge : l'exemple du propriétaire (boîte de 3 fiches, 7 cases)", () => {
  let ab = AB;
  let full = CONFUCIUS;
  const box = () => F.gaugeCounts([B_ONLY, ab, full]);
  ab = rate(ab, GOOD); // QCM juste du premier coup : « Je sais » compte « Parfaitement »
  assert.deepEqual(box(), [6, 0, 0, 1]);
  assert.equal(F.currentForm(ab), "b");
  ab = rate(ab, AGAIN); // en (b), « Je ne sais pas » : la case (a) reste verte
  assert.deepEqual(box(), [6, 0, 0, 1]);
  assert.equal(F.currentForm(ab), "a");
  ab = rate(ab, AGAIN); // en (a), raté deux fois : retour au tout gris
  assert.deepEqual(box(), [7, 0, 0, 0]);
  full = rate(full, GOOD); // fiche complète : QCM juste du premier coup
  full = rate(full, EASY); // (b) « Parfaitement »
  assert.equal(F.currentForm(full), "c");
  full = rate(full, F.clozeRating(false, true)); // (c) juste à la 2e tentative
  assert.deepEqual(box(), [4, 1, 0, 2], "2/7 vert foncé, 1/7 « Vague idée », 4/7 gris");
});

test("jauge : en (a) et (c), « Je sais » compte « Parfaitement », pas en (b) ni en (d)", () => {
  const notes = F.gaugeNotes({ ...CONFUCIUS, formRatings: { a: GOOD, b: GOOD, c: GOOD, d: GOOD } });
  assert.deepEqual(notes, [EASY, GOOD, EASY, GOOD]);
});

test("jauge : boîte entièrement sue = toute vert foncé, quel que soit le type des fiches", () => {
  const sue = [
    { ...B_ONLY, lastRating: EASY },
    { ...AB, form: "b", formRatings: { a: GOOD, b: EASY } },
    { ...CONFUCIUS, form: "d", formRatings: { a: GOOD, b: EASY, c: GOOD, d: EASY } },
  ];
  assert.deepEqual(F.gaugeCounts(sue), [0, 0, 0, 7]);
});

test("jauge : en descendant de (d) à (c), seule la case (d) devient grise", () => {
  let full = { ...CONFUCIUS, form: "d", formMax: "d", formRatings: { a: GOOD, b: EASY, c: GOOD, d: EASY } };
  full = rate(full, AGAIN);
  assert.equal(F.currentForm(full), "c");
  assert.deepEqual(F.gaugeNotes(full), [EASY, EASY, EASY, AGAIN]);
});

test("jauge : fiches notées avant la mise à jour — une forme déjà dépassée compte comme sue", () => {
  // Ancienne fiche QCM passée en question, dernière note « Parfaitement ».
  assert.deepEqual(F.gaugeNotes({ ...AB, qcmMode: false, lastRating: EASY }), [EASY, EASY]);
  // Ancienne fiche encore en QCM, dernière note « Vague idée ».
  assert.deepEqual(F.gaugeNotes({ ...AB, lastRating: HARD }), [HARD, AGAIN]);
  // Fiche (b) seul : sa dernière note, comme avant.
  assert.deepEqual(F.gaugeNotes({ ...B_ONLY, lastRating: GOOD }), [GOOD]);
  // Fiche montée de (a) à (b) en v296 : la case (a) est verte, (b) pas encore notée…
  let v296 = { ...AB, form: "b", formMax: "b", lastRatedForm: "a", lastRating: GOOD };
  assert.deepEqual(F.gaugeNotes(v296), [EASY, AGAIN]);
  // … et le reste après un « Je ne sais pas » en (b).
  v296 = rate(v296, AGAIN);
  assert.deepEqual(F.gaugeNotes(v296), [EASY, AGAIN]);
});

test("jauge : des formes ajoutées à une fiche déjà sue partent en gris (décision du 18 nov. 2026)", () => {
  const sue = { ...AB, form: "b", formRatings: { a: GOOD, b: EASY } };
  const enrichie = { ...sue, q2: "Quelle est la capitale de l'Espagne, au centre du pays ?", a2: "Madrid" };
  assert.deepEqual(F.gaugeNotes(enrichie), [EASY, EASY, AGAIN]);
});

/* ---------- Texte à trous : découpage du texte (écran de l'étape 3) ---------- */

test("texte à trous : le texte est coupé autour de chaque trou « ___ »", () => {
  const parts = F.clozeSegments(CONFUCIUS.cloze.text);
  assert.equal(parts.length, CONFUCIUS.cloze.blanks.length + 1, "un morceau de plus que de trous");
  assert.deepEqual(parts, ["Le penseur chinois ", " enseigne le respect ", ", de ", " et des ", "."]);
  assert.deepEqual(F.clozeSegments("___ commence"), ["", " commence"], "un trou en tout début de phrase");
});

/* ---------- Saisie d'un texte à trous : la phrase à crochets (v299) ---------- */

test("saisie : les mots entre crochets deviennent les trous, avec leurs 3 réponses fausses", () => {
  const wrongs = CONFUCIUS.cloze.blanks.map((b) => b.wrongs);
  const res = F.clozeFromBrackets("Le penseur chinois [Confucius] enseigne le respect [des ancêtres], de [l'ordre] et des [devoirs].", wrongs);
  assert.deepEqual(res.cloze, CONFUCIUS.cloze);
  assert.ok(F.validCloze(res.cloze));
});

test("saisie : une fiche existante se réécrit avec ses crochets (aller-retour sans perte)", () => {
  const text = F.clozeToBrackets(CONFUCIUS.cloze);
  assert.equal(text, "Le penseur chinois [Confucius] enseigne le respect [des ancêtres], de [l'ordre] et des [devoirs].");
  assert.deepEqual(F.bracketAnswers(text), ["Confucius", "des ancêtres", "l'ordre", "devoirs"]);
  assert.deepEqual(F.clozeFromBrackets(text, CONFUCIUS.cloze.blanks.map((b) => b.wrongs)).cloze, CONFUCIUS.cloze);
});

test("saisie : phrase vide = pas de texte à trous ; erreurs expliquées à l'auteur", () => {
  assert.deepEqual(F.clozeFromBrackets("  ", []), { cloze: null });
  assert.match(F.clozeFromBrackets("Pas de crochet ici.", []).error, /entre crochets/);
  assert.match(F.clozeFromBrackets("Un [crochet mal fermé.", []).error, /mal placé/);
  assert.match(F.clozeFromBrackets("Un [] vide.", []).error, /vide/);
  assert.match(F.clozeFromBrackets("La capitale est [Paris].", [["Lyon", "Nice"]]).error, /3 réponses fausses pour le trou 1/);
  assert.match(F.clozeFromBrackets("La capitale est [Paris].", [["Lyon", "paris", "Nice"]]).error, /différentes/);
});

test("jauge : une forme ajoutée en dessous de la forme actuelle compte comme sue (v300)", () => {
  // Fiche déjà en question poussée (d), notée avant l'arrivée de son texte
  // à trous : elle n'y redescendra pas tant qu'elle est sue.
  const enD = { ...CONFUCIUS, form: "d", formMax: "d", formRatings: { a: GOOD, b: EASY, d: EASY } };
  assert.deepEqual(F.gaugeNotes(enD), [EASY, EASY, EASY, EASY]);
  // Après un « Je ne sais pas » en (d), elle redescend en (c) : sa case (c)
  // n'est plus dépassée et compte en gris tant qu'elle n'est pas réussie.
  const redescendue = rate(enD, AGAIN);
  assert.equal(F.currentForm(redescendue), "c");
  assert.deepEqual(F.gaugeNotes(redescendue), [EASY, EASY, AGAIN, AGAIN]);
});

/* ---------- Texte à trous en une ligne, et saisie des réponses fausses par ligne (v301) ---------- */

test("texte à trous en une ligne : phrase à crochets puis réponses fausses de chaque trou", () => {
  const two = { text: "La capitale de ___ est ___.", blanks: [{ answer: "l'Islande", wrongs: ["la Norvège", "la Suède", "la Finlande"] }, { answer: "Reykjavik", wrongs: ["Oslo", "Stockholm", "Helsinki"] }] };
  assert.equal(F.clozeSummary(two), "La capitale de [l'Islande] est [Reykjavik]. — réponses fausses : trou 1 : la Norvège · la Suède · la Finlande ; trou 2 : Oslo · Stockholm · Helsinki");
  assert.equal(F.clozeSummary(null), "");
});

test("réponses fausses des trous : une ligne par trou, séparées par « ; » (aller-retour)", () => {
  const text = F.blankWrongsText(CONFUCIUS.cloze);
  assert.equal(text.split("\n").length, 4);
  assert.deepEqual(F.parseBlankWrongs(text), CONFUCIUS.cloze.blanks.map((b) => b.wrongs));
  assert.deepEqual(F.parseBlankWrongs("a ; b ; c\n\n d;e;f "), [["a", "b", "c"], ["d", "e", "f"]]);
});

/* ---------- v303 : forme (cbis), essai du 21 nov. 2026 ----------
   Le texte à trous sans propositions, entre (c) et (d), réglé dans Darwin
   Admin. Règles de passage : celles de (b). */
function withCbis(fn) {
  F.setCbisEnabled(true);
  try {
    fn();
  } finally {
    F.setCbisEnabled(false);
  }
}
test("(cbis) : éteinte par défaut, la fiche de Confucius passe de (c) à (d) comme avant", () => {
  assert.equal(F.forms(CONFUCIUS).cbis, false);
  assert.equal(after(CONFUCIUS, "c", GOOD, { formStreak: 1 }).form, "d");
});
test("(cbis) : allumée, toute fiche avec un texte à trous l'a ; sans texte à trous, non", () => {
  withCbis(() => {
    assert.equal(F.forms(CONFUCIUS).cbis, true);
    assert.equal(F.forms(HOUSE).cbis, false);
  });
});
test("(cbis) : (c) réussie 2 fois de suite passe en (cbis)", () => {
  withCbis(() => assert.equal(after(CONFUCIUS, "c", GOOD, { formStreak: 1 }).form, "cbis"));
});
test("(cbis) : Parfaitement passe en (d) ; Je sais 2 fois de suite aussi, une seule fois non", () => {
  withCbis(() => {
    assert.equal(after(CONFUCIUS, "cbis", EASY).form, "d");
    assert.equal(after(CONFUCIUS, "cbis", GOOD).form, "cbis");
    assert.equal(after(CONFUCIUS, "cbis", GOOD, { formStreak: 1 }).form, "d");
  });
});
test("(cbis) : Je ne sais pas ramène en (c) ; Vague idée reste en (cbis)", () => {
  withCbis(() => {
    assert.equal(after(CONFUCIUS, "cbis", AGAIN).form, "c");
    assert.equal(after(CONFUCIUS, "cbis", HARD).form, "cbis");
  });
});
test("(cbis) : Je ne sais pas en (d) ramène en (cbis)", () => {
  withCbis(() => assert.equal(after(CONFUCIUS, "d", AGAIN).form, "cbis"));
});
test("(cbis) : sans (d), c'est la forme la plus haute", () => {
  const sansD = Object.assign({}, CONFUCIUS, { q2: "", a2: "" });
  withCbis(() => assert.equal(after(sansD, "cbis", EASY).form, "cbis"));
});
test("(cbis) : une fiche restée en (cbis) retombe en (c) si l'essai est éteint", () => {
  assert.equal(F.currentForm(at(CONFUCIUS, "cbis")), "c");
});
test("jauge (cbis) : fiche complète = 5 cases ; Je sais n'y compte pas Parfaitement", () => {
  withCbis(() => {
    const card = at(CONFUCIUS, "cbis", { formRatings: { a: 2, b: 3, c: 2, cbis: 2 } });
    assert.deepEqual(F.gaugeNotes(card), [3, 3, 3, 2, 0]);
  });
});
test("jauge (cbis) : une fiche déjà en (d) compte sa case (cbis) comme sue", () => {
  withCbis(() => {
    const card = at(CONFUCIUS, "d", { formRatings: { a: 2, b: 3, c: 2, d: 3 } });
    assert.deepEqual(F.gaugeNotes(card), [3, 3, 3, 3, 3]);
  });
});
