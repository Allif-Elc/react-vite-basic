import { useEffect } from "react";
import { useToastStore } from "../stores/toastStore";

export const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        toasts.forEach((toast) => removeToast(toast.id));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between px-4 py-3 rounded-lg shadow-lg min-w-[300px] ${
            toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close toast"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
