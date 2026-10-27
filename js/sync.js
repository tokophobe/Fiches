/**
 * Synchronisation multi-appareils via Supabase.
 *
 * Round 29 : les données personnelles (fiches, boîtes, dossiers,
 * calendrier) appartiennent au COMPTE connecté (colonne owner_id = id du
 * compte Supabase Auth), et les règles de sécurité de la base (RLS) ne
 * laissent chacun lire et écrire que les siennes. L'ancien « code de
 * synchronisation » n'est plus utilisé (les données qui y étaient
 * rattachées ont été reprises par la migration
 * supabase/account_scoping_migration.sql).
 *
 * L'adresse et la clé publique du projet viennent de js/config.js (ou, à
 * défaut, de la page Synchronisation de l'appareil).
 */

const LS_KEYS = {
  url: "fiches_sb_url",
  key: "fiches_sb_key",
  code: "fiches_sync_code",
  pending: "fiches_sb_pending",
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0, O, 1 ni I (round 48 : vérifié)

function generateSyncCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}`;
}

function builtInConfig() {
  const cfg = window.FICHES_CONFIG || {};
  return { url: (cfg.supabaseUrl || "").trim(), key: (cfg.supabaseAnonKey || "").trim() };
}

function getConfig() {
  const built = builtInConfig();
  return {
    url: built.url || localStorage.getItem(LS_KEYS.url) || "",
    key: built.key || localStorage.getItem(LS_KEYS.key) || "",
    // Ancien code de synchronisation (avant les comptes), gardé en lecture
    // seule pour information.
    code: localStorage.getItem(LS_KEYS.code) || "",
    builtIn: Boolean(built.url && built.key),
  };
}

function isConfigured() {
  const { url, key } = getConfig();
  return Boolean(url && key);
}

function saveConfig({ url, key }) {
  localStorage.setItem(LS_KEYS.url, (url || "").trim());
  localStorage.setItem(LS_KEYS.key, (key || "").trim());
  client = null; // force la recréation du client au prochain appel
}

/** Id du compte connecté sur cet appareil (voir js/user-scope.js). */
function currentUid() {
  return (window.UserScope && window.UserScope.uid) || null;
}

/** Erreur typique quand la migration Supabase du round 29 n'a pas encore
 *  été exécutée (colonnes owner_id/payload inconnues). */
function isAccountMigrationMissing(error) {
  const msg = String((error && error.message) || error || "");
  return /owner_id|payload/.test(msg) && /column|schema cache|colonne/i.test(msg);
}
let accountMigrationMissing = false;
function noteError(error) {
  if (isAccountMigrationMissing(error)) accountMigrationMissing = true;
}

function clearConfig() {
  Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
  client = null;
}

let client = null;
function getClient() {
  if (client) return client;
  const { url, key } = getConfig();
  if (!url || !key || typeof window.supabase === "undefined") return null;
  client = window.supabase.createClient(url, key);
  return client;
}

/* ---------------------------------------------------------
   Conversion carte locale <-> ligne Supabase (snake_case)
--------------------------------------------------------- */
/** Copie JSON de l'objet complet (tous ses champs, y compris ceux qui n'ont
 *  pas de colonne dédiée : échéance du nouvel algorithme, chantier,
 *  origine Librairie/classe…) — pour retrouver EXACTEMENT ses données sur
 *  un autre appareil. */
function asPayload(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return null;
  }
}
/** Fusionne le payload complet et les colonnes (les colonnes priment). */
function withPayload(row, mapped) {
  const base = row && row.payload && typeof row.payload === "object" ? row.payload : {};
  const out = { ...base };
  Object.keys(mapped).forEach((k) => {
    if (mapped[k] !== undefined) out[k] = mapped[k];
  });
  return out;
}

/** Fiche telle qu'elle est partagée (classe, Librairie) : avec ses 3
 *  réponses fausses si elle est en mode QCM (round 59). */
function shareableCard(card) {
  const out = { id: card.id, question: card.question, answer: card.answer };
  if (Array.isArray(card.wrongs) && card.wrongs.length === 3) out.wrongs = card.wrongs.slice();
  if (card.more) out.more = card.more;
  // v237 : lien « Pour aller plus loin ».
  if (card.link) out.link = card.link;
  return out;
}

/** v237 : réessaie sans la colonne `link` si la base n'a pas encore
 *  supabase/round77_migration.sql (le reste est enregistré quand même). */
function isMissingLinkColumn(error) {
  return !!error && /\blink\b/i.test(error.message || "") && /column|schema cache/i.test(error.message || "");
}

function cardToRow(card, uid) {
  return {
    id: card.id,
    owner_id: uid,
    payload: asPayload(card),
    subject: card.subject || null,
    subject_name:
      typeof window.getSubjectName === "function" ? window.getSubjectName(card.subject) : null,
    question: card.question,
    answer: card.answer,
    created_at: card.createdAt,
    due_date: card.dueDate,
    last_reviewed: card.lastReviewed,
    review_count: card.reviewCount || 0,
    easiness: card.easiness,
    interval: card.interval,
    repetitions: card.repetitions,
    max_interval_reached: card.maxIntervalReached || 0,
    updated_at: card.updatedAt || card.createdAt,
    deleted: Boolean(card.deleted),
  };
}

function rowToCard(row) {
  return withPayload(row, {
    id: row.id,
    subject: row.subject || null,
    subjectName: row.subject_name || null,
    question: row.question,
    answer: row.answer,
    createdAt: row.created_at,
    dueDate: row.due_date,
    lastReviewed: row.last_reviewed,
    reviewCount: row.review_count,
    easiness: Number(row.easiness),
    interval: row.interval,
    repetitions: row.repetitions,
    maxIntervalReached: row.max_interval_reached || 0,
    updatedAt: row.updated_at,
    deleted: Boolean(row.deleted),
  });
}

/* ---------------------------------------------------------
   File d'attente pour les écritures faites hors-ligne
--------------------------------------------------------- */
function getPending() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.pending) || "[]");
  } catch {
    return [];
  }
}

function setPending(ids) {
  localStorage.setItem(LS_KEYS.pending, JSON.stringify([...new Set(ids)]));
}

function addPending(id) {
  const ids = getPending();
  ids.push(id);
  setPending(ids);
}

function removePending(id) {
  setPending(getPending().filter((x) => x !== id));
}

/* ---------------------------------------------------------
   API publique
--------------------------------------------------------- */
const PULL_PAGE_SIZE = 1000; // limite par défaut de PostgREST par requête

/** Round 48 : lecture complète d'une table, page par page. Bug corrigé —
 *  (1) sans ORDER BY, PostgreSQL ne garantit pas le même ordre d'une page
 *  à l'autre : des lignes pouvaient sauter (jamais lues) et d'autres être
 *  lues deux fois, d'où des boîtes à qui il manquait des fiches au-delà de
 *  1 000 lignes ; (2) on s'arrêtait dès qu'une page faisait moins de
 *  PULL_PAGE_SIZE lignes, alors que le serveur peut plafonner chaque
 *  réponse plus bas : on continue désormais tant qu'une page n'est pas
 *  vide. `build(from, to)` renvoie la requête de la page (triée de façon
 *  stable). */
async function fetchAllPages(build, label) {
  const all = [];
  let from = 0;
  for (let guard = 0; guard < 1000; guard++) {
    const { data, error } = await build(from, from + PULL_PAGE_SIZE - 1);
    if (error) {
      console.warn(`Sync: échec du chargement distant (${label})`, error.message);
      return { data: all, error };
    }
    const rows = data || [];
    all.push(...rows);
    if (rows.length === 0) break;
    from += rows.length;
  }
  return { data: all, error: null };
}

async function pullAll() {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return [];
  const { data: all, error } = await fetchAllPages(
    (from, to) => c.from("cards").select("*").eq("owner_id", uid).order("id", { ascending: true }).range(from, to),
    "cards"
  );
  if (error) {
    lastError = error.message;
    noteError(error);
    // Synchro partielle plutôt que rien du tout.
    return all.map(rowToCard);
  }
  lastError = "";
  return all.map(rowToCard);
}

let lastError = "";

async function pushCard(card) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return false;

  let row = cardToRow(card, uid);
  let { error } = await c.from("cards").upsert(row, { onConflict: "owner_id,id" });

  // Cas connu : la colonne max_interval_reached vient d'être ajoutée en
  // SQL mais le cache de schéma de PostgREST n'a pas encore été rafraîchi
  // côté Supabase (ça peut prendre quelques minutes, même après un
  // `NOTIFY pgrst, 'reload schema'`). Plutôt que de bloquer toute la
  // synchro de la fiche pour ça, on retente sans ce champ : le reste
  // (question, réponse, échéance...) part quand même, et le record de
  // récompense repartira tout seul dès que la colonne sera reconnue.
  if (error && isMissingColumnError(error, "max_interval_reached")) {
    console.warn("Sync: colonne max_interval_reached pas encore reconnue, envoi sans elle");
    const { max_interval_reached, ...rowWithoutRewards } = row;
    ({ error } = await c.from("cards").upsert(rowWithoutRewards, { onConflict: "owner_id,id" }));
  }

  if (error) {
    console.warn("Sync: échec de l'envoi, mis en attente", error.message);
    lastError = error.message;
    noteError(error);
    addPending(card.id);
    return false;
  }
  lastError = "";
  removePending(card.id);
  return true;
}

/** Détecte l'erreur PostgREST "Could not find the 'x' column of 'y' in the
 *  schema cache", qui survient quand une colonne a été ajoutée en base
 *  mais que l'API n'a pas encore rechargé son schéma. */
function isMissingColumnError(error, columnName) {
  const msg = (error && error.message) || "";
  return msg.includes(columnName) && msg.toLowerCase().includes("schema cache");
}

async function flushPending(getCardById) {
  const ids = getPending();
  for (const id of ids) {
    const card = getCardById(id);
    if (!card) {
      removePending(id);
      continue;
    }
    await pushCard(card);
  }
}

function subscribeRealtime(onRemoteChange) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return () => {};

  const channel = c
    .channel(`cards-${uid}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "cards", filter: `owner_id=eq.${uid}` },
      (payload) => {
        if (payload.new) onRemoteChange(rowToCard(payload.new));
      }
    )
    .subscribe();

  return () => c.removeChannel(channel);
}

