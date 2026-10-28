/**
 * Image storage utility using IndexedDB with fallback to localStorage.
 * Optimizes pasted/uploaded images to WebP/JPEG data URLs for high performance.
 */

const DB_NAME = 'RestaurantMenuDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_images';
const LOCAL_STORAGE_KEY = 'restaurant_custom_images_backup';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Loads all saved custom images as a key-value record { [itemId]: dataUrl }
 */
export async function loadAllCustomImages(): Promise<Record<string, string>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result || [];
        const map: Record<string, string> = {};
        for (const item of result) {
          if (item && item.id && item.dataUrl) {
            map[item.id] = item.dataUrl;
          }
        }
        resolve(map);
      };

      request.onerror = () => {
        resolve(loadFromLocalStorage());
      };
    });
  } catch {
    return loadFromLocalStorage();
  }
}

/**
 * Saves a custom image for a menu item into IndexedDB and localStorage fallback.
 */
export async function saveCustomImageToDB(id: string, dataUrl: string, name?: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        id,
        dataUrl,
        name: name || '',
        updatedAt: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback to localStorage
  }

  // Backup in localStorage
  saveToLocalStorage(id, dataUrl);
}

/**
 * Deletes a custom image for a menu item.
 */
export async function deleteCustomImageFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Ignore
  }

  deleteFromLocalStorage(id);
}

/**
 * Clears all custom images.
 */
export async function clearAllCustomImagesFromDB(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Ignore
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

// LocalStorage Fallback helpers
function loadFromLocalStorage(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToLocalStorage(id: string, dataUrl: string) {
  try {
    const current = loadFromLocalStorage();
    current[id] = dataUrl;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // LocalStorage quota might be exceeded, which is why IndexedDB is primary
  }
}

function deleteFromLocalStorage(id: string) {
  try {
    const current = loadFromLocalStorage();
    delete current[id];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Ignore
  }
}

/**
 * Optimizes an image File or Blob:
 * - Scales to max 1200px dimension
 * - Converts to WebP / JPEG with 0.85 quality
 * - Returns a crisp, lightweight data URL
 */
export function optimizeImage(fileOrBlob: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Failed to read image'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        // Clean rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', 0.85);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // Ignore
        }

        const jpegData = canvas.toDataURL('image/jpeg', 0.85);
        resolve(jpegData);
      };

      img.onerror = () => {
        // If image object fails to decode (e.g. svg or raw), return rawDataUrl
        resolve(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(fileOrBlob);
  });
}
