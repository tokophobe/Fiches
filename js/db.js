/**
 * Petite couche au-dessus d'IndexedDB pour stocker les fiches en local,
 * afin que l'appli fonctionne entièrement hors-ligne.
 */

const DB_NAME = "fiches-db";
const DB_VERSION = 1;
const STORE = "cards";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("dueDate", "dueDate", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const result = fn(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
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
};

window.DB = DB;