/* ---------------------------------------------------------
   Matières et dossiers (item 1/8) : jusqu'ici jamais vraiment synchronisés
   (seul le NOM de la matière était recopié sur chaque fiche) — un dossier
   créé sur un appareil n'apparaissait donc jamais sur les autres, et le
   classement en dossier / le mode d'apprentissage d'une matière ne
   voyageaient pas non plus. Même schéma que les fiches : upsert avec file
   d'attente si hors-ligne, suppression douce ("deleted": true) plutôt
   qu'un vrai DELETE pour que les autres appareils sachent qu'une matière
   ou un dossier a disparu au lieu de le voir réapparaître au prochain pull.
--------------------------------------------------------- */
function subjectToRow(subject, uid) {
  return {
    id: subject.id,
    owner_id: uid,
    payload: asPayload(subject),
    name: subject.name,
    folder_id: subject.folderId || null,
    created_at: subject.createdAt,
    updated_at: subject.updatedAt || subject.createdAt,
    deleted: Boolean(subject.deleted),
  };
}
function rowToSubject(row) {
  return withPayload(row, {
    id: row.id,
    name: row.name,
    folderId: row.folder_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: Boolean(row.deleted),
  });
}

function folderToRow(folder, uid) {
  return {
    id: folder.id,
    owner_id: uid,
    payload: asPayload(folder),
    name: folder.name,
    parent_id: folder.parentId || null,
    created_at: folder.createdAt,
    updated_at: folder.updatedAt || folder.createdAt,
    deleted: Boolean(folder.deleted),
  };
}
function rowToFolder(row) {
  return withPayload(row, {
    id: row.id,
    name: row.name,
    parentId: row.parent_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: Boolean(row.deleted),
  });
}

async function pullTable(tableName, rowMapper) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return [];
  const { data: all, error } = await fetchAllPages(
    (from, to) => c.from(tableName).select("*").eq("owner_id", uid).order("id", { ascending: true }).range(from, to),
    tableName
  );
  if (error) noteError(error);
  return all.map(rowMapper);
}

async function pullSubjects() {
  return pullTable("subjects", rowToSubject);
}
async function pullFolders() {
  return pullTable("folders", rowToFolder);
}

/* ---------------------------------------------------------
   Round 41 : signalements de fiches à leur auteur (table card_reports,
   voir supabase/card_reports_migration.sql). L'élève qui signale une fiche
   d'une boîte de classe ou d'une collection de la Librairie écrit un
   message ; l'auteur le reçoit (bouton « Signalements »).
--------------------------------------------------------- */
async function sendCardReport(report) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return { error: "non connecté" };
  const { error } = await c.from("card_reports").insert({ ...report, reporter_id: uid });
  return { error: error ? error.message : null };
}
async function listMyCardReports() {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return [];
  const { data, error } = await c
    .from("card_reports")
    .select("*")
    .eq("author_id", uid)
    .eq("resolved", false)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("Signalements : lecture impossible", error.message);
    // Round 48 : l'appli peut dire pourquoi la liste est vide.
    const out = [];
    out.error = error.message;
    return out;
  }
  return data || [];
}
/** Round 49 : signalements reçus (y compris traités) — l'appli les sépare. */
async function listReceivedCardReports() {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return [];
  const { data, error } = await c
    .from("card_reports")
    .select("*")
    .eq("author_id", uid)
    .order("created_at", { ascending: false });
  if (error) {
    const out = [];
    out.error = error.message;
    return out;
  }
  return data || [];
}
/** Round 49 : signalements que J'AI émis. */
async function listSentCardReports() {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return [];
  const { data, error } = await c
    .from("card_reports")
    .select("*")
    .eq("reporter_id", uid)
    .order("created_at", { ascending: false });
  if (error) {
    const out = [];
    out.error = error.message;
    return out;
  }
  return data || [];
}
/** Round 49 : compteurs — reçus (total, non traités), émis (total, avec un
 *  traitement ou une réponse pas encore vus). */
async function countMyCardReports() {
  const c = getClient();
  const uid = currentUid();
  const empty = { open: 0, unread: 0, receivedTotal: 0, sentTotal: 0, sentUnseen: 0 };
  if (!c || !uid) return empty;
  const [rec, sent] = await Promise.all([
    c.from("card_reports").select("*").eq("author_id", uid),
    c.from("card_reports").select("*").eq("reporter_id", uid),
  ]);
  if (rec.error && sent.error) return empty;
  const received = rec.data || [];
  const mine = sent.data || [];
  const open = received.filter((r) => !r.resolved).length;
  const sentUnseen = mine.filter((r) => reportHasUnseenUpdate(r)).length;
  return { open, unread: open, receivedTotal: received.length, sentTotal: mine.length, sentUnseen };
}
function reportHasUnseenUpdate(r) {
  const last = [r.resolved ? r.resolved_at || r.read_at : null, r.author_reply_at].filter(Boolean).sort().pop();
  if (!last) return false;
  return !r.reporter_seen_at || String(r.reporter_seen_at) < String(last);
}
async function markSentReportsSeen(ids) {
  const c = getClient();
  if (!c || !ids || !ids.length) return { error: null };
  const { error } = await c.rpc("card_reports_mark_seen", { p_ids: ids });
  return { error: error ? error.message : null };
}
async function markCardReportsRead(ids) {
  const c = getClient();
  if (!c || !ids.length) return { error: null };
  const { error } = await c.from("card_reports").update({ read_at: new Date().toISOString() }).in("id", ids);
  return { error: error ? error.message : null };
}
/** Round 49 : traité — on garde la fiche telle qu'elle est maintenant
 *  (`fixed` = { question, answer }, texte brut), pour le signaleur. Sans
 *  les colonnes du round 49, simple passage à « traité ». */
async function resolveCardReport(id, fixed) {
  const c = getClient();
  if (!c) return { error: "non connecté" };
  const now = new Date().toISOString();
  const full = { resolved: true, read_at: now, resolved_at: now };
  if (fixed) {
    full.resolved_question = fixed.question;
    full.resolved_answer = fixed.answer;
  }
  let { error } = await c.from("card_reports").update(full).eq("id", id);
  if (error && /resolved_at|resolved_question|resolved_answer|schema cache/i.test(error.message || "")) {
    ({ error } = await c.from("card_reports").update({ resolved: true, read_at: now }).eq("id", id));
    if (!error) return { error: null, migrationMissing: true };
  }
  return { error: error ? error.message : null };
}
/** Round 49 : message de l'auteur au signaleur. */
async function replyToCardReport(id, message) {
  const c = getClient();
  if (!c) return { error: "non connecté" };
  const { error } = await c
    .from("card_reports")
    .update({ author_reply: message, author_reply_at: new Date().toISOString() })
    .eq("id", id);
  if (error && /author_reply|schema cache/i.test(error.message || "")) return { error: error.message, migrationMissing: true };
  return { error: error ? error.message : null };
}
/** Auteur d'une boîte partagée à une classe (le prof qui l'a partagée). */
async function sharedBoxAuthor(boxId) {
  const c = getClient();
  if (!c || !boxId) return null;
  const { data, error } = await c.from("shared_boxes").select("shared_by").eq("id", boxId).maybeSingle();
  if (error || !data) return null;
  return data.shared_by || null;
}

