import { StateStorage } from "zustand/middleware";
import { logger } from "./logger";

export const createVersionedStorage = (
  storageName: string,
  currentVersion: number
): StateStorage => {
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
            localStorage.removeItem(key);
            return null;
          }
        } catch (e) {
          // Invalid JSON, clear it
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
      logger.debug(`[Storage] Current data for ${key}`, { hasData: !!parsed });
    } catch {
      logger.debug(`[Storage] Data for ${key} is not valid JSON`);
    }
  }
};

export const clearAllAppStorage = () => {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("auth-") || key.startsWith("project-") || key.startsWith("z-"))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
  logger.debug(`[Storage] Cleared storage items`, { count: keysToRemove.length });
};
