import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initWebVitals } from "./utils/monitoring";
import { logger } from "./utils/logger";

// Initialize web-vitals monitoring
if (typeof window !== "undefined") {
  initWebVitals({
    logToConsole: import.meta.env.DEV,
    // Uncomment to enable analytics sending
    // sendToAnalytics: (metric) => { /* your analytics implementation */ }
  });
}

if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ =
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};

  // Expose storage utilities in dev mode for easy debugging
  const clearAppStorage = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes("auth") ||
          key.includes("project") ||
          key.includes("toast") ||
          key.startsWith("z-"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  };

  // Expose to window for easy access
  Object.assign(window, {
    clearAppStorage,
    listStorage: () => {
      const items: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          items[key] = value?.substring(0, 100) + (value && value.length > 100 ? "..." : "");
        }
      }
      logger.debug("[Storage] Storage contents", { keys: Object.keys(items) });
      return items;
    },
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