/** Round 37 : envoi groupé (import des boîtes toutes prêtes : des
 *  milliers de fiches d'un coup — une requête par lot de 200 au lieu
 *  d'une par fiche). En cas d'échec, les fiches du lot passent en attente. */
async function pushCardsBulk(cardList) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid || !cardList.length) return false;
  let allOk = true;
  for (let i = 0; i < cardList.length; i += 200) {
    const chunk = cardList.slice(i, i + 200);
    const { error } = await c.from("cards").upsert(chunk.map((card) => cardToRow(card, uid)), { onConflict: "owner_id,id" });
    if (error) {
      allOk = false;
      lastError = error.message;
      noteError(error);
      chunk.forEach((card) => addPending(card.id));
    }
  }
  return allOk;
}

/** Round 37 : met à jour le classement (et la présentation) d'une de MES
 *  collections déjà publiées — la règle d'accès « owner » le permet. */
async function updateLibraryCollectionMeta(id, fields) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "non connecté" };
  let { data, error } = await c.from("library_collections").update(fields).eq("id", id).eq("owner_id", user.id).select("id");
  if (isMissingLinkColumn(error) && "link" in fields) return { error: "la base n'a pas encore la colonne des liens (supabase/round77_migration.sql)" };
  if (error) return { error: error.message };
  if (Array.isArray(data) && data.length === 0) return { error: "mise à jour refusée" };
  return { error: null };
}

/** v233 : correction des fiches d'une collection de la Librairie, depuis
 *  l'appli (administrateur, ou auteur de la collection — règles d'accès
 *  du serveur). Renvoie { error }. */
async function updateLibraryCollectionCards(id, newCards) {
  const c = getClient();
  if (!c || !id) return { error: "non connecté" };
  const { data, error } = await c
    .from("library_collections")
    .update({ cards: newCards, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error) return { error: error.message };
  if (Array.isArray(data) && data.length === 0) return { error: "mise à jour refusée" };
  return { error: null };
}

async function pushSubject(subject) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return false;
  const { error } = await c.from("subjects").upsert(subjectToRow(subject, uid), { onConflict: "owner_id,id" });
  if (error) {
    noteError(error);
    console.warn("Sync: échec de l'envoi de la matière", error.message);
    return false;
  }
  return true;
}

async function pushFolder(folder) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return false;
  const { error } = await c.from("folders").upsert(folderToRow(folder, uid), { onConflict: "owner_id,id" });
  if (error) {
    noteError(error);
    console.warn("Sync: échec de l'envoi du dossier", error.message);
    return false;
  }
  return true;
}

function subscribeSubjectsRealtime(onRemoteChange) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return () => {};
  const channel = c
    .channel(`subjects-${uid}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "subjects", filter: `owner_id=eq.${uid}` },
      (payload) => {
        if (payload.new) onRemoteChange(rowToSubject(payload.new));
      }
    )
    .subscribe();
  return () => c.removeChannel(channel);
}

function subscribeFoldersRealtime(onRemoteChange) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return () => {};
  const channel = c
    .channel(`folders-${uid}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "folders", filter: `owner_id=eq.${uid}` },
      (payload) => {
        if (payload.new) onRemoteChange(rowToFolder(payload.new));
      }
    )
    .subscribe();
  return () => c.removeChannel(channel);
}

