/* Tests des règles « profil élève / profil enseignant » pour l'agenda et
   les révisions (js/profile-rules.js ; docs/SPECIFICATION.md, §3.2 et
   §6.4). */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const R = require(path.join(__dirname, "..", "js", "profile-rules.js"));

const perso = { id: "e1", title: "Contrôle", date: "2026-12-01" };
const persoProf = { ...perso, id: "e2", profile: "teacher" };
const donneeALaClasse = { ...perso, id: "e3", classShare: { classId: "c1", className: "4e B" } };
const recueDeLaClasse = { ...perso, id: "e4", sharedEventId: "r1", sharedClassId: "c9" };

test("Agenda : un évènement personnel créé avant la v256 est dans le profil élève", () => {
  assert.equal(R.eventVisibleInProfile(perso, "student"), true);
  assert.equal(R.eventVisibleInProfile(perso, "teacher"), false);
});

test("Agenda : un évènement personnel reste dans le profil où il a été créé", () => {
  assert.equal(R.eventVisibleInProfile(persoProf, "teacher"), true);
  assert.equal(R.eventVisibleInProfile(persoProf, "student"), false);
  assert.equal(R.eventVisibleInProfile({ ...perso, profile: "student" }, "student"), true);
});

test("Agenda : une échéance donnée à sa classe est dans le profil enseignant", () => {
  assert.equal(R.eventVisibleInProfile(donneeALaClasse, "teacher"), true);
  assert.equal(R.eventVisibleInProfile(donneeALaClasse, "student"), false);
});

test("Agenda : une échéance reçue d'une classe suivie est dans le profil élève", () => {
  assert.equal(R.eventVisibleInProfile(recueDeLaClasse, "student"), true);
  assert.equal(R.eventVisibleInProfile(recueDeLaClasse, "teacher"), false);
});

test("Révisions : seuls les évènements du profil élève déclenchent le sprint", () => {
  assert.equal(R.eventCountsForRevisions(perso), true);
  assert.equal(R.eventCountsForRevisions(recueDeLaClasse), true);
  assert.equal(R.eventCountsForRevisions(persoProf), false);
  assert.equal(R.eventCountsForRevisions(donneeALaClasse), false);
});
