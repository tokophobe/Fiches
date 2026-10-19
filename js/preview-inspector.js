/* ============================================================
   Round 57 : réglage visuel — chargé seulement dans l'aperçu de Darwin
   Admin (index.html?preview=1). En mode « Régler », toucher un élément
   n'agit pas sur l'appli : l'aperçu envoie à Darwin Admin la liste des
   réglages qui concernent cet élément (et ses conteneurs), du plus proche
   au plus lointain. Alt + clic (ou le bouton « Utiliser cet élément » de
   Darwin Admin, ou le mode « Naviguer ») garde le comportement normal.

   Correspondance élément → réglages :
   - réglages pilotés par une variable CSS (couleurs, ombres…) : on lit
     les feuilles de style et on garde les règles qui utilisent ces
     variables (directement ou via une autre variable) ; un élément est
     concerné si lui ou un de ses parents correspond au sélecteur ;
   - les attributs style / fill / stroke des éléments (SVG des
     graphiques, blocs de classement) sont lus de la même façon ;
   - autres réglages : sélecteurs donnés dans inspectDefs()
     (js/settings-model.js).
   ============================================================ */
(function () {
  "use strict";
  const M = window.FichesSettingsModel;
  if (!M || !M.inspectDefs) return;
  const DEFS = M.inspectDefs();
  const VAR_TO_DEFS = new Map();
  DEFS.forEach((d) =>
    (d.vars || []).forEach((v) => {
      if (!VAR_TO_DEFS.has(v)) VAR_TO_DEFS.set(v, []);
      VAR_TO_DEFS.get(v).push(d.id);
    })
  );
  const SEL_DEFS = DEFS.filter((d) => d.sel && d.sel.length).map((d) => ({ id: d.id, sel: d.sel.join(", ") }));

  let on = false;
  let passThrough = false;
  let pickedEl = null;
  let index = null; // [{ sel, ids: [def ids] }]

  const VAR_RE = /var\(\s*(--[\w-]+)/g;
  function varRefs(text) {
    const out = [];
    if (!text) return out;
    let m;
    VAR_RE.lastIndex = 0;
    while ((m = VAR_RE.exec(text))) out.push(m[1]);
    return out;
  }
  /* Sélecteur utilisable avec matches() : sans pseudo-éléments ni états
     passagers (survol, focus…). */
  function cleanSelector(sel) {
    return sel
      .split(",")
      .map((s) =>
        s
          .replace(/::?(before|after|placeholder|marker|selection|first-line|first-letter|backdrop|-webkit-[\w-]+|-moz-[\w-]+)\b(\([^)]*\))?/g, "")
          .replace(/:(hover|active|focus|focus-visible|focus-within|visited)\b/g, "")
          .trim()
      )
      .filter(Boolean)
      .join(", ");
  }
  function buildIndex() {
    // --a → [{ to: --b, sel }] quand une règle déclare --a: var(--b) ;
    // `sel` = null pour :root / html (vaut partout).
    const aliases = new Map();
    const rules = [];
    const DECL_RE = /(--[\w-]+)\s*:\s*([^;]*)/g;
    const walk = (list) => {
      for (const r of list) {
        if (r.cssRules && !r.selectorText) {
          walk(r.cssRules);
          continue;
        }
        if (!r.selectorText || !r.style) continue;
        // cssText plutôt que les propriétés une à une : un raccourci
        // (background: var(--x)) n'expose pas sa valeur dans ses longhands.
        const text = r.style.cssText || "";
        const global = /^\s*(:root|html)\s*$/.test(r.selectorText);
        let m;
        DECL_RE.lastIndex = 0;
        while ((m = DECL_RE.exec(text))) {
          const from = m[1];
          varRefs(m[2]).forEach((to) => {
            if (!aliases.has(from)) aliases.set(from, []);
            aliases.get(from).push({ to, sel: global ? null : cleanSelector(r.selectorText) });
          });
        }
        const usage = text.replace(DECL_RE, "");
        const refs = new Set(varRefs(usage));
        // Propriétés « simples » (valeur = une seule variable) : servent à
        // vérifier que la règle s'applique vraiment (pas écrasée ailleurs).
        const checks = [];
        usage.split(";").forEach((decl) => {
          const mm = /^\s*([a-z-]+)\s*:\s*var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)\s*(!important)?\s*$/i.exec(decl);
          if (mm && CHECKABLE[mm[1]]) checks.push({ prop: CHECKABLE[mm[1]], v: mm[2] });
        });
        if (refs.size) rules.push({ sel: r.selectorText, refs, checks });
      }
    };
    for (const sheet of document.styleSheets) {
      try {
        walk(sheet.cssRules);
      } catch (e) {
        /* feuille d'un autre site (polices) */
      }
    }
    index = [];
    rules.forEach((r) => {
      const sel = cleanSelector(r.sel);
      if (sel) index.push({ sel, refs: [...r.refs], checks: r.checks });
    });
    buildIndex.aliases = aliases;
  }
  const CHECKABLE = { background: "background-color", "background-color": "background-color", color: "color", fill: "fill", stroke: "stroke", "border-color": "border-top-color", "box-shadow": "box-shadow" };
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;";
  /** Faux si l'élément n'affiche pas la valeur de la variable pour cette
   *  propriété (règle écrasée par une autre plus forte). */
  function ruleApplies(n, checks) {
    if (!checks || !checks.length) return true;
    try {
      const cs = getComputedStyle(n);
      if (!probe.isConnected) document.documentElement.appendChild(probe);
      return checks.some((c) => {
        const val = cs.getPropertyValue(c.v).trim();
        if (!val) return true;
        probe.style.setProperty(c.prop, "");
        probe.style.setProperty(c.prop, val);
        const want = getComputedStyle(probe).getPropertyValue(c.prop);
        return !want || want === cs.getPropertyValue(c.prop);
      });
    } catch (e) {
      return true;
    }
  }
  /** Réglages liés à la variable `v` pour un élément dont `chain` est la
   *  liste des ancêtres (lui compris) : suit les alias de variables, en ne
   *  gardant que ceux déclarés sur un de ces ancêtres (ou sur :root). */
  function idsForVar(v, chain, seen) {
    seen = seen || new Set();
    if (seen.has(v)) return [];
    seen.add(v);
    const out = [...(VAR_TO_DEFS.get(v) || [])];
    (buildIndex.aliases.get(v) || []).forEach((a) => {
      if (a.sel && !chain.some((n) => safeMatches(n, a.sel))) return;
      out.push(...idsForVar(a.to, chain, seen));
    });
    return out;
  }
  function safeMatches(el, sel) {
    try {
      return el.matches(sel);
    } catch (e) {
      return false;
    }
  }
  /** Réglages qui concernent `el`, du plus proche au plus lointain. */
  function defsFor(el, maxDepth) {
    if (!index) buildIndex();
    const found = new Map(); // id → distance
    const add = (id, d) => {
      if (!found.has(id) || found.get(id) > d) found.set(id, d);
    };
    const chain = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n);
    const limit = maxDepth == null ? chain.length : Math.min(chain.length, maxDepth + 1);
    for (let d = 0; d < limit; d++) {
      const n = chain[d];
      const up = chain.slice(d);
      index.forEach((r) => {
        if (!r.refs.some((v) => VAR_TO_DEFS.has(v) || buildIndex.aliases.has(v))) return;
        if (safeMatches(n, r.sel) && ruleApplies(n, r.checks)) r.refs.forEach((v) => idsForVar(v, up).forEach((id) => add(id, d)));
      });
      ["style", "fill", "stroke"].forEach((attr) => {
        varRefs(n.getAttribute(attr)).forEach((v) => idsForVar(v, up).forEach((id) => add(id, d)));
      });
      SEL_DEFS.forEach((s) => {
        if (safeMatches(n, s.sel)) add(s.id, d);
      });
    }
    // À distance égale, les réglages propres à l'élément (bouton, logo…)
    // avant les réglages communs (fonds, textes, ombres).
    const generic = (id) => (/^(bg|tx|shadow)\./.test(id) ? 1 : 0);
    return [...found.entries()].sort((a, b) => a[1] - b[1] || generic(a[0]) - generic(b[0])).map(([id]) => id);
  }
  /** Tous les éléments sous le doigt (un élément peut être recouvert par
   *  un autre, ex. le robot de l'accueil sous la zone des boutons) : leurs
   *  réglages propres d'abord, puis ceux de l'élément du dessus et de ses
   *  conteneurs. */
  function defsAt(x, y, top) {
    const ids = [];
    defsAt.covered = null;
    const push = (id) => {
      if (!ids.includes(id)) ids.push(id);
    };
    defsFor(top, 0).forEach(push);
    // Éléments réglables recouverts (pointer-events: none ou sous un
    // autre élément) : repérés par leur position.
    SEL_DEFS.forEach((sd) => {
      let nodes = [];
      try {
        nodes = document.querySelectorAll(sd.sel);
      } catch (e) {
        nodes = [];
      }
      for (const n of nodes) {
        if (n === top || n.contains(top) || top.contains(n)) continue;
        const r = n.getBoundingClientRect();
        if (r.width && r.height && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom && getComputedStyle(n).visibility !== "hidden") {
          if (!defsAt.covered && !ids.length) defsAt.covered = n;
          push(sd.id);
          break;
        }
      }
    });
    defsFor(top).forEach(push);
    // Fonds de page en dernier : ils concernent tout l'écran.
    const PAGE = ["bg.appBg", "bg.libraryPageBg", "bg.homeBg"];
    return ids.filter((id) => !PAGE.includes(id)).concat(ids.filter((id) => PAGE.includes(id)));
  }
  function currentView() {
    const v = document.querySelector(".view.is-active");
    return v ? v.id.replace(/^view-/, "") : "home";
  }
  const TAG_NAMES = { IMG: "image", SVG: "icône", svg: "icône", P: "texte", SPAN: "texte", H1: "titre", H2: "titre", H3: "titre", INPUT: "champ", TEXTAREA: "zone de texte", SELECT: "sélecteur", BUTTON: "bouton", SECTION: "page", DIV: "bloc", LI: "ligne", UL: "liste" };
  function describe(el) {
    const txt = (s) => String(s || "").replace(/\s+/g, " ").trim();
    const short = (s) => (s.length > 60 ? `${s.slice(0, 57)}…` : s);
    let n = el;
    for (let i = 0; n && i < 4; i++, n = n.parentElement) {
      if (n.matches("button, a, label, h1, h2, h3, h4, li, [role='button'], .tab")) {
        const t = txt(n.getAttribute("aria-label")) || txt(n.getAttribute("title")) || txt(n.textContent);
        if (t) return short(t);
      }
    }
    const own = txt(el.getAttribute("aria-label")) || txt(el.getAttribute("title")) || txt(el.getAttribute("alt")) || txt(el.getAttribute("placeholder"));
    if (own) return short(own);
    const t = txt(el.textContent);
    if (t && t.length <= 80) return short(t);
    if (el.closest("svg")) return "icône";
    return TAG_NAMES[el.tagName] || "élément";
  }
  function isActionable(el) {
    return !!el.closest("button, a[href], [data-go], .tab, input, select, textarea, label, [role='button'], li.subject-row, .folder-row, .library-row");
  }

  /* ---- Repères visuels ---- */
  const hover = document.createElement("div");
  const picked = document.createElement("div");
  [hover, picked].forEach((b) => {
    b.style.cssText = "position:fixed;pointer-events:none;z-index:2147483646;border-radius:6px;display:none;box-sizing:border-box;";
    document.documentElement.appendChild(b);
  });
  hover.style.outline = "2px dashed #ff6a2b";
  picked.style.outline = "3px solid #ff6a2b";
  /** Élément à encadrer : le bouton / la ligne / l'image… qui contient
   *  le point touché, plutôt qu'un petit bout d'icône. */
  const FRAME_SEL = "button, a, li, label, input, select, textarea, img, [role='button'], .home-circle, .tax-block, .card-form, .stack-card, .chart-wrap, h1, h2, h3, p";
  function frameTarget(el) {
    if (!el || el.nodeType !== 1) return el;
    const near = el.closest(FRAME_SEL);
    if (near && near !== document.body) return near;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const r = n.getBoundingClientRect();
      if (r.width >= 8 && r.height >= 8) return n;
    }
    return el;
  }
  function place(box, el) {
    el = frameTarget(el);
    if (!el || !on) {
      box.style.display = "none";
      return;
    }
    const r = el.getBoundingClientRect();
    Object.assign(box.style, { display: "block", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  }
  window.addEventListener("scroll", () => place(picked, pickedEl), true);
  // Le cadre suit l'élément choisi (changement de page, animation…) et
  // disparaît quand l'élément n'est plus affiché.
  setInterval(() => {
    if (!on || !pickedEl) return;
    const r = pickedEl.isConnected ? frameTarget(pickedEl).getBoundingClientRect() : null;
    if (!r || (!r.width && !r.height)) {
      place(picked, null);
      pickedEl = null;
    } else place(picked, pickedEl);
  }, 300);

  /* ---- Interception des gestes en mode Régler ---- */
  const BLOCK = ["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend", "dblclick", "contextmenu", "submit"];
  function shouldBlock(e) {
    // Seuls les gestes réels sont interceptés : les clics déclenchés par
    // l'appli elle-même (ex. bouton de l'accueil → onglet de la page) ou
    // par les raccourcis de Darwin Admin passent normalement.
    return on && !passThrough && !e.altKey && e.isTrusted;
  }
  BLOCK.forEach((type) =>
    window.addEventListener(
      type,
      (e) => {
        if (!shouldBlock(e)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
      },
      { capture: true, passive: false }
    )
  );
  window.addEventListener(
    "click",
    (e) => {
      if (!shouldBlock(e)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const el = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentElement;
      if (!el) return;
      pickedEl = el;
      place(picked, el);
      const ids = defsAt(e.clientX, e.clientY, el);
      let label = describe(el);
      if (Object.values(TAG_NAMES).includes(label) || label === "élément") {
        const first = DEFS.find((d) => d.id === ids[0]);
        if (first && first.sel) label = first.title;
        // Élément réglable recouvert (ex. robot sous la zone des boutons) :
        // c'est lui qu'on encadre.
        if (defsAt.covered) {
          pickedEl = defsAt.covered;
          place(picked, pickedEl);
        }
      }
      try {
        window.parent.postMessage(
          { type: "darwin-preview-pick", ids, view: currentView(), label, actionable: isActionable(el) },
          location.origin
        );
      } catch (err) {
        /* cadre d'un autre site */
      }
    },
    true
  );
  window.addEventListener(
    "mousemove",
    (e) => {
      if (!on) return;
      place(hover, e.altKey ? null : e.target);
    },
    true
  );
  document.addEventListener("mouseleave", () => place(hover, null));

  /* ---- Messages de Darwin Admin ---- */
  window.addEventListener("message", (e) => {
    if (e.origin !== location.origin || !e.data || typeof e.data !== "object") return;
    if (e.data.type === "darwin-admin-inspect") {
      on = !!e.data.on;
      document.documentElement.classList.toggle("is-inspecting", on);
      if (!on) {
        place(hover, null);
        place(picked, null);
      } else place(picked, pickedEl);
    } else if (e.data.type === "darwin-admin-activate" && pickedEl) {
      // « Utiliser cet élément » : un vrai clic, comme dans l'appli.
      const target = pickedEl.closest("button, a, [data-go], .tab, input, select, textarea, label, [role='button'], li, .folder-row") || pickedEl;
      passThrough = true;
      try {
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) target.focus();
        else target.click();
      } finally {
        passThrough = false;
      }
      place(picked, null);
      pickedEl = null;
    } else if (e.data.type === "darwin-admin-preview") {
      // Les réglages ont changé : le cadre de l'élément choisi suit.
      requestAnimationFrame(() => place(picked, pickedEl && pickedEl.isConnected ? pickedEl : null));
    }
  });
  window.__darwinInspector = { defsFor, rebuild: () => (index = null) };
})();
