import { useEffect, useRef } from "react";
import { useToastStore } from "../stores/toastStore";

export const Toast = () => {
  const { toasts, removeToast } = useToastStore();
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const currentTimers = timersRef.current;

    toasts.forEach((toast) => {
      if (!currentTimers.has(toast.id)) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
          currentTimers.delete(toast.id);
        }, 4000);
        currentTimers.set(toast.id, timer);
      }
    });

    // Clean up timers for removed toasts
    currentTimers.forEach((timer, id) => {
      if (!toasts.find((t) => t.id === id)) {
        clearTimeout(timer);
        currentTimers.delete(id);
      }
    });

    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between px-4 py-3 rounded-lg shadow-lg min-w-[300px] transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" && <span aria-hidden="true">✓</span>}
            {toast.type === "error" && <span aria-hidden="true">✕</span>}
            {toast.type === "warning" && <span aria-hidden="true">⚠</span>}
            <span className="text-sm">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-white hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white rounded"
            aria-label={`Dismiss ${toast.type} notification: ${toast.message}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
