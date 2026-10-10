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

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0/O/1/I/L

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

async function pullAll() {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return [];

  const all = [];
  let from = 0;

  while (true) {
    const to = from + PULL_PAGE_SIZE - 1;
    const { data, error } = await c
      .from("cards")
      .select("*")
      .eq("owner_id", uid)
      .range(from, to);

    if (error) {
      console.warn("Sync: échec du chargement distant", error.message);
      lastError = error.message;
      noteError(error);
      // On garde ce qui a déjà été récupéré plutôt que de tout jeter :
      // mieux vaut une synchro partielle que rien du tout.
      return all.map(rowToCard);
    }

    all.push(...data);
    if (data.length < PULL_PAGE_SIZE) break; // dernière page atteinte
    from += PULL_PAGE_SIZE;
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
  const all = [];
  let from = 0;
  while (true) {
    const to = from + PULL_PAGE_SIZE - 1;
    const { data, error } = await c.from(tableName).select("*").eq("owner_id", uid).range(from, to);
    if (error) {
      console.warn(`Sync: échec du chargement distant (${tableName})`, error.message);
      noteError(error);
      return all.map(rowMapper);
    }
    all.push(...data);
    if (data.length < PULL_PAGE_SIZE) break;
    from += PULL_PAGE_SIZE;
  }
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
    return [];
  }
  return data || [];
}
async function countMyCardReports() {
  const c = getClient();
  const uid = currentUid();
  if (!c || !uid) return { open: 0, unread: 0 };
  const { data, error } = await c.from("card_reports").select("id, read_at").eq("author_id", uid).eq("resolved", false);
  if (error) return { open: 0, unread: 0 };
  return { open: (data || []).length, unread: (data || []).filter((r) => !r.read_at).length };
}
async function markCardReportsRead(ids) {
  const c = getClient();
  if (!c || !ids || !ids.length) return { error: null };
  const { error } = await c.from("card_reports").update({ read_at: new Date().toISOString() }).in("id", ids);
  return { error: error ? error.message : null };
}
async function resolveCardReport(id) {
  const c = getClient();
  if (!c) return { error: "non connecté" };
  const { error } = await c.from("card_reports").update({ resolved: true, read_at: new Date().toISOString() }).eq("id", id);
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
  const { data, error } = await c.from("library_collections").update(fields).eq("id", id).eq("owner_id", user.id).select("id");
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
async function authSignUp(email, password, firstName, lastName) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  const options = {};
  if (firstName || lastName) {
    options.data = { first_name: (firstName || "").trim(), last_name: (lastName || "").trim() };
  }
  const { data, error } = await c.auth.signUp({ email, password, options });
  return { data, error: error ? error.message : null };
}

/** Permet aussi de renseigner/corriger nom-prénom après coup, depuis la page
 *  Mon Compte, pour les comptes déjà créés avant ce round. */
async function authUpdateProfile(firstName, lastName) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
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
  const { data, error } = await c.auth.updateUser({ data: fields || {} });
  return { data, error: error ? error.message : null };
}

/** Round 21, item 6 : nouveau solde de jetons après un achat dans la
 *  Bibliothèque (voir confirmAndTakeLibraryCollection, js/app.js) — même
 *  principe que school_level/token_balance (round 18/19), simple
 *  métadonnée du Compte, pas de vraie table de transactions (le crédit
 *  reste un système informel, cf. round 18 item 16 : pas encore de moyen
 *  d'ACHETER des jetons, seulement de les dépenser ici). */
async function authUpdateTokenBalance(newBalance) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  const { data, error } = await c.auth.updateUser({
    data: { token_balance: Math.max(0, Number(newBalance) || 0) },
  });
  return { data, error: error ? error.message : null };
}

async function authSignIn(email, password) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  return { data, error: error ? error.message : null };
}

async function authSignOut() {
  const c = getClient();
  if (!c) return;
  await c.auth.signOut();
}

async function authGetUser() {
  const c = getClient();
  if (!c) return null;
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
    cards: cards.map((card) => ({ id: card.id, question: card.question, answer: card.answer })),
    folder_path: Array.isArray(folderPath) ? folderPath : [],
  };
  // Round 47 : boîte venue de la Librairie — on garde la collection
  // d'origine (colonne library_collection_id, voir
  // supabase/class_members_list_migration.sql) ; sans la colonne, on
  // partage quand même.
  if (extra && extra.libraryCollectionId) row.library_collection_id = extra.libraryCollectionId;
  let { data, error } = await c.from("shared_boxes").insert(row).select().single();
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
async function updateSharedBoxCards(boxId, cards, folderPath) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const payload = {
    cards: cards.map((card) => ({ id: card.id, question: card.question, answer: card.answer })),
    updated_at: new Date().toISOString(),
  };
  if (Array.isArray(folderPath)) payload.folder_path = folderPath;
  const { error } = await c.from("shared_boxes").update(payload).eq("id", boxId);
  return { error: error ? error.message : null };
}

/* ---- Round 3, item 4 (squelette) : événements de calendrier partagés ---- */

/** Round 26, item 2 : identité du professeur affichée côté élève —
 *  "Prénom Nom" des métadonnées du compte, repli sur l'email. */
function teacherDisplayName(user) {
  const meta = (user && user.user_metadata) || {};
  return `${meta.first_name || ""} ${meta.last_name || ""}`.trim() || (user && user.email) || "";
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
    cards: cards.map((card) => ({ id: card.id, question: card.question, answer: card.answer })),
  };
  const { data, error } = await c.from("library_collections").insert(row).select().single();
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
  const { data, error } = await c.from("library_ratings").select("collection_id, user_id, rating");
  if (error) {
    console.warn("Librairie : échec du chargement des notes", error.message);
    return [];
  }
  return data || [];
}

async function listLibraryCollections() {
  const c = getClient();
  if (!c) return [];
  const { data, error } = await c.from("library_collections").select("*").order("shared_at", { ascending: false });
  if (error) {
    console.warn("Librairie : échec du chargement des collections partagées", error.message);
    return [];
  }
  return data || [];
}

/** Round 10, item 2 : une collection prise dans la Bibliothèque devient un
 *  miroir en lecture seule (même principe que shared_boxes pour une classe)
 *  plutôt qu'une copie figée — il faut donc pouvoir relire une collection
 *  précise par son id pour la reconcilier périodiquement côté client. */
async function getLibraryCollection(id) {
  const c = getClient();
  if (!c || !id) return null;
  const { data, error } = await c.from("library_collections").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.warn("Librairie : échec du rechargement d'une collection", error.message);
    return null;
  }
  return data || null;
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
  const row = { class_id: classId, sender_id: user.id, sender_email: user.email || "", body: trimmed };
  const { data, error } = await c.from("class_messages").insert(row).select().single();
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

window.Sync = {
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
    updateTokenBalance: authUpdateTokenBalance,
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
    countMine: countMyCardReports,
    markRead: markCardReportsRead,
    resolve: resolveCardReport,
    sharedBoxAuthor,
  },
  library: {
    share: shareCollectionToLibrary,
    list: listLibraryCollections,
    get: getLibraryCollection,
    rate: rateLibraryCollection,
    unrate: unrateLibraryCollection,
    listRatings: listLibraryRatings,
    findBySourceSubject: findLibraryCollectionBySourceSubject,
    updateMeta: updateLibraryCollectionMeta,
    delete: deleteLibraryCollection,
  },
};