/* ---------------------------------------------------------
   Round 29 : calendrier synchronisé par compte (table calendar_events).
   Chaque évènement est stocké en entier (payload JSON), avec suppression
   douce pour que les autres appareils la voient passer.
--------------------------------------------------------- */
function rowToCalendarEvent(row) {
  return withPayload(row, { id: row.id, updatedAt: row.updated_at, deleted: Boolean(row.deleted) });
}
async function pullCalendarEvents() {
  return pullTable("calendar_events", rowToCalendarEvent);
}
async function pushCalendarEvent(ev, deleted) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid || !ev || !ev.id) return false;
  const { error } = await c.from("calendar_events").upsert(
    {
      id: ev.id,
      owner_id: uid,
      payload: asPayload(ev),
      updated_at: ev.updatedAt || new Date().toISOString(),
      deleted: Boolean(deleted),
    },
    { onConflict: "owner_id,id" }
  );
  if (error) {
    console.warn("Sync: échec de l'envoi d'un évènement", error.message);
    lastError = error.message;
    noteError(error);
    return false;
  }
  return true;
}
function subscribeCalendarRealtime(onRemoteChange) {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return () => {};
  const channel = c
    .channel(`calendar-${uid}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "calendar_events", filter: `owner_id=eq.${uid}` },
      (payload) => {
        if (payload.new) onRemoteChange(rowToCalendarEvent(payload.new));
      }
    )
    .subscribe();
  return () => c.removeChannel(channel);
}

/* ---------------------------------------------------------
   Réglages du mode développeur (item 1 — couleurs, icônes, palette de
   texte...) : jamais synchronisés jusqu'ici, chacun restait propre à
   l'appareil. Même principe qu'au-dessus (reward_state) : une seule ligne
   JSON par code de synchro, avec un horodatage pour le dernier écrit
   gagne en cas de fusion.
--------------------------------------------------------- */
/** Correctif (round 6, demande de Stéphane) : `dev_settings` n'avait
 *  jusqu'ici qu'UNE ligne par code de synchro (sync_code = clé primaire),
 *  totalement indépendante du Compte Supabase Auth éventuellement
 *  connecté par-dessus. Deux Comptes différents (ex. un compte prof et
 *  un compte élève de test) utilisant le même code de synchro perso
 *  Round 16 : cette table "dev_settings" (une ligne par code de synchro,
 *  éventuellement cloisonnée par Compte) n'est plus utilisée — sur demande
 *  de Stéphane, toute la logique de réconciliation "le plus récent gagne"
 *  a été retirée car elle pouvait, dans certains cas (horloge locale en
 *  avance, données locales périmées), écraser silencieusement de bons
 *  réglages distants avec une copie locale obsolète. `dev_settings_public`
 *  (plus bas) est maintenant l'unique source de vérité, lue et écrite par
 *  toutes les installations. Les fonctions pullDevSettings/pushDevSettings/
 *  subscribeDevSettingsRealtime ci-dessous ont donc été retirées ; la table
 *  Supabase elle-même n'a pas été touchée (aucune migration nécessaire).

/* ---------------------------------------------------------
   Round 4, partie 3 : réglages développeur PUBLIÉS pour tout le monde —
   contrairement à dev_settings ci-dessus (une ligne par code de synchro,
   propre à chaque personne), une seule ligne partagée, lue par TOUTE
   installation de l'appli (élèves/profs des Classes compris, même sans
   jamais avoir touché au mode développeur), et écrite uniquement par
   Stéphane (RLS restreinte à son compte, voir
   supabase/dev_settings_public_schema.sql). Permet à un réglage validé
   dans le mode développeur de s'appliquer à tout le monde sans attendre
   une nouvelle version de l'appli.
--------------------------------------------------------- */
async function fetchPublicDevSettings() {
  const c = getClient();
  if (!c) return null;
  try {
    const { data, error } = await c
      .from("dev_settings_public")
      .select("settings")
      .eq("id", "global")
      .maybeSingle();
    if (error) {
      console.warn("Sync: échec du chargement des réglages développeur publics", error.message);
      return null;
    }
    return (data && data.settings) || null;
  } catch (e) {
    return null;
  }
}

/** Round 33 : comme fetchPublicDevSettings, mais distingue « pas encore de
 *  réglages publiés » ({settings:null}) d'une erreur ({error}). */
async function fetchPublicDevSettingsResult() {
  const c = getClient();
  if (!c) return { settings: null, error: "Sync non configurée" };
  try {
    const { data, error } = await c.from("dev_settings_public").select("settings, updated_by, updated_at").eq("id", "global").maybeSingle();
    if (error) return { settings: null, error: error.message || String(error) };
    return { settings: (data && data.settings) || null, updatedBy: (data && data.updated_by) || null, updatedAt: (data && data.updated_at) || null, error: null };
  } catch (e) {
    return { settings: null, error: String(e && e.message ? e.message : e) };
  }
}

async function pushPublicDevSettings(settings, expectedUpdatedAt) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  try {
    const row = { id: "global", settings, updated_at: new Date().toISOString() };
    const uid = currentUid();
    if (uid) row.updated_by = uid;
    // Round 35 : écriture conditionnelle — seulement si personne n'a écrit
    // depuis notre lecture (sinon : conflit, on relit et on refait la fusion).
    if (expectedUpdatedAt) {
      const { data, error } = await c
        .from("dev_settings_public")
        .update(row)
        .eq("id", "global")
        .eq("updated_at", expectedUpdatedAt)
        .select("id");
      if (error) return { error: error.message };
      if (Array.isArray(data) && data.length === 0) return { error: null, conflict: true };
      return { error: null, updatedAt: row.updated_at };
    }
    // .select() : sans droit d'écriture, la règle de sécurité peut « réussir »
    // sans rien écrire — on vérifie qu'une ligne est bien revenue.
    const { data, error } = await c.from("dev_settings_public").upsert(row).select("id");
    if (!error && Array.isArray(data) && data.length === 0) return { error: "écriture refusée par le serveur (compte sans droit d'écriture ?)" };
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: String(e && e.message ? e.message : e) };
  }
}

// Round 16 : abonnement temps réel à l'UNIQUE ligne publique
// (dev_settings_public, id='global') — remplace subscribeDevSettingsRealtime
// (canal "personnel" par compte, retiré). Toute modification, par
// n'importe quelle installation ayant le droit d'écrire (RLS réservée à
// Stéphane), est immédiatement répercutée à toutes les sessions ouvertes.
function subscribePublicDevSettingsRealtime(onRemoteChange) {
  const c = getClient();
  if (!c) return () => {};

  const channel = c
    .channel("dev-settings-public-global")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "dev_settings_public", filter: "id=eq.global" },
      (payload) => {
        if (!payload.new || !payload.new.settings) return;
        onRemoteChange({ payload: payload.new.settings, updatedAt: payload.new.updated_at, updatedBy: payload.new.updated_by || null });
      }
    )
    .subscribe();

  return () => c.removeChannel(channel);
}

/* ---------------------------------------------------------
   Classes (prof/élève) : contrairement à tout ce qui précède (un simple
   "code" partagé, sans identité), ça a besoin d'un VRAI compte Supabase
   Auth (email + mot de passe) — impossible de distinguer prof/élève ou
   de protéger les données d'un prof sans ça. Utilise le même projet
   Supabase (même url/key) que la synchro perso, donc Classes exige que
   la Sync soit déjà configurée (voir supabase/classes_schema.sql pour le
   schéma à créer une fois, côté Supabase).
--------------------------------------------------------- */
// Round 10 : nom/prénom demandés à la création d'un compte, stockés dans les
// métadonnées du compte Supabase Auth (`user_metadata`) — pas besoin d'une
// table dédiée, récupérables ensuite via authGetUser() -> user.user_metadata.
async function authSignUp(email, password, firstName, lastName, extraMeta) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  const options = {};
  if (firstName || lastName) {
    options.data = { first_name: (firstName || "").trim(), last_name: (lastName || "").trim() };
  }
  // Round 70 : version des conditions acceptées (et date), etc.
  if (extraMeta && typeof extraMeta === "object") options.data = { ...(options.data || {}), ...extraMeta };
  invalidateAuthUserCache();
  const { data, error } = await c.auth.signUp({ email, password, options });
  return { data, error: error ? error.message : null };
}

/** Permet aussi de renseigner/corriger nom-prénom après coup, depuis la page
 *  Mon Compte, pour les comptes déjà créés avant ce round. */
async function authUpdateProfile(firstName, lastName) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  invalidateAuthUserCache();
  const { data, error } = await c.auth.updateUser({
    data: { first_name: (firstName || "").trim(), last_name: (lastName || "").trim() },
  });
  return { data, error: error ? error.message : null };
}

/** Round 19, item 5 : niveau scolaire de l'utilisateur, même principe que
 *  prénom/nom (métadonnées du compte Supabase Auth, `user_metadata.
 *  school_level`) — permet de préremplir automatiquement le filtre de
 *  niveau de la Bibliothèque. Appel séparé de authUpdateProfile (utilisé
 *  seul ailleurs, ex. shareSubjectToLibrary) — `updateUser({data})` FUSIONNE
 *  avec les métadonnées existantes côté client Supabase (contrairement à
 *  l'API admin, qui les remplace), donc les deux appels ne s'écrasent pas
 *  l'un l'autre. */
async function authUpdateSchoolLevel(level) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  invalidateAuthUserCache();
  const { data, error } = await c.auth.updateUser({
    data: { school_level: level || "" },
  });
  return { data, error: error ? error.message : null };
}

/** Round 25 : écriture générique de métadonnées du compte (usages,
 *  niveau scolaire détaillé…). `updateUser({data})` fusionne avec les
 *  métadonnées existantes. */
async function authUpdateMetadata(fields) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  invalidateAuthUserCache();
  const { data, error } = await c.auth.updateUser({ data: fields || {} });
  return { data, error: error ? error.message : null };
}

async function authSignIn(email, password) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  invalidateAuthUserCache();
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  return { data, error: error ? error.message : null };
}

/** Round 64 : suppression définitive du compte connecté et de toutes ses
 *  données (fonction serveur delete_my_account, voir
 *  supabase/round64_migration.sql). Le mot de passe est revérifié avant.
 *  Renvoie { error } avec un code parlant : "wrong_password",
 *  "active_subscription", "last_admin", ou le message du serveur. */
async function authDeleteMyAccount(password) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  const user = await authGetUser();
  if (!user || !user.email) return { error: "not_authenticated" };
  const check = await c.auth.signInWithPassword({ email: user.email, password: password || "" });
  if (check.error) return { error: "wrong_password" };
  const { error } = await c.rpc("delete_my_account");
  if (error) {
    const msg = String(error.message || error);
    if (/active_subscription/.test(msg)) return { error: "active_subscription" };
    if (/last_admin/.test(msg)) return { error: "last_admin" };
    if (/delete_my_account|function|schema cache/i.test(msg)) return { error: `${msg} (la base n'a pas encore la fonction : exécute supabase/round64_migration.sql dans Supabase.)` };
    return { error: msg };
  }
  invalidateAuthUserCache();
  try {
    await c.auth.signOut({ scope: "local" });
  } catch (e) {
    /* le compte n'existe plus : la session locale est de toute façon effacée */
  }
  return { error: null };
}

async function authSignOut() {
  const c = getClient();
  if (!c) return;
  invalidateAuthUserCache();
  await c.auth.signOut();
}

// Round 49 : le compte connecté est gardé 30 s en mémoire — chaque appel
// interrogeait le serveur (plusieurs allers-retours pour afficher la
// Messagerie, les classes…). Vidé à chaque connexion, déconnexion ou
// modification du compte.
let authUserCache = null;
function invalidateAuthUserCache() {
  authUserCache = null;
}
async function authGetUser() {
  const c = getClient();
  if (!c) return null;
  if (authUserCache && Date.now() - authUserCache.at < 30000) return authUserCache.user;
  const user = await authGetUserUncached(c);
  authUserCache = user ? { user, at: Date.now() } : null;
  return user;
}
async function authGetUserUncached(c) {
  // Round 29 : getUser() interroge le serveur ; hors-ligne (ou réseau
  // capricieux), on se rabat sur la session enregistrée sur l'appareil
  // plutôt que de considérer la personne comme déconnectée.
  try {
    const { data, error } = await c.auth.getUser();
    if (data && data.user) return data.user;
    if (error && /invalid|expired|not found|jwt/i.test(error.message || "") && navigator.onLine) return null;
  } catch (e) {
    /* hors-ligne : repli ci-dessous */
  }
  try {
    const { data } = await c.auth.getSession();
    return (data && data.session && data.session.user) || null;
  } catch (e) {
    return null;
  }
}

/* ---- Round 55 : mot de passe oublié (fonction intégrée de Supabase
   Auth) — un email avec un lien de réinitialisation est envoyé ; le lien
   ramène dans l'appli avec l'évènement PASSWORD_RECOVERY, où l'on choisit
   un nouveau mot de passe (updateUser). ---- */
async function authSendPasswordReset(email) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await c.auth.resetPasswordForEmail(String(email || "").trim(), { redirectTo });
  return { error: error ? error.message : null };
}
async function authUpdatePassword(password) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const { error } = await c.auth.updateUser({ password });
  return { error: error ? error.message : null };
}
function authOnPasswordRecovery(callback) {
  const c = getClient();
  if (!c) return () => {};
  const { data } = c.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") callback();
  });
  return () => data.subscription.unsubscribe();
}

function authOnChange(callback) {
  const c = getClient();
  if (!c) return () => {};
  const { data } = c.auth.onAuthStateChange((_event, session) => {
    callback((session && session.user) || null);
  });
  return () => data.subscription.unsubscribe();
}

/* ---- classes : créer, lister, rejoindre ---- */

function classInviteCode() {
  // Même alphabet que generateSyncCode (sans caractères ambigus), format
  // plus court car pensé pour être recopié à la main par un élève.
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

async function createClass(name) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "Non connecté." };
  const row = {
    name: (name || "").trim(),
    teacher_id: user.id,
    invite_code: classInviteCode(),
  };
  const { data, error } = await c.from("classes").insert(row).select().single();
  return { data, error: error ? error.message : null };
}

