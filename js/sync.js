/**
 * Synchronisation multi-appareils via Supabase.
 *
 * Principe : pas de compte utilisateur. Un "code de synchronisation"
 * choisi par la personne fait office de mot de passe partagé — le même
 * code entré sur deux appareils fait apparaître les mêmes fiches.
 *
 * L'app reste 100% utilisable sans configuration : tant que Sync n'est
 * pas configuré, tout continue à fonctionner uniquement en local
 * (voir db.js).
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

function getConfig() {
  return {
    url: localStorage.getItem(LS_KEYS.url) || "",
    key: localStorage.getItem(LS_KEYS.key) || "",
    code: localStorage.getItem(LS_KEYS.code) || "",
  };
}

function isConfigured() {
  const { url, key, code } = getConfig();
  return Boolean(url && key && code);
}

function saveConfig({ url, key, code }) {
  localStorage.setItem(LS_KEYS.url, url.trim());
  localStorage.setItem(LS_KEYS.key, key.trim());
  localStorage.setItem(LS_KEYS.code, code.trim());
  client = null; // force la recréation du client au prochain appel
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
function cardToRow(card, syncCode) {
  return {
    id: card.id,
    sync_code: syncCode,
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
  return {
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
  };
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
  const { code } = getConfig();
  if (!c || !code) return [];

  const all = [];
  let from = 0;

  while (true) {
    const to = from + PULL_PAGE_SIZE - 1;
    const { data, error } = await c
      .from("cards")
      .select("*")
      .eq("sync_code", code)
      .range(from, to);

    if (error) {
      console.warn("Sync: échec du chargement distant", error.message);
      lastError = error.message;
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
  const { code } = getConfig();
  if (!c || !code) return false;

  let row = cardToRow(card, code);
  let { error } = await c.from("cards").upsert(row);

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
    ({ error } = await c.from("cards").upsert(rowWithoutRewards));
  }

  if (error) {
    console.warn("Sync: échec de l'envoi, mis en attente", error.message);
    lastError = error.message;
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
  const { code } = getConfig();
  if (!c || !code) return () => {};

  const channel = c
    .channel(`cards-${code}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "cards", filter: `sync_code=eq.${code}` },
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
function subjectToRow(subject, syncCode) {
  return {
    id: subject.id,
    sync_code: syncCode,
    name: subject.name,
    folder_id: subject.folderId || null,
    mode_id: subject.modeId || "normal",
    created_at: subject.createdAt,
    updated_at: subject.updatedAt || subject.createdAt,
    deleted: Boolean(subject.deleted),
  };
}
function rowToSubject(row) {
  return {
    id: row.id,
    name: row.name,
    folderId: row.folder_id || null,
    modeId: row.mode_id || "normal",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: Boolean(row.deleted),
  };
}

function folderToRow(folder, syncCode) {
  return {
    id: folder.id,
    sync_code: syncCode,
    name: folder.name,
    parent_id: folder.parentId || null,
    created_at: folder.createdAt,
    updated_at: folder.updatedAt || folder.createdAt,
    deleted: Boolean(folder.deleted),
  };
}
function rowToFolder(row) {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleted: Boolean(row.deleted),
  };
}

async function pullTable(tableName, rowMapper) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return [];
  const all = [];
  let from = 0;
  while (true) {
    const to = from + PULL_PAGE_SIZE - 1;
    const { data, error } = await c.from(tableName).select("*").eq("sync_code", code).range(from, to);
    if (error) {
      console.warn(`Sync: échec du chargement distant (${tableName})`, error.message);
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

async function pushSubject(subject) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return false;
  const { error } = await c.from("subjects").upsert(subjectToRow(subject, code));
  if (error) {
    console.warn("Sync: échec de l'envoi de la matière", error.message);
    return false;
  }
  return true;
}

async function pushFolder(folder) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return false;
  const { error } = await c.from("folders").upsert(folderToRow(folder, code));
  if (error) {
    console.warn("Sync: échec de l'envoi du dossier", error.message);
    return false;
  }
  return true;
}

function subscribeSubjectsRealtime(onRemoteChange) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return () => {};
  const channel = c
    .channel(`subjects-${code}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "subjects", filter: `sync_code=eq.${code}` },
      (payload) => {
        if (payload.new) onRemoteChange(rowToSubject(payload.new));
      }
    )
    .subscribe();
  return () => c.removeChannel(channel);
}

function subscribeFoldersRealtime(onRemoteChange) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return () => {};
  const channel = c
    .channel(`folders-${code}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "folders", filter: `sync_code=eq.${code}` },
      (payload) => {
        if (payload.new) onRemoteChange(rowToFolder(payload.new));
      }
    )
    .subscribe();
  return () => c.removeChannel(channel);
}

/* ---------------------------------------------------------
   Modes d'apprentissage (item 1, audit synchro) : jusqu'ici jamais
   synchronisés du tout — seul le modeId de chaque matière l'était. Même
   schéma que matières/dossiers : upsert, suppression douce, temps réel.
--------------------------------------------------------- */
function learningModeToRow(mode, syncCode) {
  return {
    id: mode.id,
    sync_code: syncCode,
    name: mode.name,
    builtin: Boolean(mode.builtin),
    ka: mode.Ka, kh: mode.Kh, kg: mode.Kg, ke: mode.Ke,
    ma: mode.Ma, mh: mode.Mh, mg: mode.Mg, me: mode.Me,
    updated_at: mode.updatedAt || new Date().toISOString(),
    deleted: Boolean(mode.deleted),
  };
}
function rowToLearningMode(row) {
  return {
    id: row.id,
    name: row.name,
    builtin: Boolean(row.builtin),
    Ka: row.ka, Kh: row.kh, Kg: row.kg, Ke: row.ke,
    Ma: row.ma, Mh: row.mh, Mg: row.mg, Me: row.me,
    updatedAt: row.updated_at,
    deleted: Boolean(row.deleted),
  };
}

