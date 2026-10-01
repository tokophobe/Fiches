/* ============================================================
   Fiches — Taxonomie des classes (catégorie → cycle → niveau → année /
   spécialité → matière), lue DIRECTEMENT dans le fichier Excel
   `data/taxonomie.xlsx`, sans étape de conversion.

   Pour mettre à jour la taxonomie : modifier le fichier Excel, puis
   remplacer `data/taxonomie.xlsx` sur le site (même nom, même
   emplacement). L'appli le relit à chaque ouverture (réseau d'abord, voir
   sw.js) et garde la dernière version lue en mémoire locale pour le mode
   hors-ligne.

   Structure attendue du classeur (celle du fichier de Stéphane) :
   - onglet "listes" : des paires de colonnes [id | libellé], dont l'en-tête
     du libellé vaut catégories / cycles / niveaux / années / spécialités /
     matières (accents et majuscules indifférents ; "école & études" est
     aussi accepté pour cycles) ;
   - un onglet par matrice, nommé "parent-enfant" (ex. "niveaux-années") :
     les colonnes à partir de C sont les éléments du parent (dans l'ordre de
     la liste), les lignes à partir de 3 ceux de l'enfant (idem), et une
     cellule non vide (ex. 1) marque une correspondance. Les deux premières
     lignes et les deux premières colonnes (formules d'en-tête) sont
     ignorées : seule la POSITION compte, comme le font déjà les formules
     du classeur.
   ============================================================ */
