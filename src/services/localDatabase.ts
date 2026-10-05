import type { WeeklyPhoto, WeightEntry } from '../types';

// Photos can exceed localStorage quotas. IndexedDB stores them on this device;
// this is not an encrypted cloud backup and browsers may still evict local data.
const DATABASE = 'auraslim-local-v1';
const STORE = 'records';
let opening: Promise<IDBDatabase> | null = null;
function openDatabase(): Promise<IDBDatabase> {
  if (opening) return opening;
  opening = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('IndexedDB indisponible')); return; }
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => { request.result.createObjectStore(STORE); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return opening;
}
export async function readLocalRecords(): Promise<{weights?: WeightEntry[]; photos?: WeeklyPhoto[]}> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly'), store = tx.objectStore(STORE);
    const weights = store.get('weights'), photos = store.get('photos');
    tx.oncomplete = () => resolve({ weights: weights.result as WeightEntry[] | undefined, photos: photos.result as WeeklyPhoto[] | undefined });
    tx.onerror = () => reject(tx.error);
  });
}
export async function writeLocalRecords(key: 'photos' | 'weights', value: WeeklyPhoto[] | WeightEntry[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
export async function clearLocalRecords(): Promise<void> {
  if (!('indexedDB' in window)) return;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
