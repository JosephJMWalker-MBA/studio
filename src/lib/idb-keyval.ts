
// A simple Promise-based wrapper for IndexedDB.
// https://github.com/jakearchibald/idb-keyval

function withStore(
  dbName: string,
  storeName: string,
  type: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest | void
): Promise<any> {
  const request = indexedDB.open(dbName, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(storeName);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, type);
      const store = tx.objectStore(storeName);
      const req = callback(store);
      
      if (req) {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }

      tx.oncomplete = () => {
        db.close();
        if (!req) resolve(undefined);
      };
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

const dbName = 'decision-flipper-db';
const storeName = 'keyval';

export function get<T>(key: IDBValidKey): Promise<T | undefined> {
  return withStore(dbName, storeName, 'readonly', store => {
    return store.get(key);
  });
}

export function set(key: IDBValidKey, value: any): Promise<void> {
  return withStore(dbName, storeName, 'readwrite', store => {
    store.put(value, key);
  });
}

export function del(key: IDBValidKey): Promise<void> {
  return withStore(dbName, storeName, 'readwrite', store => {
    store.delete(key);
  });
}