async function listClassesAsTeacher() {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return [];
  const { data, error } = await c.from("classes").select("*").eq("teacher_id", user.id).order("created_at");
  if (error) {
    console.warn("Classes: échec du chargement (prof)", error.message);
    return [];
  }
  return data || [];
}

async function listClassesAsStudent() {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return [];
  const { data, error } = await c
    .from("class_members")
    .select("class_id, role, classes(*)")
    .eq("user_id", user.id);
  if (error) {
    console.warn("Classes: échec du chargement (élève)", error.message);
    return [];
  }
  return (data || []).map((row) => row.classes).filter(Boolean);
}

async function classMemberCount(classId) {
  const c = getClient();
  if (!c) return 0;
  const { data, error } = await c.rpc("class_member_count", { p_class_id: classId });
  if (error) {
    console.warn("Classes: échec du comptage des membres", error.message);
    return 0;
  }
  return data || 0;
}

/** Round 47 : élèves d'une classe (prénom, nom ; email seulement pour
 *  l'enseignant) — fonction serveur ajoutée par
 *  supabase/class_members_list_migration.sql. Sans elle : `missing`. */
async function listClassMembers(classId) {
  const c = getClient();
  if (!c) return { data: [], error: "Sync non configurée." };
  const { data, error } = await c.rpc("class_members_list", { p_class_id: classId });
  if (error) {
    const missing = /class_members_list|function|schema cache/i.test(error.message || "");
    return { data: [], error: error.message, missing };
  }
  return { data: data || [], error: null };
}

async function joinClassByCode(code) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const { data, error } = await c.rpc("join_class_by_code", { p_code: code });
  if (error) return { error: error.message.includes("Code invalide") ? "Code invalide." : error.message };
  return { data };
}

/* ---- boîtes partagées ---- */

// item 3 (2e lot) : chaque carte garde son `id` local (côté prof) dans le
// jsonb `cards` — c'est ce qui permet ensuite à `updateSharedBoxCards` de
// pousser des mises à jour ciblées (ajout/modif/suppression d'une fiche se
// traduit par un nouvel id apparu/changé/disparu dans ce tableau), et côté
// élève de savoir quelle fiche locale correspond à quelle fiche distante
// sans jamais faire de copie figée.
// Round 3, item 1 : `folder_path` (tableau de noms de dossiers, de la
// racine du prof jusqu'au dossier direct de la boîte) est repoussé en même
// temps que les fiches, pour que l'élève puisse reconstituer la même
// arborescence (en lecture seule) sous le dossier de sa classe.
async function shareBoxToClass(classId, subjectName, cards, folderPath, extra) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "Non connecté." };
  const row = {
    class_id: classId,
    shared_by: user.id,
    subject_name: subjectName,
    cards: cards.map(shareableCard),
    folder_path: Array.isArray(folderPath) ? folderPath : [],
  };
  // Round 47 : boîte venue de la Librairie — on garde la collection
  // d'origine (colonne library_collection_id, voir
  // supabase/class_members_list_migration.sql) ; sans la colonne, on
  // partage quand même.
  if (extra && extra.libraryCollectionId) row.library_collection_id = extra.libraryCollectionId;
  if (extra && extra.link) row.link = extra.link;
  let { data, error } = await c.from("shared_boxes").insert(row).select().single();
  if (isMissingLinkColumn(error)) {
    delete row.link;
    ({ data, error } = await c.from("shared_boxes").insert(row).select().single());
  }
  if (error && row.library_collection_id && /library_collection_id/i.test(error.message || "")) {
    delete row.library_collection_id;
    ({ data, error } = await c.from("shared_boxes").insert(row).select().single());
  }
  return { data, error: error ? error.message : null };
}

async function listSharedBoxesForClass(classId) {
  const c = getClient();
  if (!c) return [];
  const { data, error } = await c.from("shared_boxes").select("*").eq("class_id", classId).order("shared_at");
  if (error) {
    console.warn("Classes: échec du chargement des boîtes partagées", error.message);
    return [];
  }
  return data || [];
}

/** item 3 (2e lot) : le prof modifie sa boîte (ajout/modif/suppression de
 *  fiches) -> on repousse l'intégralité du tableau `cards` (avec les mêmes
 *  id qu'au partage initial) vers chaque boîte partagée liée. Simple et
 *  suffisant pour la taille habituelle d'une boîte de fiches ; l'élève
 *  compare ensuite ce tableau à sa propre copie locale par id pour ne
 *  toucher qu'au contenu (question/réponse), jamais à sa progression. */
// Round 3, item 1 : `folderPath` est optionnel pour ne pas casser les
// appels existants — quand fourni (le prof a réorganisé ses dossiers), il
// est repoussé en même temps que les fiches, sinon seul `cards` est mis à
// jour et le chemin de dossiers distant reste inchangé.
async function updateSharedBoxCards(boxId, cards, folderPath, subjectName, boxLink) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const payload = {
    cards: cards.map(shareableCard),
    updated_at: new Date().toISOString(),
  };
  if (Array.isArray(folderPath)) payload.folder_path = folderPath;
  // Round 48 : le nom de la boîte suit aussi (renommage côté enseignant).
  if (subjectName) payload.subject_name = subjectName;
  // v237 : lien de la boîte (null = retiré) ; non transmis si absent.
  if (boxLink !== undefined) payload.link = boxLink || null;
  let { error } = await c.from("shared_boxes").update(payload).eq("id", boxId);
  if (isMissingLinkColumn(error)) {
    delete payload.link;
    ({ error } = await c.from("shared_boxes").update(payload).eq("id", boxId));
  }
  return { error: error ? error.message : null };
}

/** Round 54 : quitter une classe (élève) / supprimer une classe
 *  (enseignant ; boîtes partagées, membres, messages et évènements de la
 *  classe sont supprimés en cascade par le serveur). */
async function leaveClass(classId) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "Non connecté." };
  const { error } = await c.from("class_members").delete().eq("class_id", classId).eq("user_id", user.id);
  return { error: error ? error.message : null };
}
async function deleteClass(classId) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const { error } = await c.from("classes").delete().eq("id", classId);
  return { error: error ? error.message : null };
}

/** Round 54 : retire une boîte partagée d'une classe (enseignant). */
async function deleteSharedBox(boxId) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const { error } = await c.from("shared_boxes").delete().eq("id", boxId);
  return { error: error ? error.message : null };
}

/** Round 53 : arborescence propre à la classe. `folderPath` d'une boîte
 *  partagée = son dossier DANS LA CLASSE (rangé par l'enseignant depuis la
 *  page de la classe), indépendant de son organisation personnelle. */
async function updateSharedBoxPath(boxId, folderPath) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const { error } = await c
    .from("shared_boxes")
    .update({ folder_path: Array.isArray(folderPath) ? folderPath : [], updated_at: new Date().toISOString() })
    .eq("id", boxId);
  return { error: error ? error.message : null };
}
/** Round 53 : dossiers de la classe (y compris vides) — colonne
 *  `box_folders` ajoutée par supabase/round53_migration.sql. Sans elle :
 *  `missing` (les dossiers qui contiennent des boîtes restent gérés par le
 *  chemin de chaque boîte). */
/** v242 : renommer une classe (enseignant). */
async function renameClass(classId, name) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const n = String(name || "").trim().slice(0, 120);
  if (!n) return { error: "Nom vide." };
  const { error } = await c.from("classes").update({ name: n }).eq("id", classId);
  return { error: error ? error.message : null };
}
async function updateClassBoxFolders(classId, folders) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const { error } = await c.from("classes").update({ box_folders: Array.isArray(folders) ? folders : [] }).eq("id", classId);
  if (error) return { error: error.message, missing: /box_folders/i.test(error.message || "") };
  return { error: null };
}

/* ---- Round 3, item 4 (squelette) : événements de calendrier partagés ---- */

/** Round 26, item 2 : identité du professeur affichée côté élève —
 *  "Prénom Nom" des métadonnées du compte, repli sur l'email. */
function teacherDisplayName(user) {
  const meta = (user && user.user_metadata) || {};
  // v242 : jamais l'email (il n'est plus montré aux autres utilisateurs).
  return `${meta.first_name || ""} ${meta.last_name || ""}`.trim();
}
/** La colonne `shared_by_name` n'existe qu'après la migration
 *  supabase/shared_events_teacher_name_migration.sql : sans elle, on
 *  réessaie sans ce champ plutôt que de bloquer le partage. */
function isMissingTeacherNameColumn(error) {
  return !!error && /shared_by_name/i.test(error.message || "");
}

