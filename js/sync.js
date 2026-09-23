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

async function pushPublicDevSettings(settings) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée (URL/clé Supabase manquantes)." };
  try {
    const { error } = await c.from("dev_settings_public").upsert({
      id: "global",
      settings,
      updated_at: new Date().toISOString(),
    });
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
        onRemoteChange({ payload: payload.new.settings, updatedAt: payload.new.updated_at });
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
  const { data } = await c.auth.getUser();
  return (data && data.user) || null;
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
async function shareBoxToClass(classId, subjectName, cards, folderPath) {
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
  const { data, error } = await c.from("shared_boxes").insert(row).select().single();
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

async function shareEventToClass(classId, title, date) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "Non connecté." };
  const row = { class_id: classId, shared_by: user.id, title, date };
  const { data, error } = await c.from("shared_events").insert(row).select().single();
  return { data, error: error ? error.message : null };
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

async function updateSharedEvent(eventId, title, date) {
  const c = getClient();
  if (!c) return { error: "Sync non configurée." };
  const { error } = await c
    .from("shared_events")
    .update({ title, date, updated_at: new Date().toISOString() })
    .eq("id", eventId);
  return { error: error ? error.message : null };
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

async function shareCollectionToLibrary(name, cards) {
  const c = getClient();
  const user = await authGetUser();
  if (!c || !user) return { error: "Non connecté." };
  const row = {
    owner_id: user.id,
    owner_email: user.email || "",
    name,
    cards: cards.map((card) => ({ id: card.id, question: card.question, answer: card.answer })),
  };
  const { data, error } = await c.from("library_collections").insert(row).select().single();
  return { data, error: error ? error.message : null };
}

async function listLibraryCollections() {
  const c = getClient();
  if (!c) return [];
  const { data, error } = await c.from("library_collections").select("*").order("shared_at", { ascending: false });
  if (error) {
    console.warn("Bibliothèque : échec du chargement des collections partagées", error.message);
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
    console.warn("Bibliothèque : échec du rechargement d'une collection", error.message);
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
  pullRewardState,
  pushRewardState,
  subscribeRewardRealtime,
  fetchPublicDevSettings,
  pushPublicDevSettings,
  subscribePublicDevSettingsRealtime,
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
  auth: {
    signUp: authSignUp,
    signIn: authSignIn,
    signOut: authSignOut,
    getUser: authGetUser,
    onChange: authOnChange,
    updateProfile: authUpdateProfile,
  },
  classes: {
    create: createClass,
    listAsTeacher: listClassesAsTeacher,
    listAsStudent: listClassesAsStudent,
    memberCount: classMemberCount,
    join: joinClassByCode,
    shareBox: shareBoxToClass,
    listSharedBoxes: listSharedBoxesForClass,
    updateSharedBoxCards,
    shareEvent: shareEventToClass,
    listSharedEvents: listSharedEventsForClass,
    updateSharedEvent,
    deleteSharedEvent,
  },
  messages: {
    listClasses: listMessageClasses,
    list: listClassMessages,
    send: sendClassMessage,
    countUnread: countUnreadClassMessages,
    subscribeRealtime: subscribeClassMessagesRealtime,
    getLastMessage: getLastClassMessage,
  },
  library: {
    share: shareCollectionToLibrary,
    list: listLibraryCollections,
    get: getLibraryCollection,
  },
};
