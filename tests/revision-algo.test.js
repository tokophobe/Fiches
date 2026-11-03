/* Tests automatiques de l'algorithme de révision (js/revision-algo.js).
   Chaque test vérifie une règle de docs/SPECIFICATION.md, §4, avec les
   réglages par défaut (js/settings-model.js).
   Lancer : node --test tests/      (voir tests/README.md) */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

globalThis.window = globalThis.window || {};
require(path.join(__dirname, "..", "js", "settings-model.js"));
const M = globalThis.window.FichesSettingsModel;
const A = require(path.join(__dirname, "..", "js", "revision-algo.js"));

const S = M.DEFAULT_REVISION_ALGO_SETTINGS;
const OPTS = { eventHour: M.SPRINT_EVENT_HOUR, eventDayDelayMin: M.SPRINT_EVENT_DAY_DELAY_MIN };
const MIN = 1, HOUR = 60, DAY = 1440;
// « Maintenant » fixe : 3 novembre 2026, 10 h (heure locale).
const NOW = new Date(2026, 10, 3, 10, 0, 0, 0);
const ago = (minutes) => new Date(NOW.getTime() - minutes * 60000).toISOString();
const inDays = (n) => {
  const d = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const NEW_CARD = { id: "c", dd: 0 };
const AGAIN = 0, HARD = 1, GOOD = 2, EASY = 3;
const fond = (card, idx) => A.computeNext(card, idx, S, NOW, null, OPTS);

/* ---------- Réglages par défaut (§4.2) ---------- */

test("Réglages par défaut : planchers 3 j / 1 j / 3 j / 5 j, plafonds 3 j / 1 j / 30 j / 120 j", () => {
  assert.deepEqual(S.plancherMin, [3 * DAY, 1 * DAY, 3 * DAY, 5 * DAY]);
  assert.deepEqual(S.plafondMin, [3 * DAY, 1 * DAY, 30 * DAY, 120 * DAY]);
  assert.deepEqual(S.coefFond, [0, 0, 2, 3]);
  assert.deepEqual(S.coefSprint, [1.03, 1.05, 2, 3]);
  assert.equal(M.SESSION_MIN_GAP, 10);
  assert.equal(M.SPRINT_EVENT_HOUR, 8);
  assert.equal(M.SPRINT_EVENT_DAY_DELAY_MIN, 30);
});

/* ---------- Mode fond (§4.2) ---------- */

test("Fond : une fiche neuve revient dans 3 j / 1 j / 3 j / 5 j selon la note", () => {
  assert.equal(fond(NEW_CARD, AGAIN).dd, 3 * DAY);
  assert.equal(fond(NEW_CARD, HARD).dd, 1 * DAY);
  assert.equal(fond(NEW_CARD, GOOD).dd, 3 * DAY);
  assert.equal(fond(NEW_CARD, EASY).dd, 5 * DAY);
});

test("Fond : « Je ne sais pas » donne toujours 3 jours, même après un long délai (question Q1)", () => {
  const card = { dd: 60 * DAY, lastReviewed: ago(60 * DAY) };
  assert.equal(fond(card, AGAIN).dd, 3 * DAY);
});

test("Fond : « Vague idée » donne toujours 1 jour", () => {
  const card = { dd: 20 * DAY, lastReviewed: ago(20 * DAY) };
  assert.equal(fond(card, HARD).dd, 1 * DAY);
});

test("Fond : « Je sais » à l'heure prévue → (DD − TE) + TE × 2 (3 j → 6 j)", () => {
  const card = { dd: 3 * DAY, lastReviewed: ago(3 * DAY) };
  assert.equal(fond(card, GOOD).dd, 6 * DAY);
});

test("Fond : « Parfaitement » à l'heure prévue → (DD − TE) + TE × 3 (5 j → 15 j)", () => {
  const card = { dd: 5 * DAY, lastReviewed: ago(5 * DAY) };
  assert.equal(fond(card, EASY).dd, 15 * DAY);
});

test("Fond : révisée en avance, le délai grandit moins (6 j revue après 1 j → 7 j)", () => {
  const card = { dd: 6 * DAY, lastReviewed: ago(1 * DAY) };
  assert.equal(fond(card, GOOD).dd, 6 * DAY - DAY + 2 * DAY);
});

test("Fond : plafonds — 30 j pour « Je sais », 120 j pour « Parfaitement »", () => {
  const card = { dd: 100 * DAY, lastReviewed: ago(100 * DAY) };
  assert.equal(fond(card, GOOD).dd, 30 * DAY);
  assert.equal(fond(card, EASY).dd, 120 * DAY);
});

test("Fond : date de retour = maintenant + délai, dernière note et nombre de jours enregistrés", () => {
  const out = fond(NEW_CARD, EASY);
  assert.equal(out.dueDate, new Date(NOW.getTime() + 5 * DAY * 60000).toISOString());
  assert.equal(out.lastRating, EASY);
  assert.equal(out.interval, 5);
  assert.equal(out.mode, "fond");
  assert.equal(out.inSprint, undefined);
});

/* ---------- Mode sprint (§4.3) ---------- */

test("Sprint : délai = D − D / coefficient quand c'est plus court que le fond", () => {
  // Échéance dans 10 jours, à 8 h : D = 10 j − 2 h.
  const ev = { next: inDays(10), last: inDays(10) };
  const D = 10 * DAY - 2 * HOUR;
  const card = { dd: 14 * DAY, lastReviewed: ago(14 * DAY) }; // fond « Parfaitement » = 42 j → 120 j max
  const out = A.computeNext(card, EASY, S, NOW, ev, OPTS);
  assert.equal(out.mode, "sprint");
  assert.equal(out.dd, Math.round((D - D / 3) * 100) / 100);
});

test("Sprint : « Je ne sais pas » revient très vite (D − D / 1,03)", () => {
  const ev = { next: inDays(10), last: inDays(10) };
  const D = 10 * DAY - 2 * HOUR;
  const out = A.computeNext(NEW_CARD, AGAIN, S, NOW, ev, OPTS);
  assert.equal(out.dd, Math.round((D - D / 1.03) * 100) / 100);
  assert.ok(out.dd < 8 * HOUR);
});

test("Sprint : on garde le délai du fond s'il est plus court", () => {
  const ev = { next: inDays(10), last: inDays(10) };
  // Fiche neuve, « Je sais » : fond = 3 j ; sprint = D / 2 ≈ 5 j → 3 j.
  assert.equal(A.computeNext(NEW_CARD, GOOD, S, NOW, ev, OPTS).dd, 3 * DAY);
});

test("Sprint : le jour de l'échéance (après 8 h), la fiche revient dans 30 minutes", () => {
  const ev = { next: inDays(0), last: inDays(0) };
  const card = { dd: 10 * DAY, lastReviewed: ago(10 * DAY) };
  assert.equal(A.computeNext(card, EASY, S, NOW, ev, OPTS).dd, 30 * MIN);
});

test("Sprint : un coefficient ≤ 1 revient au délai du fond", () => {
  const settings = { ...S, coefSprint: [1, 1, 1, 1] };
  const ev = { next: inDays(10), last: inDays(10) };
  assert.equal(A.computeNext(NEW_CARD, EASY, settings, NOW, ev, OPTS).dd, 5 * DAY);
});

test("Sprint : jamais moins d'une minute", () => {
  const settings = { ...S, plancherMin: [0, 0, 0, 0], plafondMin: [0, 0, 0, 0] };
  assert.equal(A.computeNext(NEW_CARD, GOOD, settings, NOW, null, OPTS).dd, 1);
});

test("Sprint : en notant une fiche pas encore en sprint, on mémorise son délai d'avant", () => {
  const ev = { next: inDays(5), last: inDays(12) };
  const out = A.computeNext({ dd: 6 * DAY, lastReviewed: ago(6 * DAY) }, GOOD, S, NOW, ev, OPTS);
  assert.equal(out.inSprint, true);
  assert.equal(out.ddBeforeSprint, 6 * DAY);
  assert.equal(out.sprintNext, inDays(5));
  assert.equal(out.sprintUntil, inDays(12));
});

/* ---------- Entrée et sortie de sprint avec l'agenda (§4.3) ---------- */

test("Agenda : une échéance apparaît → la fiche passe en sprint, à revoir tout de suite", () => {
  const card = { dd: 10 * DAY, dueDate: new Date(NOW.getTime() + 5 * DAY * 60000).toISOString() };
  const upd = A.sprintUpdate(card, { next: inDays(7), last: inDays(7) }, S, NOW, GOOD);
  assert.equal(upd.inSprint, true);
  assert.equal(upd.ddBeforeSprint, 10 * DAY);
  assert.equal(upd.dueDate, NOW.toISOString());
});

test("Agenda : une fiche déjà en retard garde sa date (elle est déjà à revoir)", () => {
  const late = ago(DAY);
  const upd = A.sprintUpdate({ dd: DAY, dueDate: late }, { next: inDays(7), last: inDays(7) }, S, NOW, GOOD);
  assert.equal(upd.dueDate, undefined);
});

test("Agenda : une nouvelle échéance plus proche remet la fiche à revoir tout de suite", () => {
  const card = { inSprint: true, sprintNext: inDays(10), sprintUntil: inDays(10), dueDate: new Date(NOW.getTime() + DAY * 60000).toISOString() };
  const upd = A.sprintUpdate(card, { next: inDays(3), last: inDays(10) }, S, NOW, GOOD);
  assert.equal(upd.sprintNext, inDays(3));
  assert.equal(upd.dueDate, NOW.toISOString());
});

test("Agenda : rien ne change si les échéances sont les mêmes", () => {
  const card = { inSprint: true, sprintNext: inDays(3), sprintUntil: inDays(3) };
  assert.equal(A.sprintUpdate(card, { next: inDays(3), last: inDays(3) }, S, NOW, GOOD), null);
  assert.equal(A.sprintUpdate({ dd: DAY }, null, S, NOW, GOOD), null);
});

test("Agenda : fin du sprint → retour au fond, lendemain de l'échéance + délai d'avant", () => {
  const card = { inSprint: true, ddBeforeSprint: 6 * DAY, sprintNext: inDays(-4), sprintUntil: inDays(-4) };
  const upd = A.sprintUpdate(card, null, S, NOW, GOOD);
  assert.equal(upd.inSprint, false);
  assert.equal(upd.dd, 6 * DAY);
  const endOfEvent = A.dayAfter(inDays(-4));
  assert.equal(upd.dueDate, new Date(endOfEvent.getTime() + 6 * DAY * 60000).toISOString());
});

test("Agenda : fin du sprint sans délai d'avant → plancher de la dernière note", () => {
  const card = { inSprint: true, ddBeforeSprint: null, sprintUntil: inDays(-1) };
  assert.equal(A.sprintUpdate(card, null, S, NOW, EASY).dd, 5 * DAY);
  assert.equal(A.sprintUpdate(card, null, S, NOW, HARD).dd, 1 * DAY);
});

/* ---------- Séance de révision (§4.4) ---------- */

const session = (over) => ({ seen: new Map(), low: new Set(), recent: [], ...(over || {}) });
const card = (id, dueInMin) => ({ id, dueDate: new Date(NOW.getTime() + dueInMin * 60000).toISOString() });

test("Séance : les fiches dues passent d'abord, la plus en retard en premier", () => {
  const pool = [card("a", -10), card("b", -500), card("c", 600)];
  assert.equal(A.pickNextSessionCard(pool, session(), NOW, 10).id, "b");
});

test("Séance : puis les fiches ratées dans la séance, pas encore revues deux fois", () => {
  const pool = [card("a", 600), card("b", 900)];
  const s = session({ low: new Set(["b"]), seen: new Map([["b", 1]]) });
  assert.equal(A.pickNextSessionCard(pool, s, NOW, 10).id, "b");
  const s2 = session({ low: new Set(["b"]), seen: new Map([["b", 2]]) });
  assert.equal(A.pickNextSessionCard(pool, s2, NOW, 10).id, "a");
});

test("Séance : puis les autres, par date prévue", () => {
  const pool = [card("a", 900), card("b", 300)];
  assert.equal(A.pickNextSessionCard(pool, session(), NOW, 10).id, "b");
});

test("Séance : au moins 10 autres fiches entre deux passages d'une même fiche", () => {
  const pool = Array.from({ length: 12 }, (_, i) => card(`f${i}`, i - 100)); // toutes dues, f0 la plus en retard
  const recent = ["f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9"];
  assert.equal(A.pickNextSessionCard(pool, session({ recent }), NOW, 10).id, "f10");
});

test("Séance : avec peu de fiches, l'écart se réduit (toutes les autres)", () => {
  const pool = [card("a", -100), card("b", -50), card("c", 10)];
  // a et b viennent de passer : seule c reste possible.
  assert.equal(A.pickNextSessionCard(pool, session({ recent: ["a", "b"] }), NOW, 10).id, "c");
  // Une seule fiche : elle repasse.
  assert.equal(A.pickNextSessionCard([card("a", 5)], session({ recent: ["a"] }), NOW, 10).id, "a");
});

test("Séance : rien à proposer quand il n'y a pas de fiche", () => {
  assert.equal(A.pickNextSessionCard([], session(), NOW, 10), null);
});
