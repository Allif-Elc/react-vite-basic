import { useEffect, useRef } from "react";
import { useConfirmDialogStore } from "../stores/confirmDialogStore";
import { AlertTriangle, Info } from "lucide-react";

export const ConfirmDialog = () => {
  const { isOpen, options, handleConfirm, handleCancel } = useConfirmDialogStore();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmRef.current?.focus();

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleCancel();
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, handleCancel]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen || !options) return null;

  const isDanger = options.variant === "danger";
  const Icon = isDanger ? AlertTriangle : Info;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
        aria-hidden="true"
      />

      <div className="relative bg-popover text-popover-foreground rounded-lg shadow-lg max-w-md w-full p-6 animate-in fade-in-0 zoom-in-95 duration-200">
        <div
          className={`flex items-center gap-3 mb-4 ${isDanger ? "text-destructive" : "text-primary"}`}
        >
          <Icon className="w-6 h-6" />
          <h2 id="dialog-title" className="text-lg font-semibold">
            {options.title}
          </h2>
        </div>

        <p
          id="dialog-description"
          className="text-sm text-muted-foreground mb-6 whitespace-pre-line"
        >
          {options.message}
        </p>

        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {options.cancelText || "Cancel"}
          </button>
          <button
            ref={confirmRef}
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              isDanger
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {options.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};