async function pullLearningModes() {
  return pullTable("learning_modes", rowToLearningMode);
}

async function pushLearningMode(mode) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return false;
  const { error } = await c.from("learning_modes").upsert(learningModeToRow(mode, code));
  if (error) {
    console.warn("Sync: échec de l'envoi du mode d'apprentissage", error.message);
    return false;
  }
  return true;
}

function subscribeLearningModesRealtime(onRemoteChange) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return () => {};
  const channel = c
    .channel(`learning-modes-${code}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "learning_modes", filter: `sync_code=eq.${code}` },
      (payload) => {
        if (payload.new) onRemoteChange(rowToLearningMode(payload.new));
      }
    )
    .subscribe();
  return () => c.removeChannel(channel);
}

/* ---------------------------------------------------------
   État des récompenses (page "Récompenses") : une seule ligne JSON par
   code de synchro, séparée des fiches. Contrairement aux fiches, il n'y a
   rien à fusionner champ par champ ici : on prend l'union des clés
   "case ouverte" des deux côtés (voir mergeRewardsOpened côté app.js).
--------------------------------------------------------- */
async function pullRewardState() {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return {};

  const { data, error } = await c
    .from("reward_state")
    .select("opened")
    .eq("sync_code", code)
    .maybeSingle();

  if (error) {
    console.warn("Sync: échec du chargement des récompenses distantes", error.message);
    return {};
  }
  return (data && data.opened) || {};
}

async function pushRewardState(openedMap) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return false;

  const { error } = await c.from("reward_state").upsert({
    sync_code: code,
    opened: openedMap,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("Sync: échec de l'envoi des récompenses", error.message);
    return false;
  }
  return true;
}

function subscribeRewardRealtime(onRemoteChange) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return () => {};

  const channel = c
    .channel(`reward-state-${code}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reward_state", filter: `sync_code=eq.${code}` },
      (payload) => {
        if (payload.new && payload.new.opened) onRemoteChange(payload.new.opened);
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
async function pullDevSettings() {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return null;

  const { data, error } = await c
    .from("dev_settings")
    .select("payload, updated_at")
    .eq("sync_code", code)
    .maybeSingle();

  if (error) {
    console.warn("Sync: échec du chargement des réglages développeur distants", error.message);
    return null;
  }
  return data ? { payload: data.payload || {}, updatedAt: data.updated_at } : null;
}

async function pushDevSettings(payload) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return false;

  const { error } = await c.from("dev_settings").upsert({
    sync_code: code,
    payload,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("Sync: échec de l'envoi des réglages développeur", error.message);
    return false;
  }
  return true;
}

function subscribeDevSettingsRealtime(onRemoteChange) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return () => {};

  const channel = c
    .channel(`dev-settings-${code}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "dev_settings", filter: `sync_code=eq.${code}` },
      (payload) => {
        if (payload.new && payload.new.payload) onRemoteChange({ payload: payload.new.payload, updatedAt: payload.new.updated_at });
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
  pullRewardState,
  pushRewardState,
  subscribeRewardRealtime,
  pullDevSettings,
  pushDevSettings,
  subscribeDevSettingsRealtime,
  pullSubjects,
  pushSubject,
  subscribeSubjectsRealtime,
  pullFolders,
  pushFolder,
  subscribeFoldersRealtime,
  pullLearningModes,
  pushLearningMode,
  subscribeLearningModesRealtime,
  pendingCount: () => getPending().length,
  getLastError: () => lastError,
};
