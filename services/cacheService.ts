// IndexedDB-backed offline cache for expenses
const DB_NAME = 'SpendSmart';
const DB_VERSION = 1;
const STORE_NAME = 'expenses';

let db: IDBDatabase | null = null;

export const initCache = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      db = req.result;
      resolve();
    };
    req.onupgradeneeded = (e: any) => {
      const newDb = e.target.result;
      if (!newDb.objectStoreNames.contains(STORE_NAME)) {
        const store = newDb.createObjectStore(STORE_NAME, { keyPath: 'tempId', autoIncrement: true });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

export interface CachedExpense {
  tempId?: number;
  id?: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  description: string;
  synced?: boolean;
  createdAt?: number;
  error?: string;
}

export const addToCache = async (expense: CachedExpense): Promise<void> => {
  if (!db) await initCache();
  return new Promise((resolve, reject) => {
    const tx = db!.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add({
      ...expense,
      synced: false,
      createdAt: Date.now()
    });
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
};

export const getCachedExpenses = async (synced?: boolean): Promise<CachedExpense[]> => {
  if (!db) await initCache();
  return new Promise((resolve, reject) => {
    const tx = db!.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = synced !== undefined ? store.index('synced').getAll(IDBKeyRange.only(synced)) : store.getAll();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result || []);
  });
};

export const markSynced = async (tempId: number, realId: string): Promise<void> => {
  if (!db) await initCache();
  return new Promise((resolve, reject) => {
    const tx = db!.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(tempId);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const expense = req.result;
      if (expense) {
        expense.synced = true;
        expense.id = realId;
        const updateReq = store.put(expense);
        updateReq.onerror = () => reject(updateReq.error);
        updateReq.onsuccess = () => resolve();
      } else resolve();
    };
  });
};

export const clearCache = async (): Promise<void> => {
  if (!db) await initCache();
  return new Promise((resolve, reject) => {
    const tx = db!.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
};

export default {};
