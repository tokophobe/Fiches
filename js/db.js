/**
 * Petite couche au-dessus d'IndexedDB pour stocker les fiches en local,
 * afin que l'appli fonctionne entièrement hors-ligne.
 */

// Round 29 : une base par compte (voir js/user-scope.js) — l'ancienne base
// commune à l'appareil, « fiches-db », n'est plus que lue une fois, pour
// proposer de rattacher son contenu au premier compte qui se connecte.
const DB_NAME = (window.UserScope && window.UserScope.dbName) || "fiches-db";
const LEGACY_DB_NAME = (window.UserScope && window.UserScope.legacyDbName) || "fiches-db";
const DB_VERSION = 4;
const STORE = "cards";
const SUBJECT_STORE = "subjects";
const FOLDER_STORE = "folders";
const RATING_LOG_STORE = "ratingLog";
let dbConnectionPromise = null;

function openDb() {
  // Connexion mise en cache et réutilisée pour tous les appels, plutôt
  // qu'une nouvelle connexion IndexedDB ouverte à chaque lecture/écriture
  // (comme c'était le cas avant) sans jamais en fermer aucune : au fil
  // d'une session, ça empilait un nombre croissant de connexions ouvertes
  // en parallèle vers la même base — une cause plausible du "gel" ressenti
  // à l'enregistrement d'une fiche (chaque `indexedDB.open()` a un coût,
  // et ce coût grossissait avec le nombre de connexions déjà ouvertes).
  if (dbConnectionPromise) return dbConnectionPromise;
  dbConnectionPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("dueDate", "dueDate", { unique: false });
      }
      if (!db.objectStoreNames.contains(SUBJECT_STORE)) {
        db.createObjectStore(SUBJECT_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(FOLDER_STORE)) {
        db.createObjectStore(FOLDER_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(RATING_LOG_STORE)) {
        const store = db.createObjectStore(RATING_LOG_STORE, { keyPath: "id" });
        store.createIndex("at", "at", { unique: false });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // Si une autre connexion (ex. un autre onglet après mise à jour)
      // réclame une version supérieure, on referme proprement la nôtre
      // plutôt que de bloquer indéfiniment cette autre connexion.
      db.onversionchange = () => {
        db.close();
        dbConnectionPromise = null;
      };
      db.onclose = () => {
        dbConnectionPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => {
      dbConnectionPromise = null;
      reject(req.error);
    };
  });
  return dbConnectionPromise;
}

async function withStoreIn(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = fn(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function withStore(mode, fn) {
  return withStoreIn(STORE, mode, fn);
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const DB = {
  async getAll() {
    const db = await openDb();
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    return reqToPromise(store.getAll());
  },

  async put(card) {
    await withStore("readwrite", (store) => store.put(card));
    return card;
  },

  async remove(id) {
    await withStore("readwrite", (store) => store.delete(id));
  },

  async clear() {
    await withStore("readwrite", (store) => store.clear());
  },

  async bulkPut(cards) {
    await withStore("readwrite", (store) => {
      cards.forEach((c) => store.put(c));
    });
  },

  /* ---- matières (subjects) ---- */

  async getAllSubjects() {
    const db = await openDb();
    const tx = db.transaction(SUBJECT_STORE, "readonly");
    const store = tx.objectStore(SUBJECT_STORE);
    return reqToPromise(store.getAll());
  },

  async putSubject(subject) {
    await withStoreIn(SUBJECT_STORE, "readwrite", (store) => store.put(subject));
    return subject;
  },

  async removeSubject(id) {
    await withStoreIn(SUBJECT_STORE, "readwrite", (store) => store.delete(id));
  },

  /* ---- dossiers (folders) ---- */

  async getAllFolders() {
    const db = await openDb();
    const tx = db.transaction(FOLDER_STORE, "readonly");
    const store = tx.objectStore(FOLDER_STORE);
    return reqToPromise(store.getAll());
  },

  async putFolder(folder) {
    await withStoreIn(FOLDER_STORE, "readwrite", (store) => store.put(folder));
    return folder;
  },

  async removeFolder(id) {
    await withStoreIn(FOLDER_STORE, "readwrite", (store) => store.delete(id));
  },

  /* ---- historique des notes données (item 15) ---- */

  async addRatingLog(entry) {
    await withStoreIn(RATING_LOG_STORE, "readwrite", (store) => store.put(entry));
  },

  async getAllRatingLog() {
    const db = await openDb();
    const tx = db.transaction(RATING_LOG_STORE, "readonly");
    const store = tx.objectStore(RATING_LOG_STORE);
    return reqToPromise(store.getAll());
  },

  async removeFromRatingLog(id) {
    await withStoreIn(RATING_LOG_STORE, "readwrite", (store) => store.delete(id));
  },
};

/* ---- Round 29 : ancienne base commune à l'appareil ---- */
/** Contenu de l'ancienne base « fiches-db » (sans la créer si elle
 *  n'existe pas) : { cards, subjects, folders, ratingLog }, ou null. */
DB.readLegacy = async function () {
  if (LEGACY_DB_NAME === DB_NAME) return null;
  if (indexedDB.databases) {
    try {
      const list = await indexedDB.databases();
      if (!list.some((d) => d.name === LEGACY_DB_NAME)) return null;
    } catch (e) {
      /* liste indisponible : on tente l'ouverture quand même */
    }
  }
  const db = await new Promise((resolve) => {
    let created = false;
    const req = indexedDB.open(LEGACY_DB_NAME);
    req.onupgradeneeded = () => {
      // La base n'existait pas : on annule sa création.
      created = true;
      req.transaction.abort();
    };
    req.onsuccess = () => resolve(created ? null : req.result);
    req.onerror = () => resolve(null);
  });
  if (!db) return null;
  const readStore = (name) =>
    db.objectStoreNames.contains(name)
      ? reqToPromise(db.transaction(name, "readonly").objectStore(name).getAll())
      : Promise.resolve([]);
  const out = {
    cards: await readStore(STORE),
    subjects: await readStore(SUBJECT_STORE),
    folders: await readStore(FOLDER_STORE),
    ratingLog: await readStore(RATING_LOG_STORE),
  };
  db.close();
  return out;
};

/** Supprime l'ancienne base commune (après rattachement à un compte). */
DB.deleteLegacy = function () {
  return new Promise((resolve) => {
    if (LEGACY_DB_NAME === DB_NAME) return resolve();
    const req = indexedDB.deleteDatabase(LEGACY_DB_NAME);
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
};

/** Écrit d'un coup des fiches, boîtes, dossiers et notes dans la base du compte. */
DB.importAll = async function ({ cards = [], subjects = [], folders = [], ratingLog = [] }) {
  await withStoreIn(STORE, "readwrite", (st) => cards.forEach((x) => st.put(x)));
  await withStoreIn(SUBJECT_STORE, "readwrite", (st) => subjects.forEach((x) => st.put(x)));
  await withStoreIn(FOLDER_STORE, "readwrite", (st) => folders.forEach((x) => st.put(x)));
  await withStoreIn(RATING_LOG_STORE, "readwrite", (st) => ratingLog.forEach((x) => st.put(x)));
};

window.DB = DB;
