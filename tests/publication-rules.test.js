/* Tests des règles de la publication avec relecture
   (js/publication-rules.js ; docs/SPECIFICATION.md, §7.2). */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const R = require(path.join(__dirname, "..", "js", "publication-rules.js"));

test("Un élève ne peut jamais proposer une boîte, un enseignant oui", () => {
  assert.equal(R.canPropose("student"), false);
  assert.equal(R.canPropose(null), false);
  assert.equal(R.canPropose("teacher"), true);
});

test("Seul darwin publie, demande une modification ou refuse une proposition", () => {
  for (const to of ["published", "changes_requested", "rejected"]) {
    assert.equal(R.canTransition("pending", to, "darwin"), true, to);
    assert.equal(R.canTransition("pending", to, "teacher"), false, to);
  }
});

test("Une nouvelle version de la boîte remplace la proposition encore ouverte", () => {
  assert.equal(R.canTransition("pending", "superseded", "system"), true);
  assert.equal(R.canTransition("changes_requested", "superseded", "system"), true);
  assert.equal(R.isOpen("pending"), true);
  assert.equal(R.isOpen("changes_requested"), true);
  assert.equal(R.isOpen("published"), false);
});

test("Seul darwin retire une boîte publiée ; refus et retrait sont définitifs", () => {
  assert.equal(R.canTransition("published", "withdrawn", "darwin"), true);
  assert.equal(R.canTransition("published", "withdrawn", "teacher"), false);
  assert.deepEqual(Object.keys(R.TRANSITIONS.rejected), []);
  assert.deepEqual(Object.keys(R.TRANSITIONS.withdrawn), []);
});

test("L'accord se donne une seule fois par boîte, avec ses deux cases (licence et abonnement)", () => {
  const accords = [
    { sourceSubjectId: "boite-1", commercialConsent: true },
    { sourceSubjectId: "boite-3", commercialConsent: false },
  ];
  assert.equal(R.needsLicenseAcceptance(accords, "boite-1"), false);
  assert.equal(R.needsLicenseAcceptance(accords, "boite-2"), true);
  assert.equal(R.needsLicenseAcceptance(accords, "boite-3"), true, "accord sans l'autorisation abonnement");
  assert.equal(R.needsLicenseAcceptance([], "boite-1"), true);
  assert.equal(R.needsLicenseAcceptance(accords, null), true);
});

test("Mention de l'auteur : rien par défaut, nom ou pseudonyme seulement si demandé", () => {
  assert.equal(R.authorMention("anonymous", "Jean Dupont"), "");
  assert.equal(R.authorMention(undefined, "x"), "");
  assert.equal(R.authorMention("name", " Jean Dupont "), "Jean Dupont");
  assert.equal(R.authorMention("pseudonym", "Prof Sciences"), "Prof Sciences");
  assert.equal(R.authorMention("pseudonym", "x".repeat(100)).length, 80);
});

test("Discrétion : l'enseignant n'est prévenu que si darwin a besoin de lui ou a changé son contenu", () => {
  assert.equal(R.teacherNotified({ type: "submitted" }), false);
  assert.equal(R.teacherNotified({ type: "published", cardsChanged: false }), false);
  assert.equal(R.teacherNotified({ type: "published", cardsChanged: true }), true);
  assert.equal(R.teacherNotified({ type: "changes_requested" }), true);
  assert.equal(R.teacherNotified({ type: "rejected" }), true);
  assert.equal(R.teacherNotified({ type: "withdrawn" }), true);
  assert.equal(R.teacherNotified({ type: "darwin_message" }), true);
});

test("Une boîte modifiée après envoi repart d'elle-même chez darwin, sauf après un refus ou un retrait", () => {
  const avant = R.cardsSignature([{ id: "a", question: "Q", answer: "R" }]);
  const apres = R.cardsSignature([{ id: "a", question: "Q", answer: "R corrigée" }]);
  assert.equal(R.shouldResubmit("published", avant, apres), true);
  assert.equal(R.shouldResubmit("pending", avant, apres), true);
  assert.equal(R.shouldResubmit("published", avant, avant), false);
  assert.equal(R.shouldResubmit("rejected", avant, apres), false);
  assert.equal(R.shouldResubmit("withdrawn", avant, apres), false);
  assert.equal(R.shouldResubmit(null, avant, apres), false);
});

test("Avant / après : fiches modifiées, ajoutées et retirées par darwin", () => {
  const avant = [{ id: "a", question: "Q1", answer: "R1" }, { id: "b", question: "Q2", answer: "R2" }];
  const apres = [{ id: "a", question: "Q1", answer: "R1 corrigée" }, { id: "c", question: "Q3", answer: "R3" }];
  const d = R.cardsDiff(avant, apres);
  assert.equal(d.changed.length, 1);
  assert.equal(d.changed[0].after.answer, "R1 corrigée");
  assert.deepEqual(d.added.map((c) => c.id), ["c"]);
  assert.deepEqual(d.removed.map((c) => c.id), ["b"]);
  assert.equal(d.any, true);
  assert.equal(R.cardsDiff(avant, avant).any, false);
  const qcm = [{ id: "a", question: "Q1", answer: "R1", wrongs: ["x", "y", "z"] }];
  assert.equal(R.cardsDiff(qcm, [{ ...qcm[0], wrongs: ["x", "y", "w"] }]).changed.length, 1);
});

test("Librairie à l'ouverture : avec « seulement les boîtes darwin », les boîtes d'enseignants sont cachées", () => {
  assert.equal(R.visibleInLibrary({ origin: "darwin" }, true), true);
  assert.equal(R.visibleInLibrary({ origin: "teacher" }, true), false);
  assert.equal(R.visibleInLibrary({ origin: "teacher" }, false), true);
});

test("Suivi des modifications : mots supprimés et ajoutés repérés, le reste inchangé", () => {
  const d = R.wordDiff("La capitale est Sydney.", "La capitale est Canberra.");
  assert.deepEqual(d.map((x) => x.type), ["same", "del", "ins"]);
  assert.equal(d[0].text, "La capitale est ");
  assert.equal(d[1].text, "Sydney.");
  assert.equal(d[2].text, "Canberra.");
  assert.deepEqual(R.wordDiff("même texte", "même texte"), [{ type: "same", text: "même texte" }]);
  assert.deepEqual(R.wordDiff("", "ajout"), [{ type: "ins", text: "ajout" }]);
  assert.deepEqual(R.wordDiff("retrait", ""), [{ type: "del", text: "retrait" }]);
  // On retrouve bien les deux textes à partir des morceaux.
  const d2 = R.wordDiff("un deux trois quatre", "un trois cinq quatre");
  assert.equal(d2.filter((x) => x.type !== "ins").map((x) => x.text).join(""), "un deux trois quatre");
  assert.equal(d2.filter((x) => x.type !== "del").map((x) => x.text).join(""), "un trois cinq quatre");
});

test("Suivi des modifications : un passage réécrit donne un seul bloc barré puis un seul bloc ajouté", () => {
  const d = R.wordDiff("Sydney, la plus grande ville.", "Canberra, et non Sydney.");
  assert.deepEqual(d.map((x) => x.type).filter((t) => t !== "same").join(","), "del,ins");
  assert.equal(d.filter((x) => x.type !== "ins").map((x) => x.text).join(""), "Sydney, la plus grande ville.");
  assert.equal(d.filter((x) => x.type !== "del").map((x) => x.text).join(""), "Canberra, et non Sydney.");
});
