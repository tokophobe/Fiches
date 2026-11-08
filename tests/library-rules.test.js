/* Tests des règles de la Librairie (js/library-rules.js ;
   docs/SPECIFICATION.md, §7.1) et du droit de publier (js/profile-rules.js,
   §3.2). */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const L = require(path.join(__dirname, "..", "js", "library-rules.js"));
const P = require(path.join(__dirname, "..", "js", "profile-rules.js"));

const JOUR = 86400000;
const maintenant = Date.parse("2026-11-08T12:00:00Z");

test("Ordre au hasard : une boîte du jour pèse 5, une boîte ancienne environ 1", () => {
  assert.equal(L.recencyWeight(maintenant, maintenant), 5);
  assert.ok(L.recencyWeight(maintenant - 365 * JOUR, maintenant) < 1.001);
  assert.ok(L.recencyWeight(maintenant - 7 * JOUR, maintenant) > L.recencyWeight(maintenant - 30 * JOUR, maintenant));
});

test("Ordre au hasard : une boîte sans date compte comme ancienne", () => {
  assert.ok(L.recencyWeight(NaN, maintenant) < 1.001);
});

test("Ordre au hasard : à tirage égal, la boîte la plus récente passe devant", () => {
  const u = 0.5;
  assert.ok(L.shuffleKey(L.recencyWeight(maintenant, maintenant), u) < L.shuffleKey(L.recencyWeight(maintenant - 60 * JOUR, maintenant), u));
});

test("Vidéos de cours : affichées par défaut quand rien n'est retenu", () => {
  assert.deepEqual(L.videoPrefOnVisit(null, maintenant), { showVideos: true, pref: null });
});

test("Vidéos de cours : masquer est retenu pendant les 10 visites suivantes", () => {
  let pref = { since: maintenant, visits: 0 };
  for (let i = 1; i <= 10; i++) {
    const r = L.videoPrefOnVisit(pref, maintenant + i * 1000);
    assert.equal(r.showVideos, false, `visite ${i}`);
    pref = r.pref;
  }
  const r11 = L.videoPrefOnVisit(pref, maintenant + 11000);
  assert.deepEqual(r11, { showVideos: true, pref: null });
});

test("Vidéos de cours : masquer est oublié au bout de 5 jours, même avec peu de visites", () => {
  const pref = { since: maintenant, visits: 1 };
  assert.equal(L.videoPrefOnVisit(pref, maintenant + 5 * JOUR - 1).showVideos, false);
  assert.deepEqual(L.videoPrefOnVisit(pref, maintenant + 5 * JOUR), { showVideos: true, pref: null });
});

test("Publication dans la Librairie : réservée au profil enseignant", () => {
  assert.equal(P.canPublishToLibrary("teacher"), true);
  assert.equal(P.canPublishToLibrary("student"), false);
  assert.equal(P.canPublishToLibrary(undefined), false);
});
