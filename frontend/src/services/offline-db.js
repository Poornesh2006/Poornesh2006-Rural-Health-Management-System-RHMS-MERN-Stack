import { openDB } from "idb";

const DB_NAME = "rhms-offline";
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains("cachedPatients")) {
      database.createObjectStore("cachedPatients");
    }
    if (!database.objectStoreNames.contains("cachedQueue")) {
      database.createObjectStore("cachedQueue");
    }
    if (!database.objectStoreNames.contains("pendingMutations")) {
      database.createObjectStore("pendingMutations", { keyPath: "id" });
    }
    if (!database.objectStoreNames.contains("draftForms")) {
      database.createObjectStore("draftForms");
    }
    if (!database.objectStoreNames.contains("syncMetadata")) {
      database.createObjectStore("syncMetadata");
    }
    if (!database.objectStoreNames.contains("appSettings")) {
      database.createObjectStore("appSettings");
    }
  },
});

export const offlineDb = {
  async set(storeName, key, value) {
    const db = await dbPromise;
    return db.put(storeName, value, key);
  },

  async get(storeName, key) {
    const db = await dbPromise;
    return db.get(storeName, key);
  },

  async getAll(storeName) {
    const db = await dbPromise;
    return db.getAll(storeName);
  },

  async addPendingMutation(item) {
    const db = await dbPromise;
    return db.put("pendingMutations", item);
  },

  async deletePendingMutation(id) {
    const db = await dbPromise;
    return db.delete("pendingMutations", id);
  },

  async clearAll() {
    const db = await dbPromise;
    await Promise.all(
      ["cachedPatients", "cachedQueue", "pendingMutations", "draftForms", "syncMetadata", "appSettings"].map((store) =>
        db.clear(store),
      ),
    );
  },
};
