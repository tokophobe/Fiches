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
async function pullAll() {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return [];
  const { data, error } = await c
    .from("cards")
    .select("*")
    .eq("sync_code", code);
  if (error) {
    console.warn("Sync: échec du chargement distant", error.message);
    lastError = error.message;
    return [];
  }
  lastError = "";
  return data.map(rowToCard);
}

let lastError = "";

async function pushCard(card) {
  const c = getClient();
  const { code } = getConfig();
  if (!c || !code) return false;
  const { error } = await c.from("cards").upsert(cardToRow(card, code));
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
  pendingCount: () => getPending().length,
  getLastError: () => lastError,
};