/** Round 44 : boîtes à réviser d'un évènement de classe (`box_ids`, ids
 *  des boîtes partagées `shared_boxes`) — colonne ajoutée par
 *  supabase/shared_events_boxes_migration.sql. Sans elle, l'évènement est
 *  quand même partagé (sans ses boîtes) et `boxIdsMissing` le signale. */
function isMissingBoxIdsColumn(error) {
  return !!error && /box_ids/i.test(error.message || "");
}
async function shareEventToClass(classId, title, date, boxIds) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "Non connecté." };
  const row = { class_id: classId, shared_by: user.id, title, date, shared_by_name: teacherDisplayName(user) };
  if (Array.isArray(boxIds)) row.box_ids = boxIds;
  let boxIdsMissing = false;
  let { data, error } = await c.from("shared_events").insert(row).select().single();
  if (isMissingBoxIdsColumn(error)) {
    boxIdsMissing = true;
    delete row.box_ids;
    ({ data, error } = await c.from("shared_events").insert(row).select().single());
  }
  if (isMissingTeacherNameColumn(error)) {
    delete row.shared_by_name;
    ({ data, error } = await c.from("shared_events").insert(row).select().single());
  }
  return { data, error: error ? error.message : null, boxIdsMissing };
}

/** Round 26, item 2 : complète le nom du professeur sur SES évènements
 *  partagés avant la migration (nom vide) — appelé au démarrage, sans
 *  effet si la colonne n'existe pas encore. */
async function backfillMySharedEventsTeacherName() {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return;
  const name = teacherDisplayName(user);
  if (!name) return;
  const { error } = await c
    .from("shared_events")
    .update({ shared_by_name: name })
    .eq("shared_by", user.id)
    .eq("shared_by_name", "");
  if (error && !isMissingTeacherNameColumn(error)) console.warn("Évènements partagés : nom du professeur non complété", error.message);
}

async function listSharedEventsForClass(classId) {
  const c = getClient();
  if (!c) return [];
  const { data, error } = await c.from("shared_events").select("*").eq("class_id", classId).order("date");
  // Bug corrigé (item 3, demande de Stéphane) : cette fonction ravalait
  // auparavant TOUTE erreur (accroc réseau, jeton d'authentification pas
  // encore rafraîchi, etc.) en un simple tableau vide, indiscernable d'une
  // classe qui n'a VRAIMENT plus aucun événement partagé. Côté appelant
  // (syncSharedBoxesForStudent), un tableau vide déclenchait la suppression
  // locale de tous les événements déjà reçus de cette classe — un simple
  // accroc réseau pendant une synchro en tâche de fond suffisait donc à
  // faire "disparaître" un événement partagé, sans que l'élève n'ait rien
  // supprimé lui-même. On lève maintenant l'erreur pour que l'appelant
  // puisse distinguer "vraiment aucun événement" de "échec de la requête".
  if (error) {
    console.warn("Classes: échec du chargement des événements partagés", error.message);
    throw new Error(error.message);
  }
  return data || [];
}

async function updateSharedEvent(eventId, title, date, boxIds) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const user = await authGetUser();
  const fields = { title, date, updated_at: new Date().toISOString(), shared_by_name: teacherDisplayName(user) };
  if (Array.isArray(boxIds)) fields.box_ids = boxIds;
  let boxIdsMissing = false;
  let { error } = await c.from("shared_events").update(fields).eq("id", eventId);
  if (isMissingBoxIdsColumn(error)) {
    boxIdsMissing = true;
    delete fields.box_ids;
    ({ error } = await c.from("shared_events").update(fields).eq("id", eventId));
  }
  if (isMissingTeacherNameColumn(error)) {
    delete fields.shared_by_name;
    ({ error } = await c.from("shared_events").update(fields).eq("id", eventId));
  }
  return { error: error ? error.message : null, boxIdsMissing };
}

async function deleteSharedEvent(eventId) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const { error } = await c.from("shared_events").delete().eq("id", eventId);
  return { error: error ? error.message : null };
}

/* ---- Round 8 : Bibliothèque — collections de fiches partagées
   publiquement (table `library_collections`, lecture publique, écriture
   réservée à l'auteur). Contrairement à `shared_boxes` (partage avec une
   classe, miroir en lecture seule mis à jour en direct), il n'y a ici
   aucune notion de mise à jour continue : une collection publiée est une
   COPIE figée au moment du partage, reprise ensuite en copie indépendante
   par quiconque la "prend". ---- */

/** Round 18, item 15 : `extra` peut contenir `level` (niveau scolaire,
 *  texte libre parmi une liste proposée côté appli) et `priceTokens`
 *  (0 = gratuit). Le prénom/nom de l'auteur est repris de ses métadonnées
 *  de compte (mêmes que celles affichées dans Mon compte), pour pouvoir
 *  afficher "par Prénom Nom" dans la Bibliothèque plutôt qu'un email. */
async function shareCollectionToLibrary(name, cards, extra) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "Non connecté." };
  extra = extra || {};
  const meta = user.user_metadata || {};
  const row = {
    owner_id: user.id,
    owner_email: user.email || "",
    owner_first_name: meta.first_name || "",
    owner_last_name: meta.last_name || "",
    name,
    level: extra.level || "",
    price_tokens: Number.isFinite(extra.priceTokens) ? extra.priceTokens : 0,
    // Round 20, item 2 : résumé (une phrase) + description (plus longue),
    // saisis sur la nouvelle page dédiée de partage.
    summary: extra.summary || "",
    description: extra.description || "",
    // Round 20, item 5 : mémorise la boîte d'origine, pour pouvoir
    // vérifier avant un futur partage qu'elle n'a pas déjà été publiée.
    source_subject_id: extra.sourceSubjectId || null,
    // Round 23 : classement d'après la taxonomie Excel ({ categorie:
    // { id, label }, cycle: ..., matiere: ... }) et tags libres.
    taxonomy: extra.taxonomy || {},
    tags: Array.isArray(extra.tags) ? extra.tags : [],
    cards: cards.map(shareableCard),
  };
  if (extra.link) row.link = extra.link;
  let { data, error } = await c.from("library_collections").insert(row).select().single();
  if (isMissingLinkColumn(error)) {
    delete row.link;
    ({ data, error } = await c.from("library_collections").insert(row).select().single());
  }
  return { data, error: error ? error.message : null };
}

/** Round 20, item 5 : cherche si CET utilisateur a déjà partagé CETTE
 *  boîte précise dans la Bibliothèque (par id de boîte d'origine), pour
 *  empêcher un second partage qui ferait doublon dans la liste. Les
 *  collections partagées avant ce round n'ont pas `source_subject_id`
 *  renseigné — elles ne sont donc jamais trouvées ici (pas de blocage
 *  rétroactif, comportement accepté). */
async function findLibraryCollectionBySourceSubject(subjectId) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user || !subjectId) return null;
  const { data, error } = await c
    .from("library_collections")
    .select("id, name")
    .eq("owner_id", user.id)
    .eq("source_subject_id", subjectId)
    .maybeSingle();
  if (error) {
    console.warn("Librairie : échec de la vérification de partage existant", error.message);
    return null;
  }
  return data || null;
}

/** Round 20, item 6 : suppression d'une collection par le développeur
 *  (modération) — voir la policy RLS dédiée côté base, qui autorise ceci
 *  uniquement pour le compte de Stéphane, en plus de la policy existante
 *  qui permet à chaque auteur de supprimer les siennes. */
/** Round 69 : proposition d'une boîte partagée avec une classe pour la
 *  Librairie (relue puis publiée depuis Darwin Admin). */
async function submitLibraryProposal(p) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "non connecté" };
  const meta = user.user_metadata || {};
  const row = {
    owner_id: user.id,
    owner_first_name: meta.first_name || "",
    owner_last_name: meta.last_name || "",
    class_id: p.classId || null,
    class_name: p.className || "",
    shared_box_id: p.sharedBoxId || null,
    source_subject_id: p.sourceSubjectId || null,
    name: p.name,
    summary: p.summary || "",
    description: p.description || "",
    taxonomy: p.taxonomy || {},
    tags: Array.isArray(p.tags) ? p.tags : [],
    cards: (p.cards || []).map(shareableCard),
  };
  if (p.link) row.link = p.link;
  let { error } = await c.from("library_submissions").insert(row);
  if (isMissingLinkColumn(error)) {
    delete row.link;
    ({ error } = await c.from("library_submissions").insert(row));
  }
  if (error && /library_submissions/i.test(error.message || "")) return { error: "la base n'a pas encore la table des propositions (supabase/round69_migration.sql)" };
  return { error: error ? error.message : null };
}

