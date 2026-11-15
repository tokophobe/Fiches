/* Tests des liens « Pour aller plus loin » (js/learn-links.js ;
   docs/SPECIFICATION.md, §5.7 règle 5) : extraits de vidéo (v295). */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const L = require(path.join(__dirname, "..", "js", "learn-links.js"));

test("Vidéo entière : lecteur YouTube sans début ni fin", () => {
  const i = L.info("https://www.youtube.com/watch?v=4JiYH-ByIdM");
  assert.equal(i.kind, "video");
  assert.equal(i.label, "Vidéo YouTube");
  assert.ok(!/[?&](start|end)=/.test(i.embed));
});

test("Extrait : la vidéo démarre au début et s'arrête à la fin de l'extrait", () => {
  const i = L.info("https://www.youtube.com/watch?v=4JiYH-ByIdM&t=95&end=170");
  assert.match(i.embed, /&start=95&end=170$/);
  assert.equal(i.label, "Extrait vidéo (1:35 → 2:50)");
  assert.equal(i.start, 95);
  assert.equal(i.end, 170);
});

test("Extrait : lien court youtu.be et minutage « 1m35s » acceptés", () => {
  const i = L.info("https://youtu.be/4JiYH-ByIdM?t=1m35s&end=2m50s");
  assert.match(i.embed, /&start=95&end=170$/);
});

test("Extrait : une fin qui n'est pas après le début est ignorée", () => {
  const i = L.info("https://www.youtube.com/watch?v=4JiYH-ByIdM&t=200&end=100");
  assert.match(i.embed, /&start=200$/);
  assert.equal(i.label, "Vidéo YouTube");
});