(function () {
  "use strict";

  const XLSX_URL = "data/taxonomie.xlsx";
  const CACHE_KEY = "fiches-taxonomy-cache-v1";

  /* Listes, dans l'ordre de la cascade. `aliases` : en-têtes acceptés
     dans l'onglet "listes" (comparés sans accents ni majuscules). */
  const LISTS = [
    { key: "categories", aliases: ["categories", "categorie"] },
    { key: "cycles", aliases: ["cycles", "cycle", "ecole & etudes", "ecole et etudes"] },
    { key: "niveaux", aliases: ["niveaux", "niveau"] },
    { key: "annees", aliases: ["annees", "annee"] },
    { key: "specialites", aliases: ["specialites", "specialite"] },
    { key: "matieres", aliases: ["matieres", "matiere"] },
  ];

  /* Matrices : onglet "parent-enfant". */
  const MATRICES = [
    { parent: "categories", child: "cycles" },
    { parent: "cycles", child: "niveaux" },
    { parent: "niveaux", child: "annees" },
    { parent: "niveaux", child: "specialites" },
    { parent: "specialites", child: "matieres" },
    // Round 24 : matières rattachées directement à un niveau, pour les
    // niveaux sans spécialité (CP → 3ème). Onglet facultatif.
    { parent: "niveaux", child: "matieres" },
  ];

  /* Champs proposés à l'utilisateur, dans l'ordre d'affichage. `parent` =
     champ dont dépendent les options (via la matrice correspondante). */
  const FIELDS = [
    { key: "categorie", label: "Catégorie", list: "categories", parent: null },
    { key: "cycle", label: "Cycle", list: "cycles", parent: "categorie" },
    { key: "niveau", label: "Niveau", list: "niveaux", parent: "cycle" },
    { key: "annee", label: "Année", list: "annees", parent: "niveau" },
    { key: "specialite", label: "Spécialité", list: "specialites", parent: "niveau" },
    // Matières : d'après la spécialité choisie ; si le niveau n'a AUCUNE
    // spécialité, directement d'après le niveau (onglet "niveaux-matières").
    { key: "matiere", label: "Matière", list: "matieres", parent: "specialite", fallbackParent: "niveau" },
  ];

  function norm(s) {
    return String(s == null ? "" : s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ---------------- Lecture minimale d'un .xlsx ----------------
     Un .xlsx est un zip de fichiers XML. On lit le répertoire central du
     zip, puis on décompresse les seuls fichiers utiles avec
     DecompressionStream("deflate-raw") (Safari 16.4+, Chrome, Firefox). */
  async function inflateRaw(bytes) {
    const ds = new DecompressionStream("deflate-raw");
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  function readZipDirectory(buf) {
    const dv = new DataView(buf);
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("fichier Excel illisible (zip)");
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const dec = new TextDecoder();
    const entries = {};
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true);
      const csize = dv.getUint32(p + 20, true);
      const nameLen = dv.getUint16(p + 28, true);
      const extraLen = dv.getUint16(p + 30, true);
      const commentLen = dv.getUint16(p + 32, true);
      const localOff = dv.getUint32(p + 42, true);
      const name = dec.decode(new Uint8Array(buf, p + 46, nameLen));
      entries[name] = { method, csize, localOff };
      p += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
  }

  async function readZipText(buf, entries, name) {
    const e = entries[name];
    if (!e) return null;
    const dv = new DataView(buf);
    const nameLen = dv.getUint16(e.localOff + 26, true);
    const extraLen = dv.getUint16(e.localOff + 28, true);
    const start = e.localOff + 30 + nameLen + extraLen;
    const raw = new Uint8Array(buf, start, e.csize);
    const bytes = e.method === 0 ? raw : await inflateRaw(raw);
    return new TextDecoder().decode(bytes);
  }

  function parseXml(text) {
    return new DOMParser().parseFromString(text, "application/xml");
  }
  function byTag(node, tag) {
    return Array.from(node.getElementsByTagNameNS("*", tag));
  }
  function colIndex(ref) {
    // "AB12" -> 28 (1-based)
    let n = 0;
    for (const ch of ref) {
      const c = ch.charCodeAt(0);
      if (c < 65 || c > 90) break;
      n = n * 26 + (c - 64);
    }
    return n;
  }

  /** Renvoie { nomOnglet: Map(ligne -> Map(colonne -> valeur)) }. */
  async function readWorkbook(buf) {
    const entries = readZipDirectory(buf);
    const wbXml = parseXml(await readZipText(buf, entries, "xl/workbook.xml"));
    const relsXml = parseXml(await readZipText(buf, entries, "xl/_rels/workbook.xml.rels"));
    const relTarget = {};
    byTag(relsXml, "Relationship").forEach((r) => {
      let t = r.getAttribute("Target") || "";
      t = t.startsWith("/") ? t.slice(1) : "xl/" + t.replace(/^\.\//, "");
      relTarget[r.getAttribute("Id")] = t;
    });
    const sstText = await readZipText(buf, entries, "xl/sharedStrings.xml");
    const shared = sstText
      ? byTag(parseXml(sstText), "si").map((si) => byTag(si, "t").map((t) => t.textContent).join(""))
      : [];
    const sheets = {};
    for (const s of byTag(wbXml, "sheet")) {
      const rid =
        s.getAttribute("r:id") ||
        s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
      const path = relTarget[rid];
      const xml = path && (await readZipText(buf, entries, path));
      if (!xml) continue;
      const rows = new Map();
      for (const c of byTag(parseXml(xml), "c")) {
        const ref = c.getAttribute("r") || "";
        const col = colIndex(ref);
        const row = parseInt(ref.replace(/^[A-Z]+/, ""), 10);
        if (!col || !row) continue;
        const type = c.getAttribute("t");
        let value;
        if (type === "inlineStr") {
          value = byTag(c, "t").map((t) => t.textContent).join("");
        } else {
          const v = byTag(c, "v")[0];
          if (!v) continue;
          value = type === "s" ? shared[parseInt(v.textContent, 10)] : v.textContent;
        }
        if (value == null || value === "") continue;
        if (!rows.has(row)) rows.set(row, new Map());
        rows.get(row).set(col, value);
      }
      sheets[s.getAttribute("name")] = rows;
    }
    return sheets;
  }

  function cell(rows, r, c) {
    const row = rows.get(r);
    return row ? row.get(c) : undefined;
  }

  /** Construit la taxonomie à partir des onglets lus. */
  function buildTaxonomy(sheets) {
    const sheetNames = Object.keys(sheets);
    const listesName = sheetNames.find((n) => norm(n) === "listes");
    if (!listesName) throw new Error("onglet « listes » introuvable");
    const listes = sheets[listesName];
    const header = listes.get(1) || new Map();
    const lists = {};
    for (const def of LISTS) {
      let labelCol = null;
      header.forEach((v, c) => {
        if (labelCol == null && def.aliases.includes(norm(v))) labelCol = c;
      });
      if (labelCol == null) throw new Error(`colonne « ${def.key} » introuvable dans l'onglet listes`);
      const idCol = labelCol - 1;
      const items = [];
      // Lecture jusqu'à la dernière ligne remplie ; une ligne sans libellé
      // garde sa place (pour que les positions des matrices restent
      // alignées) mais n'est pas proposée.
      let last = 1;
      listes.forEach((row, r) => {
        if (row.has(labelCol) && r > last) last = r;
      });
      for (let r = 2; r <= last; r++) {
        const label = String(cell(listes, r, labelCol) || "").trim();
        const id = String(cell(listes, r, idCol) || "").trim() || `${def.key}-${r}`;
        items.push(label ? { id, label } : null);
      }
      lists[def.key] = items;
    }
    const links = {};
    for (const m of MATRICES) {
      const key = `${m.parent}>${m.child}`;
      links[key] = {};
      const wanted = [norm(`${m.parent}-${m.child}`)];
      // tolère singulier/pluriel ("catégorie-cycles", "niveaux-années"...)
      const singular = (s) => s.replace(/s$/, "");
      const sheetName = sheetNames.find((n) => {
        const parts = norm(n).split("-").map((x) => singular(x.trim()));
        return parts.length === 2 && parts[0] === singular(norm(m.parent)) && parts[1] === singular(norm(m.child));
      }) || sheetNames.find((n) => wanted.includes(norm(n)));
      if (!sheetName) continue;
      const rows = sheets[sheetName];
      const parents = lists[m.parent];
      const children = lists[m.child];
      rows.forEach((row, r) => {
        if (r < 3) return;
        const child = children[r - 3];
        if (!child) return;
        row.forEach((v, c) => {
          if (c < 3) return;
          const s = String(v).trim();
          if (!s || s === "0") return;
          const parent = parents[c - 3];
          if (!parent) return;
          (links[key][parent.id] = links[key][parent.id] || []).push(child.id);
        });
      });
    }
    const clean = {};
    Object.keys(lists).forEach((k) => (clean[k] = lists[k].filter(Boolean)));
    return { lists: clean, links, loadedAt: new Date().toISOString() };
  }

  /* ---------------- Chargement + cache ---------------- */
  let current = null;
  let loading = null;

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
  function writeCache(tax) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(tax));
    } catch {
      /* stockage plein ou indisponible : sans conséquence */
    }
  }

  async function fetchAndParse(url) {
    if (typeof DecompressionStream === "undefined") throw new Error("navigateur trop ancien pour lire l'Excel");
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return buildTaxonomy(await readWorkbook(await res.arrayBuffer()));
  }

  /** Charge la taxonomie (une seule fois par session, sauf `force`).
   *  Repli sur la dernière version mise en cache si l'Excel est
   *  inaccessible (hors-ligne, navigateur trop ancien…). */
  function load(force) {
    if (current && !force) return Promise.resolve(current);
    if (loading && !force) return loading;
    loading = fetchAndParse(XLSX_URL)
      .then((tax) => {
        current = tax;
        writeCache(tax);
        return tax;
      })
      .catch((e) => {
        console.warn("Taxonomie : lecture de l'Excel impossible —", e.message);
        const cached = readCache();
        if (cached) {
          current = cached;
          return cached;
        }
        current = { lists: { categories: [], cycles: [], niveaux: [], annees: [], specialites: [], matieres: [] }, links: {}, error: e.message };
        return current;
      })
      .finally(() => {
        loading = null;
      });
    return loading;
  }

  /* ---------------- Requêtes ---------------- */
  function fieldDef(key) {
    return FIELDS.find((f) => f.key === key);
  }

  /** Options possibles pour un champ, d'après la sélection actuelle
   *  (`sel` = { categorie: id, cycle: id, ... }). Pour un champ sans
   *  parent : toute la liste. Pour un champ dont le parent n'est pas
   *  choisi : aucune option. */
  function options(tax, key, sel) {
    const f = fieldDef(key);
    if (!tax || !f) return [];
    const all = tax.lists[f.list] || [];
    if (!f.parent) return all;
    let parentKey = f.parent;
    if (f.fallbackParent && !(sel && sel[f.parent]) && options(tax, f.parent, sel).length === 0) {
      parentKey = f.fallbackParent;
    }
    const parentId = sel && sel[parentKey];
    if (!parentId) return [];
    const pf = fieldDef(parentKey);
    const ids = (tax.links[`${pf.list}>${f.list}`] || {})[parentId] || [];
    const set = new Set(ids);
    return all.filter((it) => set.has(it.id));
  }

  function findItem(tax, key, id) {
    const f = fieldDef(key);
    if (!tax || !f || !id) return null;
    return (tax.lists[f.list] || []).find((it) => it.id === id) || null;
  }

  function findByLabel(tax, key, label) {
    const f = fieldDef(key);
    if (!tax || !f || !label) return null;
    const n = norm(label);
    return (tax.lists[f.list] || []).find((it) => norm(it.label) === n) || null;
  }

  /** Remonte la chaîne à partir d'un niveau (ex. ancien champ `level` des
   *  collections publiées avant la taxonomie) : niveau → cycle → catégorie. */
  function selectionFromNiveau(tax, niveauId) {
    const sel = { niveau: niveauId };
    const parentOf = (linkKey, childId) => {
      const map = tax.links[linkKey] || {};
      return Object.keys(map).find((pid) => map[pid].includes(childId)) || null;
    };
    sel.cycle = parentOf("cycles>niveaux", niveauId);
    if (sel.cycle) sel.categorie = parentOf("categories>cycles", sel.cycle);
    return sel;
  }

  window.Taxonomy = {
    FIELDS,
    load,
    get: () => current,
    options,
    findItem,
    findByLabel,
    selectionFromNiveau,
    norm,
    // exposés pour les tests
    _readWorkbook: readWorkbook,
    _buildTaxonomy: buildTaxonomy,
  };
})();
