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
  assert.deepEqual(F.forms(CONFUCIUS), { a: true, b: true, c: true, d: true });
  assert.deepEqual(F.forms(HOUSE), { a: true, b: true, c: false, d: true });
});

test("Formes : toujours au moins (b) ; une fiche simple n'a que (b)", () => {
  assert.deepEqual(F.forms({ question: "Q", answer: "R" }), { a: false, b: true, c: false, d: false });
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
