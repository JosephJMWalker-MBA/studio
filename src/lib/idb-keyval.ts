
// A simple Promise-based wrapper for IndexedDB.
// https://github.com/jakearchibald/idb-keyval

function withStore(
  dbName: string,
  storeName: string,
  type: IDBTransactionMode,
  callback: (store: IDBObjectStore) => void
): Promise<void> {
  const request = indexedDB.open(dbName, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(storeName);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, type);
      const store = tx.objectStore(storeName);
      callback(store);
      tx.oncomplete = () => db.close();
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

const dbName = 'decision-flipper-db';
const storeName = 'keyval';

export function get<T>(key: IDBValidKey): Promise<T | undefined> {
  let req: IDBRequest;
  return withStore(dbName, storeName, 'readonly', store => {
    req = store.get(key);
  }).then(() => req.result);
}

export function set(key: IDBValidKey, value: any): Promise<void> {
  return withStore(dbName, storeName, 'readwrite', store => {
    store.put(value, key);
  });
}

export function del(key: IDBValidKey): Promise<void> {
  return withStore(dbName_storeName, 'readwrite', store => {
    store.delete(key);
  });
}
