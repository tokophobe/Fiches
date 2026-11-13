/* Tests du détecteur de questions QCM qui n'ont pas de sens sans leurs
   propositions (docs/SPECIFICATION.md, §5.7). */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

globalThis.window = globalThis.window || {};
require(path.join(__dirname, "..", "js", "settings-model.js"));
const detect = globalThis.window.FichesSettingsModel.qcmQuestionNeedsChoices;

test("QCM : repère les questions qui renvoient à des propositions absentes", () => {
  [
    "Laquelle de ces villes est la capitale de l'Australie ?",
    "Laquelle de ces 4 propositions est correcte ?",
    "Parmi les propositions suivantes, laquelle est vraie ?",
    "Quelle proposition est correcte ?",
    "Laquelle est la bonne ?",
    "Quelle est la bonne réponse parmi les suivantes ?",
    "Quel est l'intrus ?",
    "Lequel de ces nombres est premier ?",
    // v289 : formulations qui supposent aussi une liste absente
    "Laquelle n'est pas une planète ?",
    "Lequel est un mammifère ?",
    "Lesquels sont des multiples de 3 ?",
    "Lequel des deux est le plus grand ?",
    "Quel animal, parmi ceux-ci, vole ?",
    "Quelle phrase est correcte ?",
    "Quel mot est mal écrit ?",
    "Quelle forme verbale convient ?",
    "Quelle est la bonne orthographe ?",
    "Quel est le bon accord ?",
  ].forEach((q) => assert.ok(detect(q), `devrait être repérée : ${q}`));
});

test("QCM : laisse passer les questions qui ont du sens seules", () => {
  [
    "Quelle est la capitale de l'Australie ?",
    "Capitale : Afghanistan ?",
    "Calcule 4,7 + 2,85.",
    "Quel est le mois suivant ?",
    "Qu'est-ce que des propositions juxtaposées ?",
    "Quelle est la ville dans laquelle est né Victor Hugo ?",
    "Quel est l'intrus : pomme, poire, chou, kiwi ?",
    "Quel est l'intrus ? rouge – orange – bleu – jaune",
    "Laquelle fournit le plus d'énergie : la respiration ou la fermentation ?",
    "Quel monument est entouré par la mer lors des grandes marées ?",
    "Quelle est l'identité remarquable (a + b)(a − b) ?",
    "Quel déterminant convient devant « arbre » ?",
    "Cette phrase est-elle correcte ?",
    "Quel est le plus grand nombre à 5 chiffres ?",
    "Quelle phrase est correcte : « ils sont » ou « ils son » ?",
    "Dans quelle ville est née Marie Curie ?",
  ].forEach((q) => assert.equal(detect(q), null, `ne devrait pas être repérée : ${q}`));
});
