const DB_NAME = "dsa_editor_db";
const STORE_NAME = "editor_states";
const DB_VERSION = 1;

export interface SavedEditorState {
  code: string;
  caretOffset: number;
}

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported on this environment."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export function saveEditorState(
  questionSlug: string,
  lang: string,
  code: string,
  caretOffset: number
): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const key = `${questionSlug}_${lang}`;
      
      const record = {
        code,
        caretOffset,
        updatedAt: Date.now(),
      };

      const request = store.put(record, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  }).catch((err) => {
    console.error("saveEditorState failed:", err);
  });
}

export function getEditorState(
  questionSlug: string,
  lang: string
): Promise<SavedEditorState | null> {
  return initDB().then((db) => {
    return new Promise<SavedEditorState | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const key = `${questionSlug}_${lang}`;
      
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? (request.result as SavedEditorState) : null);
      };
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  }).catch((err) => {
    console.warn("getEditorState failed:", err);
    return null;
  });
}
