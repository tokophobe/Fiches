/* Tests de la synchronisation du défi du jour entre appareils
   (js/defi.js ; docs/SPECIFICATION.md, §7.5) : on garde la partie la plus
   avancée, et la série de jours la plus récente. */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

globalThis.window = globalThis.window || {};
require(path.join(__dirname, "..", "js", "defi.js"));
const D = globalThis.window.DarwinDefi;

const fresh = { v: 1, cur: 0, lives: 3, wrong: [], res: [], done: false };
const enCours = { v: 1, cur: 3, lives: 2, wrong: [1], res: ["ok", "late", "ok"], done: false };
const finie = { v: 1, cur: 9, lives: 1, wrong: [], res: ["ok", "ok", "fail", "ok", "ok", "late", "ok", "ok", "ok", "ok"], done: true };

test("Défi : une partie terminée sur un appareil l'emporte sur une partie à jouer", () => {
  assert.equal(D.moreAdvanced(fresh, finie), finie);
  assert.equal(D.moreAdvanced(finie, fresh), finie);
  assert.equal(D.moreAdvanced(null, finie), finie);
});

test("Défi : une partie terminée l'emporte sur une partie en cours", () => {
  assert.equal(D.moreAdvanced(enCours, finie), finie);
  assert.equal(D.moreAdvanced(finie, enCours), finie);
});

test("Défi : entre deux parties en cours, on garde celle qui a le plus de réponses", () => {
  assert.equal(D.moreAdvanced(fresh, enCours), enCours);
  assert.equal(D.moreAdvanced(enCours, fresh), enCours);
});

test("Défi : à avancement égal, on garde la partie de l'appareil", () => {
  const copie = JSON.parse(JSON.stringify(enCours));
  assert.equal(D.moreAdvanced(enCours, copie), enCours);
});

test("Défi : la série de jours la plus récente l'emporte, puis la plus longue", () => {
  const a = { last: "2026-11-04", count: 5 };
  const b = { last: "2026-11-05", count: 1 };
  assert.equal(D.newerStreak(a, b), b);
  assert.equal(D.newerStreak(b, a), b);
  assert.equal(D.newerStreak({ last: "2026-11-05", count: 2 }, { last: "2026-11-05", count: 6 }).count, 6);
  assert.equal(D.newerStreak(null, a), a);
  assert.equal(D.newerStreak(a, null), a);
});
