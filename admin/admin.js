/* ============================================================
   Darwin Admin — appli d'administration de Fiches.

   Même serveur Supabase et mêmes comptes que l'appli Fiches (js/config.js),
   même session si les deux sont ouvertes dans le même navigateur. Accès
   réservé aux comptes de la table `admins` (voir
   supabase/admin_migration.sql) ; toutes les lectures « tous comptes »
   passent par des fonctions serveur qui le vérifient elles-mêmes.

   Pages : tableau de bord ; comptes, abonnements, administrateurs ;
   Librairie, boîtes, classes, signalements ; réglages communs de l'appli
   (ex-mode développeur), avec aperçu en direct de l'appli ; journal.
   ============================================================ */
(() => {
  "use strict";

  const M = window.FichesSettingsModel;
  const DEF = M.buildDevSettings({});
  const OWNER_EMAIL = "stephane.vezain@gmail.com";
  const PAGE_SIZE = 50;

  /* ---------------- Outils ---------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  /** Crée un élément : h("div", { class: "x", onclick: fn }, enfant, "texte", [liste]). */
  function h(tag, props, ...kids) {
    const n = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach((k) => {
        const v = props[k];
        if (v == null || v === false) return;
        if (k === "class") n.className = v;
        else if (k === "html") n.innerHTML = v;
        else if (k === "text") n.textContent = v;
        else if (k === "style" && typeof v === "object") Object.assign(n.style, v);
        else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
        else if (k === "dataset") Object.assign(n.dataset, v);
        else if (k === "value") n.value = v;
        else if (k === "checked") n.checked = !!v;
        else if (v === true) n.setAttribute(k, "");
        else n.setAttribute(k, v);
      });
    }
    const add = (c) => {
      if (c == null || c === false) return;
      if (Array.isArray(c)) c.forEach(add);
      else n.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    };
    kids.forEach(add);
    return n;
  }
  const nf = new Intl.NumberFormat("fr-FR");
  const fmtN = (n) => (n == null || n === "" ? "—" : nf.format(Number(n)));
  function fmtDate(d) {
    if (!d) return "—";
    const x = new Date(d);
    return isNaN(x) ? "—" : x.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }
  function fmtDateTime(d) {
    if (!d) return "—";
    const x = new Date(d);
    return isNaN(x) ? "—" : x.toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function fmtRel(d) {
    if (!d) return "jamais";
    const x = new Date(d);
    if (isNaN(x)) return "—";
    const s = (Date.now() - x.getTime()) / 1000;
    if (s < 60) return "à l'instant";
    if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
    if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
    if (s < 86400 * 30) return `il y a ${Math.floor(s / 86400)} j`;
    return fmtDate(d);
  }
  function plural(n, one, many) {
    return `${fmtN(n)} ${Number(n) > 1 ? many : one}`;
  }
  function debounce(fn, ms) {
    let t = null;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  }
  const clone = (o) => (o === undefined ? undefined : JSON.parse(JSON.stringify(o)));
  const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  function getPath(o, path) {
    return path.reduce((acc, k) => (acc == null ? undefined : acc[k]), o);
  }
  function setPath(o, path, v) {
    let cur = o;
    for (let i = 0; i < path.length - 1; i++) {
      // Round 55 : un tableau (couleurs par niveau) est gardé tel quel.
      if (!isObj(cur[path[i]]) && !Array.isArray(cur[path[i]])) cur[path[i]] = {};
      cur = cur[path[i]];
    }
    cur[path[path.length - 1]] = v;
  }
  function personName(first, last, email) {
    const n = `${first || ""} ${last || ""}`.trim();
    return n || email || "Sans nom";
  }
  const USAGE_LABELS = { eleve: "Élève", enseignant: "Enseignant", perso: "Usage personnel" };

  /* ---------------- Serveur ---------------- */
  let sb = null;
  function client() {
    if (sb) return sb;
    const c = window.FICHES_CONFIG || {};
    if (!c.supabaseUrl || !c.supabaseAnonKey || !window.supabase) return null;
    sb = window.supabase.createClient(c.supabaseUrl, c.supabaseAnonKey);
    return sb;
  }
  const MIGRATION_HINT = "Le serveur n'a pas encore la mise à jour d'administration : exécute supabase/admin_migration.sql dans Supabase (SQL Editor).";
  function friendlyError(error) {
    const msg = (error && (error.message || error.msg)) || String(error || "Erreur inconnue");
    if (/could not find the function|does not exist|PGRST202|schema cache/i.test(msg)) return MIGRATION_HINT;
    if (/réservé aux administrateurs|42501|permission denied/i.test(msg)) return "Réservé aux administrateurs.";
    if (/failed to fetch|network/i.test(msg)) return "Serveur injoignable (connexion internet ?).";
    return msg;
  }
  async function rpc(name, args) {
    const c = client();
    if (!c) throw new Error("Serveur non configuré (js/config.js).");
    const { data, error } = await c.rpc(name, args || {});
    if (error) throw new Error(friendlyError(error));
    return data;
  }

  /* ---------------- Interface commune ---------------- */
  const pageEl = () => $("#page");
  function setTitle(title, crumbs) {
    $("#page-title").textContent = title;
    const c = $("#crumbs");
    c.innerHTML = "";
    (crumbs || []).forEach((cr, i) => {
      if (i) c.appendChild(document.createTextNode(" › "));
      c.appendChild(cr.href ? h("a", { href: cr.href }, cr.label) : h("span", null, cr.label));
    });
    document.title = `${title} — Darwin Admin`;
  }
  let toastTimer = null;
  function toast(msg, isError) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.toggle("is-error", !!isError);
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), isError ? 6000 : 2600);
  }
  let modalResolve = null;
  function closeModal(value) {
    $("#modal").hidden = true;
    const r = modalResolve;
    modalResolve = null;
    if (r) r(value);
  }
  /** Fenêtre : { title, body (nœud ou texte), buttons: [{ label, value, primary, danger, onClick }], wide }. */
  function openModal(opts) {
    const m = $("#modal");
    $("#modal-title").textContent = opts.title || "";
    const body = $("#modal-body");
    body.innerHTML = "";
    body.appendChild(typeof opts.body === "string" ? h("p", null, opts.body) : opts.body);
    const foot = $("#modal-foot");
    foot.innerHTML = "";
    (opts.buttons || []).forEach((b) => {
      foot.appendChild(
        h(
          "button",
          {
            type: "button",
            class: `btn${b.primary ? " btn--primary" : ""}${b.danger ? " btn--danger-solid" : ""}`,
            onclick: async (e) => {
              if (b.onClick) {
                e.currentTarget.disabled = true;
                const keep = await b.onClick();
                e.currentTarget.disabled = false;
                if (keep === false) return;
              }
              closeModal(b.value);
            },
          },
          b.label
        )
      );
    });
    m.querySelector(".modal-card").classList.toggle("is-wide", !!opts.wide);
    m.hidden = false;
    return new Promise((res) => (modalResolve = res));
  }
  $("#modal").addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal(undefined);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#modal").hidden) closeModal(undefined);
  });
  function confirmDialog(text, opts) {
    opts = opts || {};
    return openModal({
      title: opts.title || "Confirmer",
      body: text,
      buttons: [
        { label: "Annuler", value: false },
        { label: opts.okLabel || "Confirmer", value: true, primary: !opts.danger, danger: !!opts.danger },
      ],
    }).then((v) => v === true);
  }
  function errorCard(msg) {
    return h("div", { class: "card" }, h("p", { class: "form-error", style: { margin: 0 } }, msg));
  }
  function loadingCard() {
    return h("div", { class: "card muted" }, "Chargement…");
  }
  function card(title, hint, ...content) {
    return h(
      "section",
      { class: "card" },
      title || hint ? h("div", { class: "card-head" }, h("div", null, title ? h("h2", { class: "card-title" }, title) : null, hint ? h("p", { class: "card-hint" }, hint) : null)) : null,
      ...content
    );
  }
  function badge(text, kind) {
    return h("span", { class: `badge${kind ? ` badge--${kind}` : ""}` }, text);
  }
  /** Tableau : columns = [{ label, cls, render(row) }]. */
  function table(columns, rows, opts) {
    opts = opts || {};
    if (!rows.length) return h("div", { class: "empty" }, opts.empty || "Rien à afficher.");
    return h(
      "div",
      { class: "table-wrap" },
      h(
        "table",
        { class: "table" },
        h("thead", null, h("tr", null, columns.map((c) => h("th", { class: c.cls || null }, c.label)))),
        h(
          "tbody",
          null,
          rows.map((r) =>
            h(
              "tr",
              { class: opts.onRow ? "is-link" : null, onclick: opts.onRow ? () => opts.onRow(r) : null },
              columns.map((c) => h("td", { class: c.cls || null }, c.render(r)))
            )
          )
        )
      )
    );
  }
  function pager(total, offset, limit, go) {
    const from = total ? offset + 1 : 0;
    const to = Math.min(offset + limit, total);
    return h(
      "div",
      { class: "pager" },
      h("span", { class: "num" }, `${fmtN(from)}–${fmtN(to)} sur ${fmtN(total)}`),
      h("button", { type: "button", class: "btn btn--small", disabled: offset <= 0, onclick: () => go(Math.max(0, offset - limit)) }, "‹ Précédents"),
      h("button", { type: "button", class: "btn btn--small", disabled: to >= total, onclick: () => go(offset + limit) }, "Suivants ›")
    );
  }
  function seg(options, value, onChange) {
    return h(
      "div",
      { class: "seg" },
      options.map(([v, label]) => h("button", { type: "button", class: v === value ? "is-active" : null, onclick: () => onChange(v) }, label))
    );
  }
  function searchInput(value, placeholder, onSearch) {
    const input = h("input", { type: "search", class: "search", placeholder, value: value || "" });
    input.addEventListener("input", debounce(() => onSearch(input.value), 300));
    return input;
  }

  /* ---------------- Icônes du menu ---------------- */
  const NAV_ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><line x1="2.5" y1="10" x2="21.5" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
    box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5v-9z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>',
    school: '<path d="M2 9l10-5 10 5-10 5L2 9z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.3-.3-.3-.5-.8-.5-1.2 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    shapes: '<circle cx="7" cy="7" r="4"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M17 3l4 7h-8l4-7z"/><path d="M3 21l4-7 4 7H3z"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 9.5V20h14V9.5"/>',
    cards: '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="4" y1="12" x2="20" y2="12"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5z"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  };
  const svg = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  const NAV = [
    { group: "Pilotage", items: [{ key: "dashboard", label: "Tableau de bord", icon: "dashboard" }] },
    {
      group: "Utilisateurs",
      items: [
        { key: "users", label: "Comptes", icon: "users" },
        { key: "subscriptions", label: "Abonnements", icon: "card" },
        { key: "admins", label: "Administrateurs", icon: "shield" },
      ],
    },
    {
      group: "Contenus",
      items: [
        { key: "library", label: "Librairie", icon: "book" },
        { key: "boxes", label: "Boîtes", icon: "box" },
        { key: "classes", label: "Classes", icon: "school" },
        { key: "reports", label: "Signalements", icon: "flag", badge: "reports" },
      ],
    },
    {
      group: "Réglages de l'appli",
      items: [
        { key: "settings/visual", label: "Réglage visuel", icon: "palette" },
        { key: "settings/appearance", label: "Apparence", icon: "palette" },
        { key: "settings/icons", label: "Icônes", icon: "shapes" },
        { key: "settings/home", label: "Page d'accueil", icon: "home" },
        { key: "settings/review", label: "Révision", icon: "cards" },
        { key: "settings/robot", label: "Messages du robot", icon: "chat" },
        { key: "settings/tech", label: "Technique", icon: "wrench" },
      ],
    },
    { group: "Suivi", items: [{ key: "journal", label: "Journal", icon: "list" }] },
  ];
  const badges = { reports: 0 };
  function renderNav(activeKey) {
    const nav = $("#nav");
    nav.innerHTML = "";
    NAV.forEach((g) => {
      nav.appendChild(
        h(
          "div",
          { class: "nav-group" },
          h("div", { class: "nav-group-title" }, g.group),
          g.items.map((it) =>
            h(
              "a",
              { class: `nav-item${activeKey === it.key ? " is-active" : ""}`, href: `#/${it.key}`, onclick: () => document.body.classList.remove("nav-open") },
              h("span", { html: svg(NAV_ICONS[it.icon]), style: { display: "inline-flex" } }),
              h("span", null, it.label),
              it.badge && badges[it.badge] ? h("span", { class: "nav-badge" }, String(badges[it.badge])) : null
            )
          )
        )
      );
    });
  }

  /* ---------------- Connexion et accès ---------------- */
  const state = { user: null, limited: false };
  function showGate(which, text) {
    $("#shell").hidden = true;
    $("#gate").hidden = false;
    $("#gate-loading").hidden = which !== "loading";
    $("#login-form").hidden = which !== "login";
    $("#gate-denied").hidden = which !== "denied";
    if (which === "denied" && text) $("#gate-denied-text").textContent = text;
  }
  async function boot() {
    const c = client();
    if (!c) {
      showGate("denied", "Serveur non configuré : js/config.js est vide.");
      return;
    }
    showGate("loading");
    const { data } = await c.auth.getSession();
    const user = data && data.session && data.session.user;
    if (!user) {
      showGate("login");
      return;
    }
    await enter(user);
  }
  async function enter(user) {
    state.user = user;
    state.limited = false;
    const { data, error } = await client().rpc("is_admin");
    if (error) {
      // Migration pas encore exécutée : le compte propriétaire garde
      // l'accès aux réglages (anciennes règles du serveur), le reste attend.
      if (String(user.email || "").toLowerCase() === OWNER_EMAIL && /could not find|does not exist|PGRST202|schema cache/i.test(error.message || "")) {
        state.limited = true;
      } else {
        showGate("denied", friendlyError(error));
        return;
      }
    } else if (data !== true) {
      showGate("denied", `Le compte ${user.email} n'est pas administrateur. Un administrateur peut l'ajouter depuis la page « Administrateurs ».`);
      return;
    }
    $("#gate").hidden = true;
    $("#shell").hidden = false;
    $("#sidebar-user").textContent = user.email || "";
    const notice = $("#notice");
    notice.hidden = !state.limited;
    if (state.limited) notice.textContent = `Mode limité — ${MIGRATION_HINT} En attendant, seuls les réglages de l'appli sont disponibles.`;
    if (!location.hash || location.hash === "#" || location.hash === "#/") location.hash = "#/dashboard";
    else route();
    refreshBadges();
  }
  async function refreshBadges() {
    if (state.limited) return;
    try {
      const o = await rpc("admin_overview");
      badges.reports = Number(o.reports_open) || 0;
      renderNav(currentNavKey);
      return o;
    } catch (e) {
      return null;
    }
  }
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#login-error");
    err.hidden = true;
    const btn = $("#login-submit");
    btn.disabled = true;
    const { data, error } = await client().auth.signInWithPassword({ email: $("#login-email").value.trim(), password: $("#login-password").value });
    btn.disabled = false;
    if (error) {
      err.textContent = /invalid/i.test(error.message) ? "Email ou mot de passe incorrect." : friendlyError(error);
      err.hidden = false;
      return;
    }
    await enter(data.user);
  });
  async function logout() {
    if (!(await settingsFlushBeforeLeave())) return;
    await client().auth.signOut();
    state.user = null;
    showGate("login");
  }
  $("#logout-btn").addEventListener("click", logout);
  $("#gate-logout").addEventListener("click", async () => {
    await client().auth.signOut();
    showGate("login");
  });
  $("#menu-btn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  $("#sidebar-backdrop").addEventListener("click", () => document.body.classList.remove("nav-open"));

  /* ---------------- Navigation ---------------- */
  let renderSeq = 0;
  let currentNavKey = "dashboard";
  const PAGES = {};
  function route() {
    if (!state.user) return;
    const parts = (location.hash.replace(/^#\/?/, "") || "dashboard").split("/").map(decodeURIComponent);
    let key = parts[0];
    let params = parts.slice(1);
    if (key === "settings") {
      key = `settings/${parts[1] || "appearance"}`;
      params = parts.slice(2);
    }
    const page = PAGES[key] || PAGES.dashboard;
    if (!PAGES[key]) key = "dashboard";
    currentNavKey = key;
    renderNav(key);
    const seq = ++renderSeq;
    const live = () => seq === renderSeq;
    const root = pageEl();
    root.innerHTML = "";
    window.scrollTo(0, 0);
    showPreview(key.startsWith("settings/"));
    $("#save-state").hidden = !key.startsWith("settings/") && key !== "subscriptions";
    Promise.resolve(page(root, params, live)).catch((e) => {
      if (!live()) return;
      root.innerHTML = "";
      root.appendChild(errorCard(e.message || String(e)));
    });
  }
  window.addEventListener("hashchange", route);

  /* ================================================================
     Tableau de bord
     ================================================================ */
  function barChart(points, opts) {
    opts = opts || {};
    const W = 640;
    const H = 170;
    const padL = 30;
    const padB = 22;
    const padT = 8;
    const n = points.length;
    const max = Math.max(1, ...points.map((p) => Number(p.n) || 0));
    const niceMax = max <= 4 ? max : Math.ceil(max / 4) * 4;
    const bw = (W - padL) / n;
    const yOf = (v) => padT + (H - padT - padB) * (1 - v / niceMax);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || "")}">`;
    [0, 0.5, 1].forEach((f) => {
      const v = Math.round(niceMax * f);
      const y = yOf(v);
      s += `<line class="grid-line" x1="${padL}" x2="${W}" y1="${y}" y2="${y}"/><text class="axis" x="${padL - 6}" y="${y + 3}" text-anchor="end">${v}</text>`;
    });
    points.forEach((p, i) => {
      const v = Number(p.n) || 0;
      const x = padL + i * bw + bw * 0.15;
      const y = yOf(v);
      const d = new Date(`${p.day}T12:00:00`);
      const label = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      s += `<rect class="bar" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${Math.max(0, H - padB - y).toFixed(1)}" rx="2"><title>${esc(label)} : ${v}</title></rect>`;
      if (i % 7 === 0 || (i === n - 1 && (n - 1) % 7 >= 4)) s += `<text class="axis" x="${(x + bw * 0.35).toFixed(1)}" y="${H - 6}" text-anchor="middle">${esc(label)}</text>`;
    });
    s += "</svg>";
    return h("div", { html: s });
  }
  function kpi(label, value, sub, href, alert) {
    return h(
      href ? "a" : "div",
      { class: `kpi${href ? " kpi--link" : ""}${alert ? " kpi--alert" : ""}`, href: href || null },
      h("div", { class: "kpi-label" }, label),
      h("div", { class: "kpi-value" }, fmtN(value)),
      sub ? h("div", { class: "kpi-sub" }, sub) : null
    );
  }
  PAGES.dashboard = async (root, params, live) => {
    setTitle("Tableau de bord", [{ label: "Pilotage" }]);
    if (state.limited) {
      root.appendChild(errorCard(MIGRATION_HINT));
      return;
    }
    root.appendChild(loadingCard());
    const o = await rpc("admin_overview");
    if (!live()) return;
    badges.reports = Number(o.reports_open) || 0;
    renderNav(currentNavKey);
    root.innerHTML = "";
    const sum = (arr) => (arr || []).reduce((a, p) => a + (Number(p.n) || 0), 0);
    root.appendChild(
      h(
        "div",
        { class: "grid grid--kpi" },
        kpi("Comptes", o.users_total, `+${fmtN(o.users_new_7d)} cette semaine · +${fmtN(o.users_new_30d)} sur 30 j`, "#/users"),
        kpi("Connectés (7 jours)", o.users_active_7d, `${fmtN(o.users_active_30d)} sur 30 jours`),
        kpi("Ont révisé (7 jours)", o.reviewers_7d, "comptes avec au moins une fiche révisée"),
        kpi("Abonnés actifs", o.subscriptions_active, "actifs ou à l'essai", "#/subscriptions"),
        kpi("Fiches", o.cards_total, "toutes les fiches de tous les comptes"),
        kpi("Boîtes créées", o.boxes_total, "hors boîtes reçues d'une classe ou de la Librairie", "#/boxes"),
        kpi("Collections Librairie", o.collections_total, plural(o.ratings_total, "note", "notes"), "#/library"),
        kpi("Classes", o.classes_total, `${plural(o.class_members_total, "inscription", "inscriptions")} d'élèves`, "#/classes"),
        kpi("Messages (7 jours)", o.messages_7d, "dans les messageries des classes"),
        kpi("Signalements à traiter", o.reports_open, `${fmtN(o.reports_total)} au total`, "#/reports", Number(o.reports_open) > 0)
      )
    );
    root.appendChild(
      h(
        "div",
        { class: "grid grid--2" },
        card("Inscriptions", `30 derniers jours — ${plural(sum(o.signups_by_day), "nouveau compte", "nouveaux comptes")}`, barChart(o.signups_by_day || [], { label: "Inscriptions par jour" })),
        card(
          "Fiches révisées",
          `30 derniers jours, d'après la date de dernière révision de chaque fiche — ${plural(sum(o.reviews_by_day), "fiche", "fiches")}`,
          barChart(o.reviews_by_day || [], { label: "Fiches révisées par jour" })
        )
      )
    );
  };

  /* ================================================================
     Comptes
     ================================================================ */
  const usersQuery = { search: "", sort: "created", offset: 0 };
  function subBadge(status, until) {
    if (!status) return badge("Aucun");
    const expired = until && new Date(until) < new Date();
    if ((status === "active" || status === "trial") && expired) return badge("Échu", "warn");
    switch (status) {
      case "active":
        return badge("Abonné", "ok");
      case "trial":
        return badge("Essai", "accent");
      case "past_due":
        return badge("Impayé", "danger");
      case "canceled":
        return badge("Résilié", "warn");
      case "none":
        return badge("Accès bloqué", "danger");
      default:
        return badge(status);
    }
  }
  PAGES.users = async (root, params, live) => {
    if (params[0]) return userDetailPage(root, params[0], live);
    setTitle("Comptes", [{ label: "Utilisateurs" }]);
    const listWrap = h("div", { class: "card card--flush" });
    const count = h("span", { class: "count" });
    const load = async () => {
      listWrap.innerHTML = "";
      listWrap.appendChild(h("div", { class: "empty" }, "Chargement…"));
      let rows;
      try {
        rows = await rpc("admin_users", { p_search: usersQuery.search, p_limit: PAGE_SIZE, p_offset: usersQuery.offset, p_sort: usersQuery.sort });
      } catch (e) {
        listWrap.innerHTML = "";
        listWrap.appendChild(h("div", { class: "empty form-error" }, e.message));
        return;
      }
      if (!live()) return;
      const total = rows.length ? Number(rows[0].total) : 0;
      count.textContent = plural(total, "compte", "comptes");
      listWrap.innerHTML = "";
      listWrap.appendChild(
        table(
          [
            {
              label: "Compte",
              render: (r) =>
                h(
                  "div",
                  null,
                  h("div", { class: "cell-main" }, personName(r.first_name, r.last_name, r.email), " ", r.is_admin ? badge("Admin", "accent") : null),
                  h("div", { class: "cell-sub" }, r.email)
                ),
            },
            { label: "Usages", render: (r) => (Array.isArray(r.usages) && r.usages.length ? r.usages.map((u) => USAGE_LABELS[u] || u).join(", ") : h("span", { class: "faint" }, "—")) },
            { label: "Inscription", cls: "nowrap", render: (r) => fmtDate(r.created_at) },
            { label: "Dernière connexion", cls: "nowrap", render: (r) => fmtRel(r.last_sign_in_at) },
            { label: "Fiches", cls: "r num", render: (r) => fmtN(r.cards) },
            { label: "Boîtes", cls: "r num", render: (r) => fmtN(r.boxes) },
            {
              label: "Classes",
              cls: "nowrap",
              render: (r) => (Number(r.classes_taught) || Number(r.classes_joined) ? `${r.classes_taught ? `prof ${r.classes_taught}` : ""}${r.classes_taught && r.classes_joined ? " · " : ""}${r.classes_joined ? `élève ${r.classes_joined}` : ""}` : h("span", { class: "faint" }, "—")),
            },
            { label: "Abonnement", render: (r) => subBadge(r.sub_status, r.sub_until) },
          ],
          rows,
          { onRow: (r) => (location.hash = `#/users/${r.user_id}`), empty: usersQuery.search ? "Aucun compte ne correspond à cette recherche." : "Aucun compte." }
        )
      );
      if (total > PAGE_SIZE) {
        listWrap.appendChild(
          pager(total, usersQuery.offset, PAGE_SIZE, (off) => {
            usersQuery.offset = off;
            load();
          })
        );
      }
    };
    const sortSeg = () =>
      seg(
        [
          ["created", "Inscription"],
          ["last_sign_in", "Dernière connexion"],
          ["email", "Email"],
        ],
        usersQuery.sort,
        (v) => {
          usersQuery.sort = v;
          usersQuery.offset = 0;
          segWrap.replaceChildren(sortSeg());
          load();
        }
      );
    const segWrap = h("span", null, sortSeg());
    root.appendChild(
      h(
        "div",
        { class: "toolbar" },
        searchInput(usersQuery.search, "Rechercher un nom ou un email…", (v) => {
          usersQuery.search = v;
          usersQuery.offset = 0;
          load();
        }),
        h("span", { class: "muted" }, "Trier par"),
        segWrap,
        count
      )
    );
    root.appendChild(listWrap);
    await load();
  };

  const SUB_STATUS_OPTIONS = [
    ["active", "Abonné (actif)"],
    ["trial", "Essai"],
    ["canceled", "Résilié"],
    ["past_due", "Impayé"],
    ["none", "Accès bloqué"],
  ];
  const BOX_KIND = { own: ["Créée", null], class: ["Classe", "accent"], library: ["Librairie", "ok"] };
  async function userDetailPage(root, userId, live) {
    setTitle("Compte", [{ label: "Utilisateurs" }, { label: "Comptes", href: "#/users" }]);
    root.appendChild(loadingCard());
    const d = await rpc("admin_user_detail", { p_user: userId });
    if (!live()) return;
    root.innerHTML = "";
    if (!d || !d.user) {
      root.appendChild(errorCard("Compte introuvable."));
      return;
    }
    const u = d.user;
    const meta = u.meta || {};
    const name = personName(meta.first_name, meta.last_name, u.email);
    setTitle(name, [{ label: "Utilisateurs" }, { label: "Comptes", href: "#/users" }]);
    const boxes = d.boxes || [];
    const nCards = boxes.reduce((a, b) => a + (Number(b.cards) || 0), 0);
    root.appendChild(
      h(
        "div",
        { class: "grid grid--kpi" },
        kpi("Fiches", nCards),
        kpi("Boîtes", boxes.length, `${boxes.filter((b) => b.kind === "own").length} créées`),
        kpi("Publications Librairie", (d.collections || []).length),
        kpi("Signalements reçus à traiter", d.reports_received_open, `${fmtN(d.reports_received)} reçus · ${fmtN(d.reports_sent)} envoyés`, null, Number(d.reports_received_open) > 0)
      )
    );
    const usages = Array.isArray(meta.usages) ? meta.usages.map((x) => USAGE_LABELS[x] || x).join(", ") : "";
    const profile = card(
      "Profil",
      null,
      h(
        "dl",
        { class: "dl" },
        h("dt", null, "Nom"),
        h("dd", null, name),
        h("dt", null, "Email"),
        h("dd", null, u.email || "—"),
        h("dt", null, "Usages"),
        h("dd", null, usages || "—"),
        h("dt", null, "Inscrit le"),
        h("dd", null, fmtDateTime(u.created_at)),
        h("dt", null, "Dernière connexion"),
        h("dd", null, `${fmtDateTime(u.last_sign_in_at)}${u.last_sign_in_at ? ` (${fmtRel(u.last_sign_in_at)})` : ""}`),
        h("dt", null, "Dernière révision"),
        h("dd", null, d.last_review ? `${fmtDateTime(d.last_review)} (${fmtRel(d.last_review)})` : "jamais"),
        h("dt", null, "Administrateur"),
        h("dd", null, d.is_admin ? badge("Oui", "accent") : "Non"),
        h("dt", null, "Identifiant"),
        h("dd", { class: "faint", style: { fontSize: "12px" } }, u.id)
      )
    );
    root.appendChild(h("div", { class: "grid grid--2" }, profile, subscriptionCard(u.id, d.subscription)));
    root.appendChild(
      card(
        "Boîtes",
        "Touche une boîte pour voir ses fiches.",
        table(
          [
            { label: "Boîte", render: (b) => h("span", { class: "cell-main" }, b.name) },
            { label: "Type", render: (b) => badge(...(BOX_KIND[b.kind] || [b.kind])) },
            { label: "Fiches", cls: "r num", render: (b) => fmtN(b.cards) },
            { label: "Dans ses révisions", render: (b) => (b.in_revisions ? "Oui" : h("span", { class: "faint" }, "Non")) },
            { label: "Modifiée", cls: "nowrap", render: (b) => fmtDate(b.updated_at) },
          ],
          boxes,
          { onRow: (b) => (location.hash = `#/boxes/${u.id}/${encodeURIComponent(b.id)}`), empty: "Aucune boîte." }
        )
      )
    );
    const taught = d.classes_taught || [];
    const joined = d.classes_joined || [];
    root.appendChild(
      h(
        "div",
        { class: "grid grid--2" },
        card(
          "Classes (enseignant)",
          null,
          table(
            [
              { label: "Classe", render: (k) => h("span", { class: "cell-main" }, k.name) },
              { label: "Code", render: (k) => k.code },
              { label: "Élèves", cls: "r num", render: (k) => fmtN(k.members) },
            ],
            taught,
            { onRow: (k) => (location.hash = `#/classes/${k.id}`), empty: "Aucune classe créée." }
          )
        ),
        card(
          "Classes (élève)",
          null,
          table(
            [
              { label: "Classe", render: (k) => h("span", { class: "cell-main" }, k.name) },
              { label: "Enseignant", render: (k) => k.teacher },
              { label: "Depuis", cls: "nowrap", render: (k) => fmtDate(k.joined_at) },
            ],
            joined,
            { onRow: (k) => (location.hash = `#/classes/${k.id}`), empty: "Membre d'aucune classe." }
          )
        )
      )
    );
    root.appendChild(
      card(
        "Publications dans la Librairie",
        null,
        table(
          [
            { label: "Collection", render: (c) => h("span", { class: "cell-main" }, c.name) },
            { label: "Fiches", cls: "r num", render: (c) => fmtN(c.cards) },
            { label: "Publiée le", cls: "nowrap", render: (c) => fmtDate(c.shared_at) },
          ],
          d.collections || [],
          { onRow: (c) => openCollectionCards(c.id, c.name), empty: "Aucune publication." }
        )
      )
    );
  }
  function subscriptionCard(userId, sub) {
    sub = sub || {};
    const status = h("select", null, h("option", { value: "default" }, "Aucun (règle générale)"), SUB_STATUS_OPTIONS.map(([v, l]) => h("option", { value: v }, l)));
    status.value = sub.status || "default";
    const plan = h("input", { type: "text", value: sub.plan || "", placeholder: "Ex. Librairie — annuel", maxlength: "100" });
    const until = h("input", { type: "date", value: sub.current_period_end ? String(sub.current_period_end).slice(0, 10) : "" });
    const note = h("textarea", { rows: "2", maxlength: "2000", placeholder: "Note interne (facultatif)" });
    note.value = sub.note || "";
    const save = h("button", { type: "button", class: "btn btn--primary" }, "Enregistrer");
    save.addEventListener("click", async () => {
      save.disabled = true;
      try {
        await rpc("admin_set_subscription", {
          p_user: userId,
          p_status: status.value,
          p_plan: plan.value.trim(),
          p_until: until.value ? new Date(`${until.value}T23:59:59`).toISOString() : null,
          p_note: note.value.trim(),
        });
        toast("Abonnement enregistré");
        current.replaceChildren(subBadge(status.value === "default" ? "" : status.value, until.value ? `${until.value}T23:59:59` : null));
      } catch (e) {
        toast(e.message, true);
      }
      save.disabled = false;
    });
    const current = h("span", null, subBadge(sub.status || "", sub.current_period_end));
    return card(
      "Abonnement",
      sub.updated_at ? `Modifié le ${fmtDateTime(sub.updated_at)}${sub.source && sub.source !== "manual" ? ` (source : ${sub.source})` : ""}.` : "Aucun abonnement enregistré pour ce compte.",
      h("div", { style: { marginBottom: "12px" } }, "Statut actuel : ", current),
      h(
        "div",
        { class: "form-row" },
        h("label", { class: "field" }, h("span", null, "Statut"), status),
        h("label", { class: "field" }, h("span", null, "Formule"), plan),
        h("label", { class: "field" }, h("span", null, "Fin de période"), until)
      ),
      h("label", { class: "field", style: { marginTop: "12px" } }, h("span", null, "Note"), note),
      h("div", { style: { marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" } }, save, h("span", { class: "card-hint" }, "« Aucun » : le compte suit la règle générale (page Abonnements). « Accès bloqué » coupe l'accès aux boîtes de la Librairie même quand il est ouvert à tous (pratique pour tester)."))
    );
  }

  /* ================================================================
     Abonnements
     ================================================================ */
  const subsQuery = { status: "all", offset: 0 };
  PAGES.subscriptions = async (root, params, live) => {
    setTitle("Abonnements", [{ label: "Utilisateurs" }]);
    // Règle d'accès (réglage commun de l'appli).
    const policyCard = card("Accès aux boîtes de la Librairie", null, h("p", { class: "muted" }, "Chargement des réglages…"));
    root.appendChild(policyCard);
    const listCard = h("div", { class: "card card--flush" });
    const count = h("span", { class: "count" });
    const segWrap = h("span");
    root.appendChild(h("div", { class: "toolbar" }, h("span", { class: "muted" }, "Afficher"), segWrap, count));
    root.appendChild(listCard);
    root.appendChild(
      h(
        "p",
        { class: "card-hint" },
        "Pour donner ou retirer un abonnement, ouvre la fiche du compte (page Comptes). Le paiement en ligne (Stripe, App Store…), quand il existera, remplira cette liste automatiquement."
      )
    );
    const drawSeg = () =>
      segWrap.replaceChildren(
        seg([["all", "Tous"], ...SUB_STATUS_OPTIONS.map(([v, l]) => [v, l.replace(" (actif)", "")])], subsQuery.status, (v) => {
          subsQuery.status = v;
          subsQuery.offset = 0;
          drawSeg();
          load();
        })
      );
    drawSeg();
    const load = async () => {
      if (state.limited) {
        listCard.replaceChildren(h("div", { class: "empty form-error" }, MIGRATION_HINT));
        return;
      }
      listCard.replaceChildren(h("div", { class: "empty" }, "Chargement…"));
      let rows;
      try {
        rows = await rpc("admin_subscriptions", { p_status: subsQuery.status, p_limit: PAGE_SIZE, p_offset: subsQuery.offset });
      } catch (e) {
        listCard.replaceChildren(h("div", { class: "empty form-error" }, e.message));
        return;
      }
      if (!live()) return;
      const total = rows.length ? Number(rows[0].total) : 0;
      count.textContent = plural(total, "abonnement", "abonnements");
      listCard.replaceChildren(
        table(
          [
            { label: "Compte", render: (r) => h("div", null, h("div", { class: "cell-main" }, r.name), h("div", { class: "cell-sub" }, r.email)) },
            { label: "Statut", render: (r) => subBadge(r.status, r.current_period_end) },
            { label: "Formule", render: (r) => r.plan || h("span", { class: "faint" }, "—") },
            { label: "Fin de période", cls: "nowrap", render: (r) => fmtDate(r.current_period_end) },
            { label: "Source", render: (r) => (r.source === "manual" ? "Manuel" : r.source) },
            { label: "Note", render: (r) => h("span", { class: "cell-sub" }, r.note || "") },
            { label: "Modifié", cls: "nowrap", render: (r) => h("div", null, fmtDate(r.updated_at), h("div", { class: "cell-sub" }, r.updated_by_email || "")) },
          ],
          rows,
          { onRow: (r) => (location.hash = `#/users/${r.user_id}`), empty: "Aucun abonnement dans cette catégorie." }
        )
      );
      if (total > PAGE_SIZE) {
        listCard.appendChild(
          pager(total, subsQuery.offset, PAGE_SIZE, (off) => {
            subsQuery.offset = off;
            load();
          })
        );
      }
    };
    load();
    try {
      await settingsEnsureLoaded();
    } catch (e) {
      policyCard.replaceChildren(h("p", { class: "form-error" }, e.message));
      return;
    }
    if (!live()) return;
    policyCard.replaceChildren(
      h("div", { class: "card-head" }, h("div", null, h("h2", { class: "card-title" }, "Accès aux boîtes de la Librairie"))),
      setRow(
        "Réserver les boîtes de la Librairie aux abonnés",
        switchCtrl(["subscriptionPolicy", "enforce"]),
        "Désactivé : tout compte connecté peut ajouter des boîtes de la Librairie à ses révisions, sauf un compte marqué « Accès bloqué ». Activé : seuls les comptes « Abonné » ou « Essai » (période non échue) le peuvent."
      )
    );
  };

  /* ================================================================
     Administrateurs
     ================================================================ */
  PAGES.admins = async (root, params, live) => {
    setTitle("Administrateurs", [{ label: "Utilisateurs" }]);
    if (state.limited) {
      root.appendChild(errorCard(MIGRATION_HINT));
      return;
    }
    const listCard = h("div", { class: "card card--flush" });
    const email = h("input", { type: "email", placeholder: "email@exemple.fr" });
    const add = h("button", { type: "button", class: "btn btn--primary" }, "Ajouter");
    add.addEventListener("click", async () => {
      const v = email.value.trim();
      if (!v) return;
      if (!(await confirmDialog(`Donner à ${v} l'accès complet à Darwin Admin (comptes, abonnements, réglages communs…) ?`, { okLabel: "Ajouter" }))) return;
      try {
        await rpc("admin_add_admin", { p_email: v });
        email.value = "";
        toast("Administrateur ajouté");
        load();
      } catch (e) {
        toast(e.message, true);
      }
    });
    root.appendChild(
      card(
        "Ajouter un administrateur",
        "Le compte doit déjà exister (créé depuis l'appli Fiches). Un administrateur a accès à toutes les pages de cette appli.",
        h("div", { class: "form-row" }, h("label", { class: "field" }, h("span", null, "Email du compte"), email), add)
      )
    );
    root.appendChild(listCard);
    const load = async () => {
      listCard.replaceChildren(h("div", { class: "empty" }, "Chargement…"));
      let rows;
      try {
        rows = await rpc("admin_list_admins");
      } catch (e) {
        listCard.replaceChildren(h("div", { class: "empty form-error" }, e.message));
        return;
      }
      if (!live()) return;
      listCard.replaceChildren(
        table(
          [
            { label: "Administrateur", render: (r) => h("div", null, h("div", { class: "cell-main" }, r.name || r.email), h("div", { class: "cell-sub" }, r.email)) },
            { label: "Depuis", cls: "nowrap", render: (r) => fmtDate(r.added_at) },
            { label: "Ajouté par", render: (r) => r.added_by_email || h("span", { class: "faint" }, "—") },
            {
              label: "",
              cls: "r",
              render: (r) =>
                h(
                  "button",
                  {
                    type: "button",
                    class: "btn btn--small btn--danger",
                    onclick: async (e) => {
                      e.stopPropagation();
                      const self = state.user && r.user_id === state.user.id;
                      if (!(await confirmDialog(self ? "Retirer TES PROPRES droits d'administrateur ? Tu n'auras plus accès à cette appli." : `Retirer les droits d'administrateur de ${r.email} ?`, { danger: true, okLabel: "Retirer" }))) return;
                      try {
                        await rpc("admin_remove_admin", { p_user: r.user_id });
                        toast("Droits retirés");
                        if (self) location.reload();
                        else load();
                      } catch (err) {
                        toast(err.message, true);
                      }
                    },
                  },
                  "Retirer"
                ),
            },
          ],
          rows
        )
      );
    };
    await load();
  };

  /* ================================================================
     Librairie
     ================================================================ */
  const libQuery = { search: "", offset: 0 };
  function libraryTabs(active) {
    return h(
      "div",
      { class: "tabs" },
      [
        ["collections", "Collections publiées", "#/library"],
        ["packs", "Boîtes toutes prêtes", "#/library/packs"],
        ["taxonomy", "Classement (Excel)", "#/library/taxonomy"],
      ].map(([k, l, href]) => h("a", { href, class: k === active ? "is-active" : null }, l))
    );
  }
  function taxonomyShort(t, level) {
    if (!t || typeof t !== "object" || !Object.keys(t).length) return level || "";
    const parts = [];
    if (t.niveau) parts.push(t.annee ? `${t.niveau.label} (${t.annee.label})` : t.niveau.label);
    if (t.matiere) parts.push(t.matiere.label);
    else if (t.specialite) parts.push(t.specialite.label);
    if (!parts.length) {
      const last = ["matiere", "specialite", "annee", "niveau", "cycle", "categorie"].find((k) => t[k]);
      if (last) parts.push(t[last].label);
    }
    return parts.join(" · ");
  }
  async function openCollectionCards(id, name) {
    const body = h("div", null, h("p", { class: "muted" }, "Chargement…"));
    openModal({ title: name || "Collection", body, wide: true, buttons: [{ label: "Fermer" }] });
    const { data, error } = await client().from("library_collections").select("name, summary, description, cards").eq("id", id).maybeSingle();
    if (error || !data) {
      body.replaceChildren(h("p", { class: "form-error" }, error ? friendlyError(error) : "Collection introuvable (supprimée ?)."));
      return;
    }
    const cards = Array.isArray(data.cards) ? data.cards : [];
    body.replaceChildren(
      data.summary ? h("p", null, h("b", null, data.summary)) : null,
      data.description ? h("p", { class: "muted" }, data.description) : null,
      h("p", { class: "card-hint" }, plural(cards.length, "fiche", "fiches")),
      h(
        "div",
        { class: "cardlist" },
        cards.map((c) => h("div", { class: "cardlist-item" }, h("div", { class: "cardlist-q" }, stripHtml(c.question)), h("div", { class: "cardlist-a" }, stripHtml(c.answer))))
      )
    );
  }
  function stripHtml(s) {
    const d = document.createElement("div");
    d.innerHTML = String(s || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li)>/gi, "\n");
    return (d.textContent || "").trim();
  }
  PAGES.library = async (root, params, live) => {
    const tab = params[0] || "collections";
    setTitle("Librairie", [{ label: "Contenus" }]);
    root.appendChild(libraryTabs(tab));
    if (tab === "packs") return libraryPacksTab(root, live);
    if (tab === "taxonomy") return libraryTaxonomyTab(root, live);
    if (state.limited) {
      root.appendChild(errorCard(MIGRATION_HINT));
      return;
    }
    const listCard = h("div", { class: "card card--flush" });
    const count = h("span", { class: "count" });
    root.appendChild(
      h(
        "div",
        { class: "toolbar" },
        searchInput(libQuery.search, "Rechercher un nom, un auteur, un tag…", (v) => {
          libQuery.search = v;
          libQuery.offset = 0;
          load();
        }),
        count
      )
    );
    root.appendChild(listCard);
    const load = async () => {
      listCard.replaceChildren(h("div", { class: "empty" }, "Chargement…"));
      let rows;
      try {
        rows = await rpc("admin_collections", { p_search: libQuery.search, p_limit: PAGE_SIZE, p_offset: libQuery.offset });
      } catch (e) {
        listCard.replaceChildren(h("div", { class: "empty form-error" }, e.message));
        return;
      }
      if (!live()) return;
      const total = rows.length ? Number(rows[0].total) : 0;
      count.textContent = plural(total, "collection", "collections");
      listCard.replaceChildren(
        table(
          [
            { label: "Collection", render: (r) => h("div", null, h("div", { class: "cell-main" }, r.name), r.summary ? h("div", { class: "cell-sub" }, r.summary) : null) },
            { label: "Auteur", render: (r) => h("div", null, r.owner_name, h("div", { class: "cell-sub" }, r.owner_email)) },
            { label: "Fiches", cls: "r num", render: (r) => fmtN(r.cards) },
            { label: "Classement", render: (r) => taxonomyShort(r.taxonomy, r.level) || h("span", { class: "faint" }, "—") },
            { label: "Note", cls: "nowrap", render: (r) => (Number(r.ratings) ? `${String(r.rating_avg).replace(".", ",")} ★ (${r.ratings})` : h("span", { class: "faint" }, "—")) },
            {
              label: "Signalements",
              render: (r) => (Number(r.reports) ? badge(`${r.reports_open} à traiter / ${r.reports}`, Number(r.reports_open) ? "danger" : null) : h("span", { class: "faint" }, "—")),
            },
            { label: "Publiée", cls: "nowrap", render: (r) => fmtDate(r.shared_at) },
            {
              label: "",
              cls: "r nowrap",
              render: (r) =>
                h(
                  "span",
                  null,
                  h("button", { type: "button", class: "btn btn--small", onclick: (e) => (e.stopPropagation(), openCollectionCards(r.id, r.name)) }, "Fiches"),
                  " ",
                  h(
                    "button",
                    {
                      type: "button",
                      class: "btn btn--small btn--danger",
                      onclick: async (e) => {
                        e.stopPropagation();
                        if (!(await confirmDialog(`Supprimer définitivement « ${r.name} » (par ${r.owner_name}) de la Librairie ? Les comptes qui l'ont déjà ajoutée à leurs révisions la gardent, mais elle ne sera plus mise à jour.`, { danger: true, okLabel: "Supprimer" }))) return;
                        try {
                          await rpc("admin_delete_collection", { p_id: r.id });
                          toast("Collection supprimée");
                          load();
                        } catch (err) {
                          toast(err.message, true);
                        }
                      },
                    },
                    "Supprimer"
                  )
                ),
            },
          ],
          rows,
          { empty: libQuery.search ? "Aucune collection ne correspond." : "Aucune collection publiée." }
        )
      );
      if (total > PAGE_SIZE) {
        listCard.appendChild(
          pager(total, libQuery.offset, PAGE_SIZE, (off) => {
            libQuery.offset = off;
            load();
          })
        );
      }
    };
    await load();
  };

  /* ---- Taxonomie (Excel) ---- */
  function taxonomyStatusText(tax) {
    if (!tax) return "Pas encore lue.";
    if (tax.error) return `Lecture impossible : ${tax.error}`;
    const L = tax.lists || {};
    const n = (k) => (L[k] || []).length;
    return `${n("categories")} catégories, ${n("cycles")} cycles, ${n("niveaux")} niveaux, ${n("annees")} années, ${n("specialites")} spécialités, ${n("matieres")} matières — lu le ${tax.loadedAt ? new Date(tax.loadedAt).toLocaleString("fr-FR") : "?"}.`;
  }
  async function libraryTaxonomyTab(root) {
    const status = h("p", null, "Lecture…");
    const reload = h("button", { type: "button", class: "btn" }, "Relire l'Excel");
    reload.addEventListener("click", async () => {
      status.textContent = "Lecture…";
      status.textContent = taxonomyStatusText(await window.Taxonomy.load(true));
    });
    root.appendChild(
      card(
        "Classement des boîtes (taxonomie)",
        "Le classement (catégorie → cycle → niveau → année / spécialité → matière) est lu dans le fichier Excel data/taxonomie.xlsx du site. Pour le modifier : modifier l'Excel, puis remplacer ce fichier sur le site (même nom). L'appli le relit à chaque ouverture.",
        status,
        reload
      )
    );
    status.textContent = taxonomyStatusText(await window.Taxonomy.load());
  }

  /* ---- Boîtes toutes prêtes (packs/bibliotheque.json) ---- */
  const LEGACY_LEVEL_TO_NIVEAU = { "prépa": "CPGE", iut: "BUT" };
  function normalizeTag(raw) {
    return String(raw || "")
      .replace(/^#+/, "")
      .replace(/[,;]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .slice(0, 40);
  }
  function taxValueFromSelection(sel) {
    const T = window.Taxonomy;
    const tax = T.get();
    const out = {};
    T.FIELDS.forEach((f) => {
      const item = sel && sel[f.key] ? T.findItem(tax, f.key, sel[f.key]) : null;
      if (item) out[f.key] = { id: item.id, label: item.label };
    });
    return out;
  }
  function legacyLevelSelection(level) {
    const T = window.Taxonomy;
    const tax = T.get();
    if (!tax || !level) return {};
    const key = T.norm(level);
    const niveau = T.findByLabel(tax, "niveau", LEGACY_LEVEL_TO_NIVEAU[key] || level);
    return niveau ? T.selectionFromNiveau(tax, niveau.id) : {};
  }
  function packSelection(box) {
    const T = window.Taxonomy;
    const tax = T.get();
    if (!tax || !box) return {};
    const labels = box.taxonomy && typeof box.taxonomy === "object" ? box.taxonomy : {};
    let sel = labels.niveau ? legacyLevelSelection(labels.niveau) : legacyLevelSelection(box.level);
    T.FIELDS.forEach((f) => {
      if (!labels[f.key] || sel[f.key]) return;
      const item = T.options(tax, f.key, sel).find((o) => T.norm(o.label) === T.norm(labels[f.key]));
      if (item) sel = { ...sel, [f.key]: item.id };
    });
    return sel;
  }
  /* Les boîtes toutes prêtes sont publiées au nom de « darwin » (round 51),
     directement dans la Librairie (sans passer par l'organisation d'un
     compte). Une boîte déjà publiée est retrouvée par son id d'origine
     « pack-<clé> » ; sa mise à jour garde l'id de chaque fiche (les comptes
     qui l'ont ajoutée à leurs révisions gardent leur progression). Les fiches
     sont retrouvées par empreinte de leur texte : texte actuel du fichier, ou
     texte précédent (champs `w` = question + réponse, `wq` = question). */
  const PACK_AUTHOR = { first: "darwin", last: "" };
  const PACK_FOLDER_NAMES = ["Boîtes Librairie", "Boîtes Bibliothèque", "Bibliothèque"];
  function packNorm(s) {
    return String(s || "")
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .join("\n")
      .trim();
  }
  function packHash(s) {
    s = packNorm(s);
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  }
  const packQaHash = (q, a) => packHash(`${packNorm(q)}\u0001${packNorm(a)}`);
  function sortedJson(v) {
    if (Array.isArray(v)) return `[${v.map(sortedJson).join(",")}]`;
    if (isObj(v)) return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${sortedJson(v[k])}`).join(",")}}`;
    return JSON.stringify(v === undefined ? null : v);
  }
  /** Fiches d'une collection publiée recalées sur la version du fichier. */
  function mergePackCards(colCards, packCards) {
    const curQA = new Map();
    const curQ = new Map();
    const oldQA = new Map();
    const oldQ = new Map();
    const setOnce = (m, k, i) => {
      if (k && !m.has(k)) m.set(k, i);
    };
    packCards.forEach((p, i) => {
      setOnce(curQA, packQaHash(p.question, p.answer), i);
      setOnce(curQ, packHash(p.question), i);
      setOnce(oldQA, p.w, i);
      setOnce(oldQ, p.wq, i);
    });
    const used = new Set();
    let changed = 0;
    let unmatched = 0;
    const cards = (colCards || []).map((c) => {
      const qa = packQaHash(c.question, c.answer);
      const q = packHash(c.question);
      const i0 = curQA.get(qa);
      if (i0 != null && !used.has(i0)) {
        used.add(i0);
        return c;
      }
      for (const m of [oldQA.get(qa), curQ.get(q), oldQ.get(q)]) {
        if (m == null || used.has(m)) continue;
        used.add(m);
        const p = packCards[m];
        if (p.question === c.question && p.answer === c.answer) return c;
        changed++;
        return { ...c, question: p.question, answer: p.answer };
      }
      unmatched++;
      return c;
    });
    return { cards, changed, unmatched, missing: packCards.length - used.size };
  }
  async function fetchAllRows(build, pageSize) {
    const out = [];
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await build().range(from, from + pageSize - 1);
      if (error) throw new Error(friendlyError(error));
      out.push(...(data || []));
      if (!data || data.length < pageSize) break;
    }
    return out;
  }
  async function libraryPacksTab(root, live) {
    const { data: userData } = await client().auth.getUser();
    const me = userData && userData.user;
    // 1) Boîtes toutes prêtes restées dans l'organisation du compte.
    const orgCard = card(
      "Dans ton organisation",
      "Anciennes copies des boîtes toutes prêtes dans tes propres boîtes (ids « pack-… », importées autrefois pour être publiées). Les retirer ne touche pas à la Librairie.",
      h("p", { class: "muted" }, "Comptage…")
    );
    root.appendChild(orgCard);
    const drawOrg = async () => {
      const body = h("div");
      orgCard.replaceChildren(orgCard.firstChild, body);
      let nBoxes = 0;
      let nCards = 0;
      try {
        const r1 = await client().from("subjects").select("id", { count: "exact", head: true }).eq("owner_id", me.id).eq("deleted", false).like("id", "pack-%");
        const r2 = await client().from("cards").select("id", { count: "exact", head: true }).eq("owner_id", me.id).eq("deleted", false).like("subject", "pack-%");
        if (r1.error || r2.error) throw new Error(friendlyError(r1.error || r2.error));
        nBoxes = r1.count || 0;
        nCards = r2.count || 0;
      } catch (e) {
        body.appendChild(h("p", { class: "form-error" }, e.message));
        return;
      }
      if (!live()) return;
      if (!nBoxes && !nCards) {
        body.appendChild(h("p", { class: "muted" }, "Aucune : ton organisation ne contient plus de boîte toute prête."));
        return;
      }
      const btn = h("button", { type: "button", class: "btn btn--danger" }, "Les retirer de mon organisation");
      const log = h("div", { class: "log", hidden: true });
      btn.addEventListener("click", async () => {
        if (!(await confirmDialog(`Retirer de ton organisation ${plural(nBoxes, "boîte toute prête", "boîtes toutes prêtes")} (${plural(nCards, "fiche", "fiches")}) et leur dossier s'il devient vide ? Ta progression de révision sur ces fiches sera perdue. Les collections publiées dans la Librairie ne changent pas. Conseil : ferme l'appli Fiches sur tes autres appareils pendant l'opération ; elle se mettra à jour à la prochaine ouverture.`, { danger: true, okLabel: "Retirer" }))) return;
        btn.disabled = true;
        log.hidden = false;
        try {
          await removePackBoxesFromOrg(me.id, (t) => (log.textContent += `${t}\n`));
          toast("Boîtes toutes prêtes retirées de ton organisation");
          drawOrg();
        } catch (e) {
          log.textContent += `✗ ${e.message}\n`;
          btn.disabled = false;
        }
      });
      body.append(h("div", { class: "grid grid--kpi" }, kpi("Boîtes", nBoxes), kpi("Fiches", nCards)), btn, log);
    };
    drawOrg();

    // 2) Publication / mise à jour dans la Librairie, au nom de darwin.
    const out = h("div", null, h("p", { class: "muted" }, "Appuie sur « Analyser » pour comparer le fichier avec ce qui est publié."));
    const log = h("div", { class: "log", hidden: true });
    const analyse = h("button", { type: "button", class: "btn btn--primary" }, "Analyser");
    root.appendChild(
      card(
        "Publication dans la Librairie",
        "Le fichier packs/bibliotheque.json du site contient les boîtes toutes prêtes. Elles sont publiées au nom de « darwin ». Une boîte déjà publiée garde sa place et l'identifiant de ses fiches : son nom, son résumé, son classement, ses tags et le texte de ses fiches sont mis à jour.",
        h("div", { class: "toolbar" }, analyse),
        out,
        log
      )
    );
    analyse.addEventListener("click", async () => {
      analyse.disabled = true;
      out.replaceChildren(h("p", { class: "muted" }, "Lecture du fichier, du classement et des collections publiées…"));
      let plan;
      try {
        plan = await buildPackPlan(me);
      } catch (e) {
        out.replaceChildren(h("p", { class: "form-error" }, e.message));
        analyse.disabled = false;
        return;
      }
      analyse.disabled = false;
      if (!live()) return;
      const publishBtn = h("button", { type: "button", class: "btn btn--primary", disabled: !plan.toCreate.length && !plan.toUpdate.length }, "Publier / mettre à jour");
      publishBtn.addEventListener("click", () => runPackPlan(plan, publishBtn, log));
      const parts = [
        h(
          "div",
          { class: "grid grid--kpi" },
          kpi("Boîtes dans le fichier", plan.total),
          kpi("Publiées et à jour", plan.upToDate),
          kpi("À mettre à jour", plan.toUpdate.length, `${plural(plan.cardsChanged, "fiche modifiée", "fiches modifiées")}`),
          kpi("Nouvelles à publier", plan.toCreate.length)
        ),
        plan.cardsUnmatched
          ? h("p", { class: "card-hint" }, `${plural(plan.cardsUnmatched, "fiche publiée", "fiches publiées")} non retrouvée${plan.cardsUnmatched > 1 ? "s" : ""} dans le fichier (modifiée${plan.cardsUnmatched > 1 ? "s" : ""} à la main ?) : laissée${plan.cardsUnmatched > 1 ? "s" : ""} telle${plan.cardsUnmatched > 1 ? "s" : ""} quelle${plan.cardsUnmatched > 1 ? "s" : ""}.`)
          : null,
        plan.cardsMissing
          ? h("p", { class: "card-hint" }, `${plural(plan.cardsMissing, "fiche du fichier", "fiches du fichier")} absente${plan.cardsMissing > 1 ? "s" : ""} des collections déjà publiées : non ajoutée${plan.cardsMissing > 1 ? "s" : ""} (pour ne pas réintroduire une fiche retirée à la main).`)
          : null,
        publishBtn,
      ];
      out.replaceChildren(...parts.filter(Boolean));
    });
  }
  /** Retire du compte les boîtes « pack-… », leurs fiches, puis les dossiers
   *  devenus vides (dossier des boîtes toutes prêtes et ses sous-dossiers). */
  async function removePackBoxesFromOrg(uid, line) {
    const c = client();
    const now = new Date().toISOString();
    const boxes = await fetchAllRows(() => c.from("subjects").select("id, folder_id").eq("owner_id", uid).eq("deleted", false).like("id", "pack-%").order("id"), 1000);
    line(`${boxes.length} boîte(s) à retirer…`);
    for (let i = 0; i < boxes.length; i += 100) {
      const ids = boxes.slice(i, i + 100).map((b) => b.id);
      const r = await c.from("cards").update({ deleted: true, updated_at: now }).eq("owner_id", uid).eq("deleted", false).in("subject", ids);
      if (r.error) throw new Error(friendlyError(r.error));
      const r2 = await c.from("subjects").update({ deleted: true, updated_at: now }).eq("owner_id", uid).in("id", ids);
      if (r2.error) throw new Error(friendlyError(r2.error));
      line(`${Math.min(i + 100, boxes.length)} / ${boxes.length}`);
    }
    // Fiches orphelines éventuelles (boîte déjà retirée).
    const r3 = await c.from("cards").update({ deleted: true, updated_at: now }).eq("owner_id", uid).eq("deleted", false).like("subject", "pack-%");
    if (r3.error) throw new Error(friendlyError(r3.error));
    // Dossiers devenus vides.
    const folders = await fetchAllRows(() => c.from("folders").select("id, name, parent_id").eq("owner_id", uid).eq("deleted", false).order("id"), 1000);
    const liveSubjects = await fetchAllRows(() => c.from("subjects").select("id, folder_id").eq("owner_id", uid).eq("deleted", false).order("id"), 1000);
    const usedFolders = new Set(liveSubjects.map((s) => s.folder_id).filter(Boolean));
    const candidates = new Set(boxes.map((b) => b.folder_id).filter(Boolean));
    folders.filter((f) => PACK_FOLDER_NAMES.includes(f.name)).forEach((f) => candidates.add(f.id));
    const removed = new Set();
    let progress = true;
    while (progress) {
      progress = false;
      for (const f of folders) {
        if (removed.has(f.id) || !candidates.has(f.id)) continue;
        const hasChild = folders.some((x) => x.parent_id === f.id && !removed.has(x.id));
        if (hasChild || usedFolders.has(f.id)) continue;
        const r = await c.from("folders").update({ deleted: true, updated_at: now }).eq("owner_id", uid).eq("id", f.id);
        if (r.error) throw new Error(friendlyError(r.error));
        removed.add(f.id);
        if (f.parent_id) candidates.add(f.parent_id);
        progress = true;
      }
    }
    line(`Terminé : ${boxes.length} boîte(s) et ${removed.size} dossier(s) retirés.`);
  }
  async function buildPackPlan(user) {
    const res = await fetch("../packs/bibliotheque.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Fichier introuvable (HTTP ${res.status}).`);
    const pack = await res.json();
    await window.Taxonomy.load();
    const mine = await fetchAllRows(
      () =>
        client()
          .from("library_collections")
          .select("id, name, source_subject_id, taxonomy, tags, level, summary, description, owner_first_name, owner_last_name, cards")
          .eq("owner_id", user.id)
          .order("id"),
      300
    );
    const plan = { total: 0, upToDate: 0, toUpdate: [], toCreate: [], user, cardsChanged: 0, cardsUnmatched: 0, cardsMissing: 0 };
    (pack.boxes || []).forEach((box) => {
      plan.total++;
      const sid = `pack-${box.key}`;
      const taxonomy = taxValueFromSelection(packSelection(box));
      const tags = Array.isArray(box.tags) ? box.tags.map(normalizeTag).filter(Boolean) : [];
      const packCards = (box.cards || []).map((c) => ({ question: c.question || "", answer: c.answer || "", w: c.w, wq: c.wq }));
      const existing = mine.find((c) => c.source_subject_id === sid) || mine.find((c) => !c.source_subject_id && c.name === box.name);
      if (!existing) {
        if (packCards.length) plan.toCreate.push({ box, taxonomy, tags, sid, packCards });
        return;
      }
      const fields = {};
      const want = {
        name: box.name,
        summary: box.summary || existing.summary || "",
        description: box.description || existing.description || "",
        level: taxonomy.niveau ? taxonomy.niveau.label : box.level || existing.level || "",
        source_subject_id: sid,
        owner_first_name: PACK_AUTHOR.first,
        owner_last_name: PACK_AUTHOR.last,
      };
      Object.keys(want).forEach((k) => {
        if ((existing[k] || "") !== (want[k] || "")) fields[k] = want[k];
      });
      if (Object.keys(taxonomy).length && sortedJson(existing.taxonomy || {}) !== sortedJson(taxonomy)) fields.taxonomy = taxonomy;
      if (tags.length && sortedJson((existing.tags || []).map(normalizeTag)) !== sortedJson(tags)) fields.tags = tags;
      const merged = mergePackCards(existing.cards || [], packCards);
      plan.cardsUnmatched += merged.unmatched;
      plan.cardsMissing += merged.missing;
      if (merged.changed) {
        fields.cards = merged.cards;
        plan.cardsChanged += merged.changed;
      }
      if (Object.keys(fields).length) plan.toUpdate.push({ box, existing, fields });
      else plan.upToDate++;
    });
    return plan;
  }
  async function runPackPlan(plan, btn, log) {
    const n = plan.toCreate.length + plan.toUpdate.length;
    if (!(await confirmDialog(`Publier ${plural(plan.toCreate.length, "nouvelle boîte", "nouvelles boîtes")} et mettre à jour ${plural(plan.toUpdate.length, "boîte", "boîtes")} (${plural(plan.cardsChanged, "fiche modifiée", "fiches modifiées")}) dans la Librairie, au nom de « darwin » ?`, { okLabel: "Publier" }))) return;
    btn.disabled = true;
    log.hidden = false;
    log.textContent = "";
    const line = (t) => {
      log.textContent += `${t}\n`;
      log.scrollTop = log.scrollHeight;
    };
    let ok = 0;
    let fail = 0;
    let done = 0;
    const tasks = [
      ...plan.toUpdate.map((it) => async () => {
        const { error } = await client()
          .from("library_collections")
          .update({ ...it.fields, updated_at: new Date().toISOString() })
          .eq("id", it.existing.id);
        return error ? `${it.box.name} : ${friendlyError(error)}` : null;
      }),
      ...plan.toCreate.map((it) => async () => {
        const row = {
          owner_id: plan.user.id,
          owner_email: plan.user.email || "",
          owner_first_name: PACK_AUTHOR.first,
          owner_last_name: PACK_AUTHOR.last,
          name: it.box.name,
          level: it.taxonomy.niveau ? it.taxonomy.niveau.label : it.box.level || "",
          price_tokens: 0,
          summary: it.box.summary || "",
          description: it.box.description || "",
          source_subject_id: it.sid,
          taxonomy: it.taxonomy,
          tags: it.tags,
          cards: it.packCards.map((c, k) => ({ id: `${it.sid}-${k + 1}`, question: c.question, answer: c.answer })),
        };
        const { error } = await client().from("library_collections").insert(row);
        return error ? `${it.box.name} : ${friendlyError(error)}` : null;
      }),
    ];
    // 4 envois en parallèle.
    let next = 0;
    const worker = async () => {
      while (next < tasks.length) {
        const t = tasks[next++];
        let err;
        try {
          err = await t();
        } catch (e) {
          err = String(e && e.message ? e.message : e);
        }
        if (err) {
          fail++;
          line(`✗ ${err}`);
        } else ok++;
        done++;
        if (done % 50 === 0) line(`${done} / ${n}…`);
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    line(`Terminé : ${ok} réussie(s), ${fail} échec(s).`);
    toast(fail ? `${fail} échec(s) — voir le détail` : "Librairie à jour", !!fail);
  }

  /* ================================================================
     Boîtes
     ================================================================ */
  const boxesQuery = { search: "", kind: "all", offset: 0 };
  const boxNameCache = new Map();
  PAGES.boxes = async (root, params, live) => {
    if (params.length >= 2) return boxCardsPage(root, params[0], params[1], live);
    setTitle("Boîtes", [{ label: "Contenus" }]);
    if (state.limited) {
      root.appendChild(errorCard(MIGRATION_HINT));
      return;
    }
    const listCard = h("div", { class: "card card--flush" });
    const count = h("span", { class: "count" });
    const segWrap = h("span");
    const drawSeg = () =>
      segWrap.replaceChildren(
        seg(
          [
            ["all", "Toutes"],
            ["own", "Créées"],
            ["class", "Reçues d'une classe"],
            ["library", "Prises dans la Librairie"],
          ],
          boxesQuery.kind,
          (v) => {
            boxesQuery.kind = v;
            boxesQuery.offset = 0;
            drawSeg();
            load();
          }
        )
      );
    drawSeg();
    root.appendChild(
      h(
        "div",
        { class: "toolbar" },
        searchInput(boxesQuery.search, "Rechercher une boîte ou un email…", (v) => {
          boxesQuery.search = v;
          boxesQuery.offset = 0;
          load();
        }),
        segWrap,
        count
      )
    );
    root.appendChild(listCard);
    const load = async () => {
      listCard.replaceChildren(h("div", { class: "empty" }, "Chargement…"));
      let rows;
      try {
        rows = await rpc("admin_boxes", { p_search: boxesQuery.search, p_kind: boxesQuery.kind, p_limit: PAGE_SIZE, p_offset: boxesQuery.offset });
      } catch (e) {
        listCard.replaceChildren(h("div", { class: "empty form-error" }, e.message));
        return;
      }
      if (!live()) return;
      const total = rows.length ? Number(rows[0].total) : 0;
      count.textContent = plural(total, "boîte", "boîtes");
      listCard.replaceChildren(
        table(
          [
            { label: "Boîte", render: (r) => h("span", { class: "cell-main" }, r.name) },
            { label: "Propriétaire", render: (r) => h("div", null, r.owner_name, h("div", { class: "cell-sub" }, r.owner_email)) },
            { label: "Type", render: (r) => badge(...(BOX_KIND[r.kind] || [r.kind])) },
            { label: "Fiches", cls: "r num", render: (r) => fmtN(r.cards) },
            { label: "En révision", render: (r) => (r.in_revisions ? "Oui" : h("span", { class: "faint" }, "Non")) },
            { label: "Modifiée", cls: "nowrap", render: (r) => fmtDate(r.updated_at) },
          ],
          rows,
          {
            onRow: (r) => {
              boxNameCache.set(`${r.owner_id}/${r.id}`, { name: r.name, owner: r.owner_name });
              location.hash = `#/boxes/${r.owner_id}/${encodeURIComponent(r.id)}`;
            },
            empty: "Aucune boîte.",
          }
        )
      );
      if (total > PAGE_SIZE) {
        listCard.appendChild(
          pager(total, boxesQuery.offset, PAGE_SIZE, (off) => {
            boxesQuery.offset = off;
            load();
          })
        );
      }
    };
    await load();
  };
  async function boxCardsPage(root, ownerId, boxId, live) {
    const known = boxNameCache.get(`${ownerId}/${boxId}`);
    setTitle(known ? known.name : "Boîte", [{ label: "Contenus" }, { label: "Boîtes", href: "#/boxes" }]);
    root.appendChild(loadingCard());
    const rows = await rpc("admin_box_cards", { p_owner: ownerId, p_box: boxId });
    if (!live()) return;
    root.innerHTML = "";
    root.appendChild(
      h(
        "p",
        { class: "card-hint", style: { margin: "0 0 12px" } },
        known ? `Boîte de ${known.owner} — ` : "",
        plural(rows.length, "fiche", "fiches"),
        rows.length >= 500 ? " (500 premières)" : "",
        " · ",
        h("a", { href: `#/users/${ownerId}` }, "voir le compte")
      )
    );
    root.appendChild(
      h(
        "div",
        { class: "card card--flush" },
        table(
          [
            { label: "Question", render: (c) => h("div", { class: "cardlist-q", style: { fontWeight: 500 } }, stripHtml(c.question)) },
            { label: "Réponse", render: (c) => h("div", { class: "muted", style: { whiteSpace: "pre-wrap" } }, stripHtml(c.answer)) },
            { label: "Révisions", cls: "r num", render: (c) => fmtN(c.review_count) },
            { label: "Dernière révision", cls: "nowrap", render: (c) => fmtRel(c.last_reviewed) },
            { label: "Prochaine", cls: "nowrap", render: (c) => fmtDate(c.due_date) },
          ],
          rows,
          { empty: "Aucune fiche dans cette boîte." }
        )
      )
    );
  }

  /* ================================================================
     Classes
     ================================================================ */
  const classesQuery = { search: "", offset: 0 };
  const classCache = new Map();
  PAGES.classes = async (root, params, live) => {
    if (params[0]) return classDetailPage(root, params[0], live);
    setTitle("Classes", [{ label: "Contenus" }]);
    if (state.limited) {
      root.appendChild(errorCard(MIGRATION_HINT));
      return;
    }
    const listCard = h("div", { class: "card card--flush" });
    const count = h("span", { class: "count" });
    root.appendChild(
      h(
        "div",
        { class: "toolbar" },
        searchInput(classesQuery.search, "Rechercher une classe, un code, un email…", (v) => {
          classesQuery.search = v;
          classesQuery.offset = 0;
          load();
        }),
        count
      )
    );
    root.appendChild(listCard);
    root.appendChild(h("p", { class: "card-hint" }, "Le contenu des messages des classes n'est pas affiché ici (confidentialité) : seulement leur nombre."));
    const load = async () => {
      listCard.replaceChildren(h("div", { class: "empty" }, "Chargement…"));
      let rows;
      try {
        rows = await rpc("admin_classes", { p_search: classesQuery.search, p_limit: PAGE_SIZE, p_offset: classesQuery.offset });
      } catch (e) {
        listCard.replaceChildren(h("div", { class: "empty form-error" }, e.message));
        return;
      }
      if (!live()) return;
      const total = rows.length ? Number(rows[0].total) : 0;
      count.textContent = plural(total, "classe", "classes");
      rows.forEach((r) => classCache.set(r.id, r));
      listCard.replaceChildren(
        table(
          [
            { label: "Classe", render: (r) => h("div", null, h("div", { class: "cell-main" }, r.name), h("div", { class: "cell-sub" }, `Code ${r.invite_code}`)) },
            { label: "Enseignant", render: (r) => h("div", null, r.teacher_name, h("div", { class: "cell-sub" }, r.teacher_email)) },
            { label: "Élèves", cls: "r num", render: (r) => fmtN(r.members) },
            { label: "Boîtes partagées", cls: "r num", render: (r) => fmtN(r.shared_boxes) },
            { label: "Messages", cls: "r num", render: (r) => fmtN(r.messages) },
            { label: "Dernier message", cls: "nowrap", render: (r) => (r.last_message_at ? fmtRel(r.last_message_at) : h("span", { class: "faint" }, "—")) },
            { label: "Créée", cls: "nowrap", render: (r) => fmtDate(r.created_at) },
          ],
          rows,
          { onRow: (r) => (location.hash = `#/classes/${r.id}`), empty: "Aucune classe." }
        )
      );
      if (total > PAGE_SIZE) {
        listCard.appendChild(
          pager(total, classesQuery.offset, PAGE_SIZE, (off) => {
            classesQuery.offset = off;
            load();
          })
        );
      }
    };
    await load();
  };
  async function classDetailPage(root, classId, live) {
    const k = classCache.get(classId);
    setTitle(k ? k.name : "Classe", [{ label: "Contenus" }, { label: "Classes", href: "#/classes" }]);
    root.appendChild(loadingCard());
    const d = await rpc("admin_class_detail", { p_class: classId });
    if (!live()) return;
    root.innerHTML = "";
    if (k) {
      root.appendChild(
        h(
          "div",
          { class: "grid grid--kpi" },
          kpi("Élèves", k.members),
          kpi("Boîtes partagées", k.shared_boxes),
          kpi("Messages", k.messages, k.last_message_at ? `dernier ${fmtRel(k.last_message_at)}` : ""),
          h("a", { class: "kpi kpi--link", href: `#/users/${k.teacher_id}` }, h("div", { class: "kpi-label" }, "Enseignant"), h("div", { style: { fontWeight: 650, marginTop: "6px" } }, k.teacher_name), h("div", { class: "kpi-sub" }, `Code ${k.invite_code}`))
        )
      );
    }
    root.appendChild(
      h(
        "div",
        { class: "grid grid--2" },
        card(
          "Élèves",
          null,
          table(
            [
              { label: "Élève", render: (m) => h("div", null, h("div", { class: "cell-main" }, m.name), h("div", { class: "cell-sub" }, m.email)) },
              { label: "Depuis", cls: "nowrap", render: (m) => fmtDate(m.joined_at) },
            ],
            d.members || [],
            { onRow: (m) => (location.hash = `#/users/${m.user_id}`), empty: "Aucun élève." }
          )
        ),
        card(
          "Boîtes partagées",
          null,
          table(
            [
              { label: "Boîte", render: (b) => h("div", null, h("div", { class: "cell-main" }, b.name), Array.isArray(b.folder_path) && b.folder_path.length ? h("div", { class: "cell-sub" }, b.folder_path.join(" › ")) : null) },
              { label: "Fiches", cls: "r num", render: (b) => fmtN(b.cards) },
              { label: "Partagée", cls: "nowrap", render: (b) => fmtDate(b.shared_at) },
            ],
            d.boxes || [],
            { empty: "Aucune boîte partagée." }
          )
        )
      )
    );
  }

  /* ================================================================
     Signalements
     ================================================================ */
  const reportsQuery = { status: "open", offset: 0 };
  PAGES.reports = async (root, params, live) => {
    setTitle("Signalements", [{ label: "Contenus" }]);
    if (state.limited) {
      root.appendChild(errorCard(MIGRATION_HINT));
      return;
    }
    const list = h("div");
    const count = h("span", { class: "count" });
    const segWrap = h("span");
    const drawSeg = () =>
      segWrap.replaceChildren(
        seg(
          [
            ["open", "À traiter"],
            ["done", "Traités"],
            ["all", "Tous"],
          ],
          reportsQuery.status,
          (v) => {
            reportsQuery.status = v;
            reportsQuery.offset = 0;
            drawSeg();
            load();
          }
        )
      );
    drawSeg();
    root.appendChild(h("div", { class: "toolbar" }, segWrap, count));
    root.appendChild(h("p", { class: "card-hint", style: { marginTop: 0 } }, "C'est l'auteur de la fiche qui traite le signalement depuis l'appli. Cette page sert à suivre ce qui reste en attente."));
    root.appendChild(list);
    const load = async () => {
      list.replaceChildren(loadingCard());
      let rows;
      try {
        rows = await rpc("admin_reports", { p_status: reportsQuery.status, p_limit: PAGE_SIZE, p_offset: reportsQuery.offset });
      } catch (e) {
        list.replaceChildren(errorCard(e.message));
        return;
      }
      if (!live()) return;
      const total = rows.length ? Number(rows[0].total) : 0;
      count.textContent = plural(total, "signalement", "signalements");
      if (!rows.length) {
        list.replaceChildren(h("div", { class: "card empty" }, reportsQuery.status === "open" ? "Aucun signalement en attente." : "Aucun signalement."));
        return;
      }
      list.replaceChildren(
        ...rows.map((r) =>
          h(
            "div",
            { class: "report" },
            h(
              "div",
              { class: "report-head" },
              r.resolved ? badge("Traité", "ok") : badge("À traiter", "danger"),
              badge(r.source_kind === "library" ? "Librairie" : "Classe"),
              h("b", null, r.box_name || "Boîte"),
              h("span", null, "·", " ", fmtDateTime(r.created_at)),
              h("span", null, "·", " de ", h("a", { href: `#/users/${r.reporter_id}` }, r.reporter_name || r.reporter_email), " à ", h("a", { href: `#/users/${r.author_id}` }, r.author_name || r.author_email))
            ),
            h("div", { class: "quote-label" }, "Fiche signalée"),
            h("div", { class: "quote" }, h("b", null, stripHtml(r.card_question)), "\n", stripHtml(r.card_answer)),
            h("div", { class: "quote-label" }, "Message du signaleur"),
            h("div", { class: "quote quote--msg" }, r.message),
            r.resolved && (r.resolved_question || r.resolved_answer)
              ? [h("div", { class: "quote-label" }, `Après correction (${fmtDate(r.resolved_at)})`), h("div", { class: "quote quote--after" }, h("b", null, stripHtml(r.resolved_question)), "\n", stripHtml(r.resolved_answer))]
              : null,
            r.author_reply ? [h("div", { class: "quote-label" }, "Réponse de l'auteur"), h("div", { class: "quote" }, r.author_reply)] : null
          )
        )
      );
      if (total > PAGE_SIZE) {
        list.appendChild(
          pager(total, reportsQuery.offset, PAGE_SIZE, (off) => {
            reportsQuery.offset = off;
            load();
          })
        );
      }
    };
    await load();
  };

  /* ================================================================
     Journal
     ================================================================ */
  const ACTION_LABELS = {
    "subscription.set": "Abonnement modifié",
    "subscription.clear": "Abonnement retiré",
    "admin.add": "Administrateur ajouté",
    "admin.remove": "Administrateur retiré",
    "library.delete": "Collection supprimée",
  };
  const journalQuery = { offset: 0 };
  PAGES.journal = async (root, params, live) => {
    setTitle("Journal", [{ label: "Suivi" }]);
    if (state.limited) {
      root.appendChild(errorCard(MIGRATION_HINT));
      return;
    }
    const listCard = h("div", { class: "card card--flush" });
    root.appendChild(h("p", { class: "card-hint", style: { marginTop: 0 } }, "Actions faites depuis cette appli (abonnements, administrateurs, suppressions dans la Librairie). Les modifications des réglages de l'appli n'y figurent pas (voir Réglages › Technique)."));
    root.appendChild(listCard);
    const load = async () => {
      listCard.replaceChildren(h("div", { class: "empty" }, "Chargement…"));
      let rows;
      try {
        rows = await rpc("admin_audit_list", { p_limit: 100, p_offset: journalQuery.offset });
      } catch (e) {
        listCard.replaceChildren(h("div", { class: "empty form-error" }, e.message));
        return;
      }
      if (!live()) return;
      const total = rows.length ? Number(rows[0].total) : 0;
      const detailText = (r) => {
        const d = r.details || {};
        const parts = [];
        if (d.email) parts.push(d.email);
        if (d.name) parts.push(`« ${d.name} »`);
        if (d.status) parts.push(`statut ${(SUB_STATUS_OPTIONS.find((o) => o[0] === d.status) || [0, d.status])[1]}`);
        if (d.plan) parts.push(d.plan);
        if (d.until) parts.push(`jusqu'au ${fmtDate(d.until)}`);
        return parts.join(" · ");
      };
      listCard.replaceChildren(
        table(
          [
            { label: "Date", cls: "nowrap", render: (r) => fmtDateTime(r.at) },
            { label: "Par", render: (r) => r.admin_email },
            { label: "Action", render: (r) => ACTION_LABELS[r.action] || r.action },
            { label: "Détails", render: (r) => detailText(r) },
          ],
          rows,
          { empty: "Aucune action enregistrée pour l'instant." }
        )
      );
      if (total > 100) {
        listCard.appendChild(
          pager(total, journalQuery.offset, 100, (off) => {
            journalQuery.offset = off;
            load();
          })
        );
      }
    };
    await load();
  };

  /* ================================================================
     Réglages communs de l'appli (table dev_settings_public, « global »)
     ================================================================ */
  const S = { loaded: false, loading: null, base: null, work: null, updatedAt: null, updatedBy: null, timer: null, saving: null, error: null, savedAt: null };
  const DIFF_IGNORED = new Set(["updatedAt", "appPrefs", "appPrefsOwner"]);
  /** Réglages complets (valeurs par défaut comprises) en gardant les
   *  champs que le modèle ne connaît pas (appPrefs…). */
  // Réglages retirés de l'appli : supprimés du serveur au prochain enregistrement.
  const OBSOLETE_KEYS = new Set(["cardScore", "gaugeColors"]);
  function fullFrom(raw) {
    raw = isObj(raw) ? raw : {};
    const out = clone(M.buildDevSettings(raw));
    Object.keys(raw).forEach((k) => {
      if (!(k in out) && !OBSOLETE_KEYS.has(k)) out[k] = clone(raw[k]);
    });
    return out;
  }
  function settingsDiff(base, local, path, out) {
    path = path || [];
    out = out || [];
    const b = isObj(base) ? base : {};
    const l = isObj(local) ? local : {};
    new Set([...Object.keys(b), ...Object.keys(l)]).forEach((key) => {
      if (path.length === 0 && DIFF_IGNORED.has(key)) return;
      const bv = b[key];
      const lv = l[key];
      if (isObj(bv) && isObj(lv)) settingsDiff(bv, lv, path.concat(key), out);
      else if (JSON.stringify(bv) !== JSON.stringify(lv)) out.push([path.concat(key), lv === undefined ? null : lv, lv === undefined]);
    });
    return out;
  }
  function settingsPatch(target, patch) {
    const out = clone(isObj(target) ? target : {});
    patch.forEach(([p, v, del]) => {
      let o = out;
      for (let n = 0; n < p.length - 1; n++) {
        if (!isObj(o[p[n]])) o[p[n]] = {};
        o = o[p[n]];
      }
      if (del) delete o[p[p.length - 1]];
      else o[p[p.length - 1]] = clone(v);
    });
    return out;
  }
  async function fetchSettingsRow() {
    const { data, error } = await client().from("dev_settings_public").select("settings, updated_at, updated_by").eq("id", "global").maybeSingle();
    if (error) throw new Error(friendlyError(error));
    return data;
  }
  function settingsEnsureLoaded(force) {
    if (S.loaded && !force) return Promise.resolve();
    if (S.loading) return S.loading;
    S.loading = (async () => {
      try {
        const row = await fetchSettingsRow();
        S.base = fullFrom(row && row.settings);
        S.work = clone(S.base);
        S.updatedAt = row ? row.updated_at : null;
        S.updatedBy = row ? row.updated_by : null;
        S.loaded = true;
        S.error = null;
        renderSaveState();
        postPreview();
      } finally {
        S.loading = null;
      }
    })();
    return S.loading;
  }
  function settingsPending() {
    return !!(S.loaded && settingsDiff(S.base, S.work).length);
  }
  function renderSaveState() {
    const el = $("#save-state");
    el.classList.remove("is-saving", "is-error");
    if (S.error) {
      el.classList.add("is-error");
      el.textContent = `⚠ ${S.error}`;
    } else if (S.saving || S.timer) {
      el.classList.add("is-saving");
      el.textContent = "Enregistrement…";
    } else if (S.savedAt) {
      el.textContent = `Enregistré pour tous les utilisateurs · ${S.savedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (S.loaded) {
      el.textContent = S.updatedAt ? `À jour · dernière modification ${fmtRel(S.updatedAt)}` : "À jour";
    } else {
      el.textContent = "";
    }
  }
  /** Modifie un réglage : aperçu immédiat, enregistrement peu après. */
  function setValue(path, value) {
    setPath(S.work, path, value);
    postPreview();
    clearTimeout(S.timer);
    S.timer = setTimeout(() => {
      S.timer = null;
      saveSettings();
    }, 800);
    renderSaveState();
  }
  function saveSettings() {
    if (S.saving) return S.saving.then(() => (settingsPending() ? saveSettings() : null));
    S.saving = (async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        const snapshot = clone(S.work);
        const changes = settingsDiff(S.base, snapshot);
        if (!changes.length) break;
        let row;
        try {
          row = await fetchSettingsRow();
        } catch (e) {
          S.error = `enregistrement impossible (${e.message})`;
          break;
        }
        const latest = fullFrom(row && row.settings);
        const merged = settingsPatch(latest, changes);
        merged.updatedAt = new Date().toISOString();
        const now = new Date().toISOString();
        let res;
        if (row) {
          res = await client()
            .from("dev_settings_public")
            .update({ settings: merged, updated_at: now, updated_by: state.user.id })
            .eq("id", "global")
            .eq("updated_at", row.updated_at)
            .select("updated_at");
        } else {
          res = await client().from("dev_settings_public").insert({ id: "global", settings: merged, updated_at: now, updated_by: state.user.id }).select("updated_at");
        }
        if (res.error) {
          S.error = /row-level security|permission|42501/i.test(res.error.message || "")
            ? "ce compte ne peut pas modifier les réglages communs (droits d'administrateur sur le serveur ?)"
            : `enregistrement refusé (${friendlyError(res.error)})`;
          break;
        }
        if (!res.data || !res.data.length) continue; // quelqu'un a écrit entre-temps : on refait la fusion
        const during = settingsDiff(snapshot, S.work);
        S.base = merged;
        S.work = settingsPatch(merged, during);
        S.updatedAt = res.data[0].updated_at || now;
        S.updatedBy = state.user.id;
        S.savedAt = new Date();
        S.error = null;
        if (!during.length) break;
      }
    })().finally(() => {
      S.saving = null;
      renderSaveState();
    });
    renderSaveState();
    return S.saving;
  }
  /** Avant de quitter (déconnexion) : envoie ce qui attend encore. */
  async function settingsFlushBeforeLeave() {
    if (S.timer) {
      clearTimeout(S.timer);
      S.timer = null;
      await saveSettings();
    } else if (S.saving) await S.saving;
    if (settingsPending()) return confirmDialog("Des réglages n'ont pas pu être enregistrés. Quitter quand même ?", { danger: true, okLabel: "Quitter" });
    return true;
  }
  window.addEventListener("beforeunload", (e) => {
    if (S.timer || S.saving || settingsPending()) {
      if (S.timer) {
        clearTimeout(S.timer);
        S.timer = null;
        saveSettings();
      }
      e.preventDefault();
      e.returnValue = "";
    }
  });
  // Retour sur l'onglet : relit le serveur si rien n'est en attente ici.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || !S.loaded || S.timer || S.saving || settingsPending()) return;
    settingsEnsureLoaded(true).then(() => {
      if (currentNavKey.startsWith("settings/") || currentNavKey === "subscriptions") route();
    });
  });

  /* ---------------- Aperçu (l'appli dans un cadre) ---------------- */
  let previewFrame = null;
  let previewRaf = 0;
  let previewNight = false;
  function postPreview() {
    if (!previewFrame || !previewFrame.contentWindow || !S.work) return;
    cancelAnimationFrame(previewRaf);
    previewRaf = requestAnimationFrame(() => {
      try {
        previewFrame.contentWindow.postMessage({ type: "darwin-admin-preview", settings: S.work }, location.origin);
      } catch (e) {
        /* cadre pas encore prêt */
      }
    });
  }
  function previewSend(msg) {
    if (previewFrame && previewFrame.contentWindow) previewFrame.contentWindow.postMessage(msg, location.origin);
  }
  function showPreview(on) {
    const main = $("#main");
    const aside = $("#preview");
    main.classList.toggle("with-preview", on);
    aside.hidden = !on;
    if (!on || previewFrame) return;
    const wrap = h("div", { class: "preview-frame-wrap" });
    previewFrame = h("iframe", { src: "../index.html?preview=1", title: "Aperçu de l'appli Fiches", loading: "eager" });
    previewFrame.addEventListener("load", () => {
      // L'appli se signale prête (message « darwin-preview-ready ») ;
      // envoi aussi ici au cas où.
      setTimeout(postPreview, 300);
    });
    wrap.appendChild(previewFrame);
    const fit = () => {
      const w = wrap.clientWidth;
      if (!w) return;
      const scale = w / 390;
      previewFrame.style.transform = `scale(${scale})`;
      wrap.style.height = `${Math.round(844 * scale)}px`;
    };
    if (window.ResizeObserver) new ResizeObserver(fit).observe(wrap);
    const go = (view, label) => h("button", { type: "button", class: "btn", onclick: () => previewSend({ type: "darwin-admin-goto", view }) }, label);
    const nightBtn = h("button", { type: "button", class: "btn" }, "Mode nuit");
    nightBtn.addEventListener("click", () => {
      previewNight = !previewNight;
      nightBtn.textContent = previewNight ? "Mode jour" : "Mode nuit";
      previewSend({ type: "darwin-admin-night", on: previewNight });
    });
    // Round 57 : deux modes — « Régler » (toucher un élément ouvre ses
    // réglages) et « Naviguer » (l'aperçu se comporte comme l'appli).
    const modeBtn = (mode, label, title) =>
      h("button", { type: "button", class: "mode-btn", "data-mode": mode, title, onclick: () => setInspectMode(mode === "inspect") }, label);
    const modeSwitch = h("div", { class: "preview-mode", role: "group", "aria-label": "Mode de l'aperçu" }, modeBtn("inspect", "✎ Régler", "Toucher un élément ouvre ses réglages"), modeBtn("navigate", "☝ Naviguer", "L'aperçu fonctionne comme l'appli"));
    previewHint = h("p", { class: "preview-hint" });
    aside.append(
      modeSwitch,
      h("div", { class: "preview-bar" }, go("home", "Accueil"), go("review-hub", "Réviser"), go("manage", "Organisation"), go("library", "Librairie"), go("settings", "Réglages"), nightBtn),
      wrap,
      previewHint
    );
    renderInspectMode();
    requestAnimationFrame(fit);
  }
  /* Round 57 : réglage visuel — mode de l'aperçu et élément touché. */
  let inspectMode = (() => {
    try {
      return localStorage.getItem("darwin_admin_inspect") !== "0";
    } catch (e) {
      return true;
    }
  })();
  let previewHint = null;
  let visualPick = null; // { ids, view, label, actionable }
  function renderInspectMode() {
    document.querySelectorAll(".preview-mode .mode-btn").forEach((b) => b.classList.toggle("is-active", (b.dataset.mode === "inspect") === inspectMode));
    if (previewHint) {
      previewHint.textContent = inspectMode
        ? "Mode Régler : touche un élément de l'aperçu pour ouvrir ses réglages. Pour l'utiliser comme dans l'appli (ouvrir une page…) : Alt + clic, le bouton « Utiliser cet élément », ou le mode Naviguer."
        : "Mode Naviguer : l'aperçu fonctionne comme l'appli. Repasse en mode Régler pour toucher un élément et ouvrir ses réglages.";
    }
    previewSend({ type: "darwin-admin-inspect", on: inspectMode });
  }
  function setInspectMode(onMode) {
    inspectMode = !!onMode;
    try {
      localStorage.setItem("darwin_admin_inspect", inspectMode ? "1" : "0");
    } catch (e) {
      /* stockage indisponible */
    }
    renderInspectMode();
  }
  window.addEventListener("message", (e) => {
    if (e.origin !== location.origin || !e.data) return;
    if (e.data.type === "darwin-preview-ready") {
      postPreview();
      if (previewNight) previewSend({ type: "darwin-admin-night", on: true });
      previewSend({ type: "darwin-admin-inspect", on: inspectMode });
    } else if (e.data.type === "darwin-preview-pick" && Array.isArray(e.data.ids)) {
      visualPick = { ids: e.data.ids, view: String(e.data.view || "home"), label: String(e.data.label || ""), actionable: !!e.data.actionable };
      if (currentNavKey === "settings/visual") route();
      else location.hash = "#/settings/visual";
    }
  });

  /* ---------------- Champs de réglage ---------------- */
  function setRow(label, ctrls, sub) {
    return h("div", { class: "set-row" }, h("div", { class: "set-label" }, label, sub ? h("small", null, sub) : null), h("div", { class: "set-ctrl" }, ctrls));
  }
  function parseColor(value) {
    const v = String(value || "");
    if (v === "transparent") return { hex6: "#000000", alpha: 0 };
    if (/^#[0-9a-f]{8}$/i.test(v)) return { hex6: v.slice(0, 7), alpha: Math.round((parseInt(v.slice(7, 9), 16) / 255) * 100) };
    if (/^#[0-9a-f]{6}$/i.test(v)) return { hex6: v, alpha: 100 };
    if (/^#[0-9a-f]{3}$/i.test(v)) return { hex6: `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`, alpha: 100 };
    return { hex6: "#000000", alpha: 100 };
  }
  function buildColor(hex6, alpha) {
    const a = Math.max(0, Math.min(100, Math.round(alpha)));
    if (a >= 100) return hex6.toLowerCase();
    return `${hex6.toLowerCase()}${Math.round((a / 100) * 255).toString(16).padStart(2, "0")}`;
  }
  const COLOR_RE = /^(#[0-9a-f]{6}([0-9a-f]{2})?|transparent)$/i;
  /** Couleur : pastille (sélecteur + opacité) et code hexadécimal. */
  function colorCtrl(path) {
    let value = getPath(S.work, path) || "#000000";
    const fill = h("i");
    const text = h("input", { type: "text", class: "color-text", value, spellcheck: "false", "aria-label": "Code couleur" });
    const paint = () => (fill.style.background = value);
    paint();
    const apply = (v) => {
      value = v;
      text.value = v;
      text.classList.remove("is-invalid");
      paint();
      setValue(path, v);
    };
    text.addEventListener("change", () => {
      const v = text.value.trim();
      if (!COLOR_RE.test(v)) {
        text.classList.add("is-invalid");
        return;
      }
      apply(v.toLowerCase());
    });
    const swatch = h("button", { type: "button", class: "color-swatch", title: "Choisir la couleur" }, fill);
    swatch.addEventListener("click", () => {
      const { hex6, alpha } = parseColor(value);
      const picker = h("input", { type: "color", value: hex6, style: { width: "100%", height: "44px", border: "1px solid #e2e8e4", borderRadius: "8px", padding: "2px", background: "#fff" } });
      const range = h("input", { type: "range", min: "0", max: "100", value: String(alpha), style: { flex: 1 } });
      const pct = h("span", { class: "num", style: { width: "44px", textAlign: "right" } }, `${alpha} %`);
      const big = h("div", { style: { height: "56px", borderRadius: "10px", border: "1px solid #e2e8e4", background: value, marginBottom: "12px" } });
      const update = () => {
        const v = buildColor(picker.value, Number(range.value));
        pct.textContent = `${range.value} %`;
        big.style.background = v;
        apply(v);
      };
      picker.addEventListener("input", update);
      range.addEventListener("input", update);
      openModal({
        title: "Couleur",
        body: h(
          "div",
          null,
          big,
          h("label", { class: "field" }, h("span", null, "Teinte"), picker),
          h("label", { class: "field", style: { marginTop: "12px" } }, h("span", null, "Opacité"), h("div", { style: { display: "flex", gap: "10px", alignItems: "center" } }, range, pct))
        ),
        buttons: [{ label: "OK", primary: true }],
      });
    });
    return h("span", { class: "color-ctrl" }, swatch, text);
  }
  function numCtrl(path, opts) {
    opts = opts || {};
    const input = h("input", { type: "number", class: "num-input", step: String(opts.step || 1), value: String(getPath(S.work, path) ?? "") });
    if (opts.min != null) input.min = String(opts.min);
    if (opts.max != null) input.max = String(opts.max);
    input.addEventListener("input", () => {
      const v = input.value === "" ? NaN : Number(input.value);
      const err = !Number.isFinite(v) ? "Nombre attendu." : opts.validate ? opts.validate(v) : (opts.min != null && v < opts.min) || (opts.max != null && v > opts.max) ? `Entre ${opts.min} et ${opts.max}.` : "";
      input.classList.toggle("is-invalid", !!err);
      input.title = err || "";
      if (opts.onError) opts.onError(err);
      if (err) return;
      setValue(path, v);
    });
    if (opts.label) return h("label", { class: "num-group" }, opts.label, input, opts.unit || null);
    return opts.unit ? h("span", { class: "num-group" }, input, opts.unit) : input;
  }
  function switchCtrl(path, opts) {
    opts = opts || {};
    const cur = getPath(S.work, path);
    const input = h("input", { type: "checkbox", checked: opts.invert ? cur === false : cur === true || (opts.defaultTrue && cur !== false) });
    input.addEventListener("change", () => setValue(path, opts.invert ? !input.checked : input.checked));
    return h("label", { class: "switch" }, input, h("i"));
  }
  function textCtrl(path, placeholder) {
    const input = h("input", { type: "text", class: "text-input", value: getPath(S.work, path) || "", placeholder: placeholder || "" });
    input.addEventListener("input", () => setValue(path, input.value));
    return input;
  }
  function iconCtrl(path) {
    const btn = h("button", { type: "button", class: "icon-pick", title: "Changer l'icône", html: M.iconSvgMarkup(getPath(S.work, path), "") });
    btn.addEventListener("click", () => {
      const current = getPath(S.work, path);
      const grid = h(
        "div",
        { class: "icon-grid" },
        Object.keys(M.ICON_LIBRARY).map((id) =>
          h("button", {
            type: "button",
            class: id === current ? "is-active" : null,
            title: id,
            html: M.iconSvgMarkup(id, ""),
            onclick: () => {
              setValue(path, id);
              btn.innerHTML = M.iconSvgMarkup(id, "");
              closeModal();
            },
          })
        )
      );
      openModal({ title: "Choisir une icône", body: grid, buttons: [{ label: "Annuler" }] });
    });
    return btn;
  }
  /** Bloc de réglages avec bouton « Valeurs d'origine » (remet les chemins donnés). */
  function section(title, hint, resetPaths, ...content) {
    const reset = resetPaths
      ? h(
          "button",
          {
            type: "button",
            class: "btn btn--small btn--ghost",
            onclick: async () => {
              if (!(await confirmDialog(`Revenir aux valeurs d'origine pour « ${title} » ? Ce changement s'applique à tous les utilisateurs.`, { okLabel: "Revenir aux valeurs d'origine" }))) return;
              resetPaths.forEach((p) => setValue(p, clone(getPath(DEF, p))));
              route();
            },
          },
          "Valeurs d'origine"
        )
      : null;
    return h(
      "section",
      { class: "card" },
      h("div", { class: "card-head" }, h("div", null, h("h2", { class: "card-title" }, title), hint ? h("p", { class: "card-hint" }, hint) : null), h("span", { class: "spacer" }), reset),
      ...content
    );
  }
  const dayNightHead = () => h("div", { class: "set-head" }, h("span", null, "Jour"), h("span", null, "Nuit"));
  async function settingsPage(root, live, title, build) {
    setTitle(title, [{ label: "Réglages de l'appli" }]);
    if (!S.loaded) {
      root.appendChild(loadingCard());
      await settingsEnsureLoaded();
      if (!live()) return;
      root.innerHTML = "";
    }
    if (S.error && !S.saving && !S.timer) root.appendChild(h("div", { class: "notice", style: { margin: "0 0 16px" } }, S.error));
    build(root);
  }

  /* ---- Apparence ---- */
  /* Round 52 : réglages devenus sans effet dans l'appli (élément supprimé
     de l'interface) — gardés dans le modèle pour la compatibilité, mais
     plus proposés ici. */
  const OBSOLETE_SETTINGS = {
    bg: ["skipProgramBg"], // bouton « Passer » des révisions conseillées (supprimé)
    shadows: ["duePill"], // pastille « à revoir » (plus affichée depuis le round 47)
  };
  /* ---- Round 57 : réglage visuel ---- */
  const INSPECT_DEFS = M.inspectDefs ? M.inspectDefs() : [];
  const INSPECT_BY_ID = new Map(INSPECT_DEFS.map((d) => [d.id, d]));
  function inspectControl(c, path) {
    if (c.c === "c") return colorCtrl(path);
    if (c.c === "n") return numCtrl(path, c.opts || {});
    if (c.c === "s") return switchCtrl(path, c.opts || {});
    if (c.c === "i") return iconCtrl(path);
    if (c.c === "t") return textCtrl(path);
    return null;
  }
  function inspectSection(def) {
    const hasNight = def.controls.some((c) => c.night);
    const resetPaths = [];
    def.controls.forEach((c) => {
      resetPaths.push(c.p);
      if (c.night) resetPaths.push(c.night);
    });
    // Réglage sans valeur de nuit dans un bloc jour / nuit : le champ va
    // dans la colonne « Jour » (la colonne « Nuit » reste vide).
    const spacer = (c) => {
      const ghost = inspectControl(c, c.p);
      return h("span", { class: "ctrl-ghost", "aria-hidden": "true" }, ghost);
    };
    const rows = def.controls.map((c) =>
      setRow(
        c.label,
        c.night ? [inspectControl(c, c.p), inspectControl(c, c.night)] : hasNight ? [inspectControl(c, c.p), spacer(c)] : inspectControl(c, c.p),
        hasNight && !c.night ? "Même valeur le jour et la nuit" : null
      )
    );
    const hint =
      def.kind === "bg" || def.kind === "text" || def.kind === "shadow"
        ? "Réglage commun à tous les éléments de ce type dans l'appli."
        : null;
    return section(def.title, hint, resetPaths, hasNight ? dayNightHead() : null, rows);
  }
  function robotHelpSection(view) {
    const def = M.DEFAULT_HELP_MESSAGES_BY_VIEW[view];
    if (!def) return null;
    const current = S.work.helpMessagesByView[view] || [];
    const ta = h("textarea", { rows: String(Math.max(3, current.length + 1)) });
    ta.value = current.join("\n");
    ta.addEventListener("input", () => {
      const lines = ta.value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      setValue(["helpMessagesByView", view], lines.length ? lines : clone(def));
    });
    return section(
      `Bulle d'aide du robot — ${M.HELP_VIEW_LABELS[view] || view}`,
      "Un message par ligne : le robot affiche le premier, puis « Suite » fait défiler les suivants. Vide = texte d'origine.",
      [["helpMessagesByView", view]],
      h("div", { class: "help-row" }, ta)
    );
  }
  PAGES["settings/visual"] = (root, params, live) =>
    settingsPage(root, live, "Réglage visuel", (root) => {
      if (!visualPick) {
        root.appendChild(
          h(
            "section",
            { class: "card visual-empty" },
            h("h2", { class: "card-title" }, "Touche un élément dans l'aperçu"),
            h(
              "p",
              { class: "card-hint" },
              "En mode « Régler » (au-dessus de l'aperçu), toucher n'importe quel élément de l'appli affiche ici tous ses réglages : couleurs (jour / nuit, avec transparence), textes, ombres, position, taille, icône, et la bulle d'aide du robot de la page. Les modifications s'affichent tout de suite dans l'aperçu et sont enregistrées pour tous les utilisateurs."
            ),
            h(
              "p",
              { class: "card-hint" },
              "Pour aller sur une autre page de l'aperçu : Alt + clic sur un bouton, ou bouton « Utiliser cet élément » après l'avoir touché, ou mode « Naviguer », ou les raccourcis Accueil / Réviser / Organisation… au-dessus de l'aperçu."
            )
          )
        );
        return;
      }
      const pick = visualPick;
      const defs = pick.ids.map((id) => INSPECT_BY_ID.get(id)).filter(Boolean);
      const useBtn = pick.actionable
        ? h("button", { type: "button", class: "btn btn--primary", onclick: () => previewSend({ type: "darwin-admin-activate" }) }, "Utiliser cet élément ▶")
        : null;
      root.appendChild(
        h(
          "section",
          { class: "card visual-head" },
          h("div", { class: "visual-head-row" }, h("div", null, h("div", { class: "visual-label" }, `« ${pick.label} »`), h("div", { class: "card-hint" }, `Page : ${M.HELP_VIEW_LABELS[pick.view] || (pick.view === "home" ? "Accueil" : pick.view)}`)), h("span", { class: "spacer" }), useBtn),
          useBtn ? h("p", { class: "card-hint visual-tip" }, "« Utiliser cet élément » fait comme un toucher dans l'appli (ouvrir sa page…). Raccourci : Alt + clic dans l'aperçu.") : null
        )
      );
      if (!defs.length) root.appendChild(h("div", { class: "notice", style: { margin: "0 0 16px" } }, "Pas de réglage propre à cet élément. Voici la bulle d'aide de la page ; touche un élément voisin ou son conteneur pour d'autres réglages."));
      const MAIN = 4;
      defs.slice(0, MAIN).forEach((d) => root.appendChild(inspectSection(d)));
      if (defs.length > MAIN) {
        const more = h("details", { class: "visual-more" }, h("summary", null, `Réglages des conteneurs de cet élément (${defs.length - MAIN})`));
        defs.slice(MAIN).forEach((d) => more.appendChild(inspectSection(d)));
        root.appendChild(more);
      }
      const help = robotHelpSection(pick.view);
      if (help) root.appendChild(help);
    });

  PAGES["settings/appearance"] = (root, params, live) =>
    settingsPage(root, live, "Apparence", (root) => {
      root.appendChild(
        section(
          "Couleurs des notes",
          "Couleur de chaque note (icônes des boutons d'évaluation, statistiques…) et fond des quatre boutons.",
          [["ratingColors"], ["nightColors", "ratingColors"], ["ratingBtnBgColor"], ["nightColors", "ratingBtnBgColor"]],
          dayNightHead(),
          ["again", "hard", "good", "easy"].map((k) => setRow(M.REVISION_ALGO_RATING_LABELS[k] || M.RATING_COLORS_TITLES[k], [colorCtrl(["ratingColors", k]), colorCtrl(["nightColors", "ratingColors", k])])),
          setRow("Fond des boutons (les 4)", [colorCtrl(["ratingBtnBgColor"]), colorCtrl(["nightColors", "ratingBtnBgColor"])])
        )
      );
      root.appendChild(
        section(
          "Couleurs des fonds",
          null,
          [["bgColors"], ["nightColors", "bgColors"]],
          dayNightHead(),
          M.BG_COLORS_ORDER.filter((k) => !OBSOLETE_SETTINGS.bg.includes(k)).map((k) => setRow(M.BG_COLORS_TITLES[k] || k, [colorCtrl(["bgColors", k]), colorCtrl(["nightColors", "bgColors", k])]))
        )
      );
      root.appendChild(
        section(
          "Couleurs des textes",
          null,
          [["textColorsSet"], ["nightColors", "textColorsSet"]],
          dayNightHead(),
          M.TEXT_COLORS_SET_ORDER.map((k) => setRow(M.TEXT_COLORS_SET_TITLES[k] || k, [colorCtrl(["textColorsSet", k]), colorCtrl(["nightColors", "textColorsSet", k])]))
        )
      );
      // Round 56 : blocs de classement (sélecteurs en cascade) — une seule
      // couleur par page, et une opacité par niveau de bloc (mélange avec
      // le fond de la page) qui recrée le dégradé.
      [
        ["library", "Blocs de classement — page Librairie", "Filtres de classement de la Librairie : une couleur, puis l'opacité de chaque niveau (0 % = fond de la page, 100 % = couleur pleine)."],
        ["other", "Blocs de classement — autres pages", "Classer une boîte, publier dans la Librairie, filtres de Mes créations."],
      ].forEach(([k, title, hint]) => {
        const pct = (path) => numCtrl(path, { min: 0, max: 100, unit: "%" });
        root.appendChild(
          section(
            title,
            hint,
            [["taxTint", k], ["nightColors", "taxTint", k]],
            dayNightHead(),
            setRow("Couleur", [colorCtrl(["taxTint", k, "color"]), colorCtrl(["nightColors", "taxTint", k, "color"])]),
            Array.from({ length: M.TAX_LEVELS }, (_, i) =>
              setRow(`Opacité niveau ${i + 1}${i === 0 ? " (catégorie)" : ""}`, [pct(["taxTint", k, "alphas", i]), pct(["nightColors", "taxTint", k, "alphas", i])])
            )
          )
        );
      });
      // Round 56 : couleurs des cycles — fond de la Librairie quand un
      // cycle est choisi, liseré de chaque boîte (mêmes couleurs que le site).
      root.appendChild(
        section(
          "Couleurs des cycles (Librairie)",
          "Liseré des boîtes de la Librairie et fond de la page quand un cycle est choisi dans les filtres. Mêmes couleurs que le site web.",
          [["cycleColors"], ["libraryCycleBgPct"], ["nightColors", "libraryCycleBgPct"]],
          M.CYCLE_COLOR_KEYS.map((k) => setRow(M.CYCLE_COLOR_TITLES[k], colorCtrl(["cycleColors", k]))),
          dayNightHead(),
          setRow("Intensité du fond de page", [numCtrl(["libraryCycleBgPct"], { min: 0, max: 100, unit: "%" }), numCtrl(["nightColors", "libraryCycleBgPct"], { min: 0, max: 100, unit: "%" })], "Part de la couleur du cycle dans le fond")
        )
      );
      root.appendChild(
        section(
          "Effets d'ombrage",
          "Ombre portée sous chaque type d'élément.",
          [["shadows"]],
          Object.keys(M.SHADOW_ELEMENTS).filter((k) => !OBSOLETE_SETTINGS.shadows.includes(k)).map((k) => setRow(M.SHADOW_ELEMENTS[k].title, switchCtrl(["shadows", k], { defaultTrue: true })))
        )
      );
    });

  /* ---- Icônes ---- */
  const NAV_ICON_TITLES = {
    boxes: "Mes boîtes",
    review: "Réviser",
    manage: "Organiser mes boîtes de révision",
    stats: "Statistiques",
    settings: "Réglages",
    addCard: "Ajouter une fiche",
    calendar: "Calendrier",
    library: "Librairie",
    creations: "Créer mes propres boîtes de révision",
    reports: "Signalements",
  };
  PAGES["settings/icons"] = (root, params, live) =>
    settingsPage(root, live, "Icônes", (root) => {
      root.appendChild(
        section(
          "Boutons de la page d'accueil",
          null,
          [["navIcons"]],
          Object.keys(M.DEFAULT_NAV_ICONS)
            .filter((k) => k !== "dev" && k !== "addCard")
            .map((k) => setRow(NAV_ICON_TITLES[k] || M.HOME_LAYOUT_TITLES[k] || k, iconCtrl(["navIcons", k])))
        )
      );
      root.appendChild(
        section(
          "Boutons d'évaluation",
          null,
          [["ratingIcons"]],
          Object.keys(M.DEFAULT_RATING_ICONS).map((k) => setRow(M.REVISION_ALGO_RATING_LABELS[k] || k, iconCtrl(["ratingIcons", k])))
        )
      );
      root.appendChild(
        section(
          "Icônes de la fiche",
          null,
          [["iconBank"]],
          [
            ["edit", "Éditer"],
            ["construction", "Signaler"],
            ["undo", "Annuler"],
          ].map(([k, l]) => setRow(l, iconCtrl(["iconBank", k])))
        )
      );
      root.appendChild(
        section(
          "Icônes de la page Organisation",
          null,
          [["orgIconBank"]],
          [
            ["orgRename", "Renommer"],
            ["orgMove", "Déplacer"],
            ["orgDelete", "Supprimer"],
            ["orgBoite", "Icône des boîtes"],
          ].map(([k, l]) => setRow(l, iconCtrl(["orgIconBank", k])))
        )
      );
    });

  /* ---- Page d'accueil ---- */
  PAGES["settings/home"] = (root, params, live) =>
    settingsPage(root, live, "Page d'accueil", (root) => {
      root.appendChild(
        section(
          "Disposition des boutons",
          "Position X/Y du centre de chaque bouton rond, en % de la largeur/hauteur de la zone d'accueil (s'adapte à chaque écran), et diamètre en pixels.",
          [["homeLayout"]],
          Object.keys(M.DEFAULT_HOME_LAYOUT)
            .filter((k) => !M.HOME_LAYOUT_RETIRED.includes(k))
            .map((k) =>
              setRow(M.HOME_LAYOUT_TITLES[k] || k, [
                numCtrl(["homeLayout", k, "x"], { step: 0.1, label: "X", unit: "%" }),
                numCtrl(["homeLayout", k, "y"], { step: 0.1, label: "Y", unit: "%" }),
                numCtrl(["homeLayout", k, "d"], { step: 1, min: 20, max: 400, label: "Ø", unit: "px" }),
              ])
            )
        )
      );
      root.appendChild(
        section(
          "Logo robot",
          "Le robot en haut de la page d'accueil et en haut des autres pages.",
          [["homeLogo"], ["bodyLogo"]],
          setRow("Accueil — position et taille", [
            numCtrl(["homeLogo", "x"], { step: 0.1, label: "X", unit: "%" }),
            numCtrl(["homeLogo", "y"], { step: 0.1, label: "Y", unit: "%" }),
            numCtrl(["homeLogo", "size"], { min: 10, max: 400, label: "Taille", unit: "px" }),
          ]),
          setRow("Accueil — ombre sous le logo", switchCtrl(["homeLogo", "shadow"])),
          setRow("Autres pages — taille", numCtrl(["bodyLogo", "size"], { min: 10, max: 300, unit: "px" })),
          setRow("Autres pages — ombre sous le logo", switchCtrl(["bodyLogo", "shadow"]))
        )
      );
      root.appendChild(
        section(
          "Logo darwin",
          "Affiché en bas de l'accueil (et en petit dans le bandeau du haut, même couleur).",
          [["darwinLogo"]],
          setRow("Position et taille", [
            numCtrl(["darwinLogo", "x"], { step: 0.1, label: "X", unit: "%" }),
            numCtrl(["darwinLogo", "y"], { step: 0.1, label: "Y", unit: "%" }),
            numCtrl(["darwinLogo", "size"], { min: 10, max: 400, label: "Taille", unit: "px" }),
          ]),
          setRow("Couleur", colorCtrl(["darwinLogo", "color"])),
          setRow("Ombre sous le logo", switchCtrl(["darwinLogo", "shadow"]))
        )
      );
      root.appendChild(
        section(
          "Texte sous le logo darwin",
          "Vide = pas de texte.",
          [["darwinText"]],
          setRow("Texte", textCtrl(["darwinText", "content"], "Ex. Fiches by darwin")),
          setRow("Position et taille", [
            numCtrl(["darwinText", "x"], { step: 0.1, label: "X", unit: "%" }),
            numCtrl(["darwinText", "y"], { step: 0.1, label: "Y", unit: "%" }),
            numCtrl(["darwinText", "size"], { min: 6, max: 60, label: "Taille", unit: "px" }),
          ])
        )
      );
    });

  /* ---- Révision ---- */
  PAGES["settings/review"] = (root, params, live) =>
    settingsPage(root, live, "Révision", (root) => {
      root.appendChild(
        section(
          "Disposition de la page de révision",
          "Dimensions et positions en % de l'écran (gabarit 390 × 844).",
          [["reviewLayout"]],
          M.REVIEW_LAYOUT_FIELDS.map((f) =>
            setRow(f.title, numCtrl(["reviewLayout", f.key], { step: f.step || 1, min: 0, unit: f.unit }))
          )
        )
      );
      // Algorithme : tableau 4 paramètres × 4 boutons, avec contrôles.
      const algoErr = h("p", { class: "algo-error", hidden: true });
      const algoTable = h(
        "table",
        { class: "algo-table" },
        h("thead", null, h("tr", null, h("th", null, "Paramètre"), M.REVISION_ALGO_RATING_ORDER.map((k) => h("th", null, M.REVISION_ALGO_RATING_LABELS[k])))),
        h(
          "tbody",
          null,
          M.REVISION_ALGO_FIELD_DEFS.map((f) =>
            h(
              "tr",
              null,
              h("td", null, f.title),
              M.REVISION_ALGO_RATING_ORDER.map((rk, idx) =>
                h(
                  "td",
                  null,
                  numCtrl(["revisionAlgo", f.key, idx], {
                    step: Number(f.step),
                    validate: (v) => M.revisionAlgoValueError(S.work.revisionAlgo, f.key, idx, v),
                    onError: (err) => {
                      algoErr.hidden = !err;
                      algoErr.textContent = err ? `${M.REVISION_ALGO_RATING_LABELS[rk]} : ${err} (non enregistré)` : "";
                    },
                  })
                )
              )
            )
          )
        )
      );
      root.appendChild(
        section(
          "Algorithme de révision",
          "Délais en minutes. Mode fond : NDI = (DD − TE) + TE × COEF_FOND, borné entre PLANCHER_FOND et PLAFOND_FOND. Mode sprint (boîte liée à une échéance à venir) : NDI = mini(D_P_ECH − D_P_ECH / COEF_SPRINT ; NDI fond), D_P_ECH comptée jusqu'à 8 h le jour de l'échéance la plus proche (30 min le jour même).",
          [["revisionAlgo"]],
          h("div", { class: "table-wrap" }, algoTable),
          algoErr
        )
      );
      root.appendChild(
        section(
          "Jauge des boîtes (4 couleurs)",
          "Part des fiches selon leur dernière note (jamais notée = « Je ne sais pas »).",
          [["persGaugeColors"]],
          M.PERS_GAUGE_ZONE_ORDER.map((k) => setRow(M.PERS_GAUGE_ZONE_LABELS[k], colorCtrl(["persGaugeColors", k])))
        )
      );
      root.appendChild(
        section(
          "Infos sous les boutons d'évaluation",
          "Pendant la révision, sous les quatre boutons : « Délai précédent » et, pour chaque note, le délai avant la prochaine interrogation.",
          [["reviewInfo"]],
          setRow("Masquer ces délais", switchCtrl(["reviewInfo", "hideDelays"]))
        )
      );
    });

  /* ---- Messages du robot ---- */
  const robotQuery = { search: "" };
  PAGES["settings/robot"] = (root, params, live) =>
    settingsPage(root, live, "Messages du robot", (root) => {
      const keys = Object.keys(M.DEFAULT_HELP_MESSAGES_BY_VIEW).filter((k) => k !== "dev");
      const list = h("div");
      const draw = () => {
        const q = robotQuery.search.trim().toLowerCase();
        list.replaceChildren(
          ...keys
            .filter((k) => {
              if (!q) return true;
              const label = (M.HELP_VIEW_LABELS[k] || k).toLowerCase();
              const text = (S.work.helpMessagesByView[k] || []).join(" ").toLowerCase();
              return label.includes(q) || k.includes(q) || text.includes(q);
            })
            .map((k) => {
              const current = S.work.helpMessagesByView[k] || [];
              const def = M.DEFAULT_HELP_MESSAGES_BY_VIEW[k] || [];
              const modified = JSON.stringify(current) !== JSON.stringify(def);
              const ta = h("textarea", { rows: String(Math.max(2, current.length + 1)) });
              ta.value = current.join("\n");
              const tag = h("span", { class: "tag-modified", hidden: !modified }, "modifié");
              const resetBtn = h("button", { type: "button", class: "btn btn--small btn--ghost", hidden: !modified }, "Texte d'origine");
              ta.addEventListener("input", () => {
                const lines = ta.value
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean);
                setValue(["helpMessagesByView", k], lines.length ? lines : clone(def));
                const mod = JSON.stringify(lines.length ? lines : def) !== JSON.stringify(def);
                tag.hidden = !mod;
                resetBtn.hidden = !mod;
              });
              resetBtn.addEventListener("click", () => {
                setValue(["helpMessagesByView", k], clone(def));
                ta.value = def.join("\n");
                tag.hidden = true;
                resetBtn.hidden = true;
              });
              return h(
                "div",
                { class: "help-row" },
                h("div", { class: "help-row-head" }, h("b", null, M.HELP_VIEW_LABELS[k] || k), h("code", null, k), tag, h("span", { class: "spacer", style: { flex: 1 } }), resetBtn),
                ta
              );
            })
        );
        if (!list.children.length) list.appendChild(h("div", { class: "empty" }, "Aucune page ne correspond."));
      };
      root.appendChild(
        h(
          "div",
          { class: "toolbar" },
          searchInput(robotQuery.search, "Rechercher une page ou un texte…", (v) => {
            robotQuery.search = v;
            draw();
          })
        )
      );
      root.appendChild(
        h(
          "section",
          { class: "card" },
          h("div", { class: "card-head" }, h("div", null, h("h2", { class: "card-title" }, "Bulle d'aide de chaque page"), h("p", { class: "card-hint" }, "Un message par ligne : le robot affiche le premier, puis le bouton « Suite » fait défiler les suivants. Laisser vide = texte d'origine."))),
          list
        )
      );
      draw();
    });

  /* ---- Technique ---- */
  PAGES["settings/tech"] = (root, params, live) =>
    settingsPage(root, live, "Technique", (root) => {
      root.appendChild(
        section(
          "Zoom automatique (téléphones)",
          "Sur un téléphone en mode portrait, la page est dessinée pour cette largeur puis agrandie ou réduite pour remplir l'écran. 390 = réglage d'origine ; plus petit = tout paraît plus gros ; 0 = désactivé. S'applique à tous les appareils.",
          [["autoZoom"]],
          setRow("Largeur de référence", numCtrl(["autoZoom", "refWidth"], { min: 0, max: 1000, unit: "px" }))
        )
      );
      const fileInput = h("input", { type: "file", accept: "application/json,.json", hidden: true });
      fileInput.addEventListener("change", async () => {
        const f = fileInput.files && fileInput.files[0];
        fileInput.value = "";
        if (!f) return;
        let parsed;
        try {
          parsed = JSON.parse(await f.text());
        } catch (e) {
          toast("Fichier illisible (JSON attendu).", true);
          return;
        }
        if (!isObj(parsed)) {
          toast("Fichier illisible (JSON attendu).", true);
          return;
        }
        if (!(await confirmDialog("Remplacer TOUS les réglages communs par ceux de ce fichier ? Ils s'appliquent tout de suite à tous les utilisateurs.", { danger: true, okLabel: "Restaurer" }))) return;
        const next = fullFrom(parsed);
        settingsDiff(S.work, next).forEach(([p, v, del]) => (del ? null : setPath(S.work, p, clone(v))));
        setValue(["updatedAt"], new Date().toISOString());
        toast("Réglages restaurés");
        route();
      });
      root.appendChild(
        card(
          "Sauvegarde des réglages",
          "Télécharge une copie de tous les réglages communs (couleurs, icônes, disposition, algorithme, messages…) pour pouvoir y revenir plus tard.",
          h(
            "div",
            { class: "toolbar", style: { marginBottom: 0 } },
            h(
              "button",
              {
                type: "button",
                class: "btn",
                onclick: () => {
                  const blob = new Blob([JSON.stringify(S.work, null, 2)], { type: "application/json" });
                  const a = h("a", { href: URL.createObjectURL(blob), download: `fiches-reglages-${new Date().toISOString().slice(0, 10)}.json` });
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => (URL.revokeObjectURL(a.href), a.remove()), 1000);
                },
              },
              "Télécharger (JSON)"
            ),
            h("button", { type: "button", class: "btn", onclick: () => fileInput.click() }, "Restaurer depuis un fichier…"),
            fileInput
          )
        )
      );
      const who = h("span", null, S.updatedBy ? (state.user && S.updatedBy === state.user.id ? "toi" : S.updatedBy) : "—");
      root.appendChild(
        card(
          "État des réglages communs",
          "Les réglages sont enregistrés sur le serveur (table dev_settings_public) et appliqués à toutes les installations de l'appli, en direct.",
          h("dl", { class: "dl" }, h("dt", null, "Dernière modification"), h("dd", null, S.updatedAt ? `${fmtDateTime(S.updatedAt)} (${fmtRel(S.updatedAt)})` : "—"), h("dt", null, "Par"), h("dd", null, who)),
          h(
            "div",
            { style: { marginTop: "12px" } },
            h(
              "button",
              {
                type: "button",
                class: "btn",
                onclick: async () => {
                  if (settingsPending() && !(await confirmDialog("Des modifications sont encore en cours d'envoi. Recharger quand même ?", { danger: true, okLabel: "Recharger" }))) return;
                  await settingsEnsureLoaded(true);
                  toast("Réglages rechargés depuis le serveur");
                  route();
                },
              },
              "Recharger depuis le serveur"
            )
          )
        )
      );
      if (!state.limited && S.updatedBy && state.user && S.updatedBy !== state.user.id) {
        rpc("admin_list_admins")
          .then((admins) => {
            const a = (admins || []).find((x) => x.user_id === S.updatedBy);
            if (a) who.textContent = a.email;
          })
          .catch(() => {});
      }
      const cfg = window.FICHES_CONFIG || {};
      const snippet = `window.FICHES_CONFIG = {\n  supabaseUrl: ${JSON.stringify(cfg.supabaseUrl || "")},\n  supabaseAnonKey: ${JSON.stringify(cfg.supabaseAnonKey || "")},\n};\n`;
      root.appendChild(
        card(
          "Configuration du serveur",
          "Contenu du fichier js/config.js (serveur intégré à l'appli). La clé « anon » est faite pour être publique : ce sont les règles de sécurité du serveur qui protègent les données.",
          h("pre", { class: "code" }, snippet),
          h(
            "button",
            {
              type: "button",
              class: "btn btn--small",
              onclick: async () => {
                try {
                  await navigator.clipboard.writeText(snippet);
                  toast("Copié");
                } catch (e) {
                  toast("Copie impossible : sélectionne le texte à la main.", true);
                }
              },
            },
            "Copier"
          )
        )
      );
    });

  boot();
})();