async function deleteLibraryCollection(id) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  const { error } = await c.from("library_collections").delete().eq("id", id);
  return { error: error ? error.message : null };
}

/** Note (ou remplace sa note existante pour) une collection. Round 22,
 *  item 8 : le système est passé de 5 étoiles à un simple pouce — chaque
 *  ligne de `library_ratings` vaut désormais "j'ai mis un pouce" (appelée
 *  avec `rating = 1`), sans changement de schéma côté Supabase (la colonne
 *  `rating` existe toujours, elle est juste ignorée à l'affichage — seul
 *  le NOMBRE de lignes pour une collection compte maintenant). */
async function rateLibraryCollection(collectionId, rating) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "Non connecté." };
  const { error } = await c
    .from("library_ratings")
    .upsert({ collection_id: collectionId, user_id: user.id, rating }, { onConflict: "collection_id,user_id" });
  return { error: error ? error.message : null };
}

/** Round 22, item 8 : retire le pouce du Compte connecté sur une
 *  collection (bascule inverse de rateLibraryCollection, pour un pouce qui
 *  ne se pose qu'à l'unité — pas de "note à zéro", on supprime la ligne). */
async function unrateLibraryCollection(collectionId) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "Non connecté." };
  const { error } = await c
    .from("library_ratings")
    .delete()
    .eq("collection_id", collectionId)
    .eq("user_id", user.id);
  return { error: error ? error.message : null };
}

/** Récupère toutes les notes de toutes les collections en un seul appel
 *  (plutôt qu'une requête par collection affichée) : l'appli calcule
 *  ensuite la moyenne par collection côté client. */
async function listLibraryRatings() {
  const c = getClient();
  if (!c) return [];
  // Round 48 : toutes les pages (au-delà de 1 000 lignes).
  const { data } = await fetchAllPages(
    (from, to) => c.from("library_ratings").select("collection_id, user_id, rating").order("collection_id").order("user_id").range(from, to),
    "library_ratings"
  );
  return data || [];
}

async function listLibraryCollections() {
  const c = getClient();
  if (!c) return [];
  // Round 48 : bug corrigé — le serveur ne renvoie que 1 000 lignes par
  // requête : au-delà (plus de 1 000 collections publiées), les plus
  // anciennes manquaient. Conséquences : collections absentes de la
  // Librairie, et ses propres boîtes publiées affichées « Non publiée »
  // dans Mes créations (alors que « Publier » répondait « déjà partagée »).
  const { data } = await fetchAllPages(
    // Round 64 : la liste vient de la vue publique `library_catalog` (tout
    // sauf les fiches et l'email de l'auteur, avec `card_count`) ; les
    // fiches passent par library_collection_cards (contrôle d'accès côté
    // serveur).
    (from, to) => c.from("library_catalog").select("*").order("shared_at", { ascending: false }).order("id").range(from, to),
    "library_catalog"
  );
  return data || [];
}

/** Round 64 : fiches d'une collection, servies par le serveur — complètes
 *  (`full: true`) pour l'auteur, un administrateur ou un compte qui a accès
 *  à la Librairie ; sinon un aperçu (`full: false`, réponses coupées).
 *  Renvoie null si la collection n'existe plus ou en cas d'erreur. */
async function fetchLibraryCollectionCards(id) {
  const c = getClient();
  if (!c || !id) return null;
  const { data, error } = await c.rpc("library_collection_cards", { p_id: id });
  if (error || !data) {
    if (error) console.warn("Librairie : échec du chargement des fiches", error.message);
    return null;
  }
  return { full: !!data.full, cards: Array.isArray(data.cards) ? data.cards : [] };
}

/** Round 10, item 2 : une collection prise dans la Bibliothèque devient un
 *  miroir en lecture seule (même principe que shared_boxes pour une classe)
 *  plutôt qu'une copie figée — il faut donc pouvoir relire une collection
 *  précise par son id pour la reconcilier périodiquement côté client. */
async function getLibraryCollection(id) {
  const c = getClient();
  if (!c || !id) return null;
  const { data, error } = await c.from("library_catalog").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.warn("Librairie : échec du rechargement d'une collection", error.message);
    return null;
  }
  if (!data) return null;
  // Fiches complètes seulement si le serveur les donne (sinon `cardsFull`
  // est faux et `cards` reste vide : un miroir n'est jamais recalé sur un
  // aperçu).
  const res = await fetchLibraryCollectionCards(id);
  return { ...data, cards: res && res.full ? res.cards : [], cardsFull: !!(res && res.full) };
}

/* ---- Round 6, item 5 : messagerie par classe (façon groupe WhatsApp) ---- */

/** Liste, en une seule fois, toutes les classes où l'utilisateur peut
 *  discuter — celles qu'il enseigne ET celles qu'il suit — avec
 *  `teacher_id` conservé sur chaque classe (sert côté appli à décider
 *  l'alignement gauche/droite d'un message sans requête supplémentaire). */
async function listMessageClasses() {
  const [asTeacher, asStudent] = await Promise.all([listClassesAsTeacher(), listClassesAsStudent()]);
  const byId = new Map();
  asTeacher.forEach((k) => byId.set(k.id, k));
  asStudent.forEach((k) => {
    if (!byId.has(k.id)) byId.set(k.id, k);
  });
  return Array.from(byId.values());
}

async function listClassMessages(classId, sinceIso) {
  const c = getClient();
  if (!c) return [];
  let q = c.from("class_messages").select("*").eq("class_id", classId).order("created_at");
  if (sinceIso) q = q.gt("created_at", sinceIso);
  const { data, error } = await q;
  if (error) {
    console.warn("Messagerie : échec du chargement des messages", error.message);
    return [];
  }
  return data || [];
}

async function sendClassMessage(classId, body) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "Non connecté." };
  const trimmed = (body || "").trim();
  if (!trimmed) return { error: "Message vide." };
  // Round 48 : prénom et nom de l'expéditeur (colonne sender_name, voir
  // supabase/round48_migration.sql) — sans la colonne, envoi sans elle.
  const row = { class_id: classId, sender_id: user.id, sender_email: "", sender_name: teacherDisplayName(user), body: trimmed };
  let { data, error } = await c.from("class_messages").insert(row).select().single();
  if (error && /sender_name/i.test(error.message || "")) {
    delete row.sender_name;
    ({ data, error } = await c.from("class_messages").insert(row).select().single());
  }
  return { data, error: error ? error.message : null };
}

/** Nombre de messages reçus depuis `sinceIso` (dernière lecture locale de
 *  CETTE classe) — sert à la pastille de notifications, sans avoir à
 *  rapatrier le contenu des messages déjà connus. `sinceIso` absent =
 *  jamais lu, donc tous les messages comptent. */
async function countUnreadClassMessages(classId, sinceIso) {
  const c = getClient();
  if (!c) return 0;
  let q = c.from("class_messages").select("id", { count: "exact", head: true }).eq("class_id", classId);
  if (sinceIso) q = q.gt("created_at", sinceIso);
  // Round 41 : ses propres messages ne sont jamais « non lus ».
  const meId = currentUid();
  if (meId) q = q.neq("sender_id", meId);
  const { count, error } = await q;
  if (error) {
    console.warn("Messagerie : échec du comptage des messages non lus", error.message);
    return 0;
  }
  return count || 0;
}

/** Round 10, item 11 : date/heure du dernier message d'une classe, pour
 *  l'afficher dans le bloc de la discussion (liste Messagerie). Une requête
 *  par classe, comme `countUnreadClassMessages` déjà appelé juste à côté
 *  dans la même boucle (`renderMessagesView`) — même précédent N+1, pas de
 *  souci de volume pour le nombre de classes usuel d'un compte. */
async function getLastClassMessage(classId) {
  const c = getClient();
  if (!c) return null;
  const { data, error } = await c
    .from("class_messages")
    .select("created_at")
    .eq("class_id", classId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("Messagerie : échec de la lecture du dernier message", error.message);
    return null;
  }
  return data || null;
}

/** Filtre serveur borné à une seule colonne (comme pour les autres canaux
 *  temps réel de cette appli, voir subscribePublicDevSettingsRealtime) : ici
 *  `class_id` seul suffit, aucun filtrage client supplémentaire n'est
 *  nécessaire (les droits de lecture sont de toute façon déjà garantis
 *  par la RLS côté serveur). */
