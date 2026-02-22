import { StateStorage } from 'zustand/middleware';

export const createVersionedStorage = (storageName: string, currentVersion: number): StateStorage => {
  const storageKey = `z-${storageName}`;

  return {
    getItem: (name: string): string | null => {
      const key = name.replace(storageKey, storageName);
      const item = localStorage.getItem(key);

      if (item) {
        try {
          const parsed = JSON.parse(item);

          // Check version mismatch
          if (parsed.version !== undefined && parsed.version !== currentVersion) {
            console.log(`[Storage] Version mismatch for ${key}. Clearing old data (v${parsed.version} -> v${currentVersion})`);
            localStorage.removeItem(key);
            return null;
          }
        } catch {
          // Invalid JSON, clear it
          console.log(`[Storage] Invalid data for ${key}. Clearing.`);
          localStorage.removeItem(key);
          return null;
        }
      }

      return item;
    },
    setItem: (name: string, value: string): void => {
      const key = name.replace(storageKey, storageName);
      localStorage.setItem(key, value);
    },
    removeItem: (name: string): void => {
      const key = name.replace(storageKey, storageName);
      localStorage.removeItem(key);
    },
  };
};

export const clearOldStorage = (storageName: string) => {
  const key = storageName;
  const item = localStorage.getItem(key);

  if (item) {
    try {
      const parsed = JSON.parse(item);
      console.log(`[Storage] Current data for ${key}:`, parsed);
    } catch {
      console.log(`[Storage] Data for ${key} is not valid JSON`);
    }
  }
};

export const clearAllAppStorage = () => {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('auth-') || key.startsWith('project-') || key.startsWith('z-'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`[Storage] Cleared ${keysToRemove.length} storage item(s)`);
};