function subscribeClassMessagesRealtime(classId, onNewMessage) {
  const c = getClient();
  if (!c) return () => {};
  const channel = c
    .channel(`class-messages-${classId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "class_messages", filter: `class_id=eq.${classId}` },
      (payload) => {
        if (payload.new) onNewMessage(payload.new);
      }
    )
    .subscribe();
  return () => c.removeChannel(channel);
}

/** Round 50 : le compte connecté est-il administrateur (table admins) ?
 *  false si le serveur n'a pas encore la mise à jour. */
async function isAdmin() {
  const c = getClient();
  if (!c) return false;
  try {
    const { data, error } = await c.rpc("is_admin");
    return !error && data === true;
  } catch (e) {
    return false;
  }
}

/** Round 50 : abonnement du compte connecté (table subscriptions), ou null.
 *  { status, plan, current_period_end } ; `missing: true` si la table
 *  n'existe pas encore sur le serveur. */
async function fetchMySubscription() {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return { row: null };
  try {
    const { data, error } = await c.from("subscriptions").select("*").eq("user_id", uid).maybeSingle();
    if (error) return { row: null, missing: /relation|does not exist|schema cache|PGRST205/i.test(error.message || ""), error: error.message };
    return { row: data || null };
  } catch (e) {
    return { row: null, error: String(e) };
  }
}

/** Round 65 : paiements Stripe, par les fonctions serveur
 *  create-checkout et customer-portal (voir supabase/functions/). Renvoie
 *  { url } (page Stripe où aller) ou { error } avec un code :
 *  already_subscribed, plan_unavailable, no_customer, not_deployed… */
async function billingInvoke(name, body, noUrl) {
  const c = getClient();
  if (!c || !c.functions) return { error: "not_configured" };
  try {
    const { data, error } = await c.functions.invoke(name, { body: body || {} });
    if (error) {
      let code = "";
      let detail = "";
      try {
        const res = error.context;
        if (res && typeof res.json === "function") {
          const j = await res.json();
          code = (j && (j.error || j.message)) || "";
          detail = (j && j.detail) || "";
          if (res.status === 404 && !j.error) code = "not_deployed";
        }
      } catch (e) {
        /* réponse illisible */
      }
      if (!code && /Failed to send|fetch|NetworkError/i.test(String(error.message || ""))) code = "network";
      return { error: code || String(error.message || error), detail };
    }
    if (noUrl) return { ok: true, data };
    if (!data || !data.url) return { error: "no_url" };
    return { url: data.url, trial: !!data.trial };
  } catch (e) {
    return { error: "network" };
  }
}

/** v238 : appels des fonctions Super école ; { data } ou { error }. */
async function schoolRpc(name, args) {
  const c = getClient();
  if (!c) return { error: "not_configured" };
  try {
    const { data, error } = await c.rpc(name, args || {});
    if (error) {
      const msg = String(error.message || error);
      if (/could not find the function|PGRST202|does not exist|schema cache/i.test(msg)) return { error: "migration_missing" };
      return { error: msg };
    }
    return { data };
  } catch (e) {
    return { error: "network" };
  }
}

window.Sync = {
  isAdmin,
  fetchMySubscription,
  generateSyncCode,
  getConfig,
  isConfigured,
  saveConfig,
  clearConfig,
  pullAll,
  pushCard,
  flushPending,
  subscribeRealtime,
  fetchPublicDevSettings,
  fetchPublicDevSettingsResult,
  pushPublicDevSettings,
  subscribePublicDevSettingsRealtime,
  pullSubjects,
  pullCalendarEvents,
  pushCalendarEvent,
  subscribeCalendarRealtime,
  currentUid,
  accountMigrationMissing: () => accountMigrationMissing,
  pushSubject,
  subscribeSubjectsRealtime,
  pullFolders,
  pushFolder,
  subscribeFoldersRealtime,
  pendingCount: () => getPending().length,
  getLastError: () => lastError,
  auth: {
    signUp: authSignUp,
    signIn: authSignIn,
    signOut: authSignOut,
    getUser: authGetUser,
    onChange: authOnChange,
    updateProfile: authUpdateProfile,
    updateSchoolLevel: authUpdateSchoolLevel,
    updateMetadata: authUpdateMetadata,
    sendPasswordReset: authSendPasswordReset,
    updatePassword: authUpdatePassword,
    onPasswordRecovery: authOnPasswordRecovery,
    deleteMyAccount: authDeleteMyAccount,
  },
  classes: {
    create: createClass,
    listAsTeacher: listClassesAsTeacher,
    listAsStudent: listClassesAsStudent,
    memberCount: classMemberCount,
    listMembers: listClassMembers,
    join: joinClassByCode,
    shareBox: shareBoxToClass,
    listSharedBoxes: listSharedBoxesForClass,
    updateSharedBoxCards,
    updateSharedBoxPath,
    deleteSharedBox,
    leave: leaveClass,
    remove: deleteClass,
    rename: renameClass,
    updateBoxFolders: updateClassBoxFolders,
    shareEvent: shareEventToClass,
    listSharedEvents: listSharedEventsForClass,
    updateSharedEvent,
    deleteSharedEvent,
    backfillSharedEventsTeacherName: backfillMySharedEventsTeacherName,
  },
  messages: {
    listClasses: listMessageClasses,
    list: listClassMessages,
    send: sendClassMessage,
    countUnread: countUnreadClassMessages,
    subscribeRealtime: subscribeClassMessagesRealtime,
    getLastMessage: getLastClassMessage,
  },
  pushCardsBulk,
  reports: {
    send: sendCardReport,
    listMine: listMyCardReports,
    listReceived: listReceivedCardReports,
    listSent: listSentCardReports,
    countMine: countMyCardReports,
    markRead: markCardReportsRead,
    markSeen: markSentReportsSeen,
    resolve: resolveCardReport,
    reply: replyToCardReport,
    hasUnseenUpdate: reportHasUnseenUpdate,
    sharedBoxAuthor,
  },
  // v231 : âge et accord parental (moins de 15 ans).
  account: {
    /** { birth_date, age, restricted, consent_status, parent_email, last_sent_at },
     *  ou { error } (null si la migration round71 n'est pas passée). */
    status: async () => {
      const c = getClient();
      if (!c || !currentUid()) return { status: null };
      try {
        const { data, error } = await c.rpc("my_account_status");
        if (error) return { status: null, missing: /function|does not exist|schema cache|PGRST202/i.test(error.message || ""), error: error.message };
        return { status: data || null };
      } catch (e) {
        return { status: null, error: String(e) };
      }
    },
    setBirthDate: async (isoDate) => {
      const c = getClient();
      if (!c) return { error: "not_configured" };
      const { data, error } = await c.rpc("set_my_birth_date", { p_date: isoDate });
      return error ? { error: error.message || String(error) } : { status: data };
    },
    requestParentalConsent: (parentEmail) => billingInvoke("parental-consent", { action: "request", parentEmail }, true),
    // v240 : « ce compte a servi aujourd'hui » (statistiques, comptes
    // inactifs ; voir supabase/round80_migration.sql). Sans cookie.
    touch: async () => {
      const c = getClient();
      if (!c || !currentUid()) return false;
      try {
        const { error } = await c.rpc("touch_activity");
        return !error;
      } catch (e) {
        return false;
      }
    },
  },
  // v238 : Super école (supabase/round79_migration.sql).
  school: {
    mine: () => schoolRpc("my_school"),
    save: (s) => schoolRpc("save_my_school", { p_name: s.name || "", p_city: s.city || "", p_uai: s.uai || "", p_billing_email: s.billingEmail || "" }),
    setTeachers: (emails) => schoolRpc("set_my_school_teachers", { p_emails: emails || [] }),
    teacherStatus: () => schoolRpc("my_school_teacher_status"),
  },
  billing: {
    checkout: (plan, extra) => billingInvoke("create-checkout", { plan: plan || "individuel", ...(extra || {}) }),
    portal: (flow) => billingInvoke("customer-portal", flow ? { flow } : {}),
    // Round 68 : Super enseignant — classes couvertes.
    updateSuperClasses: (classIds) => billingInvoke("update-super-classes", { classIds }, true),
    // v238 : Super école — paiement sur facture, nombre d'enseignants payés.
    schoolInvoice: (seats) => billingInvoke("create-checkout", { plan: "super_ecole", seats, invoice: true }, true),
    schoolSeats: (seats) => billingInvoke("school-seats", { seats }, true),
    coveredClasses: async () => {
      const c = getClient();
      if (!c) return null;
      const { data, error } = await c.rpc("my_covered_classes");
      if (error) return null;
      return Array.isArray(data) ? data : [];
    },
  },
  library: {
    share: shareCollectionToLibrary,
    list: listLibraryCollections,
    get: getLibraryCollection,
    cards: fetchLibraryCollectionCards,
    submit: submitLibraryProposal,
    rate: rateLibraryCollection,
    unrate: unrateLibraryCollection,
    listRatings: listLibraryRatings,
    findBySourceSubject: findLibraryCollectionBySourceSubject,
    updateMeta: updateLibraryCollectionMeta,
    updateCards: updateLibraryCollectionCards,
    delete: deleteLibraryCollection,
  },
};
