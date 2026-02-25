import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

interface ConfirmDialogState {
  isOpen: boolean;
  options: ConfirmDialogOptions | null;
  resolve: ((value: boolean) => void) | null;

  openConfirmDialog: (options: ConfirmDialogOptions) => Promise<boolean>;
  closeDialog: () => void;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmDialogStore = create<ConfirmDialogState>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      options: null,
      resolve: null,

      openConfirmDialog: (options) => {
        return new Promise<boolean>((resolve) => {
          set({
            isOpen: true,
            options,
            resolve,
          });
        });
      },

      closeDialog: () => {
        const { resolve } = get();
        resolve?.(false);
        set({ isOpen: false, options: null, resolve: null });
      },

      handleConfirm: () => {
        const { resolve } = get();
        resolve?.(true);
        set({ isOpen: false, options: null, resolve: null });
      },

      handleCancel: () => {
        get().closeDialog();
      },
    }),
    { name: "ConfirmDialogStore" }
  )
);

export const useConfirm = () => {
  const { openConfirmDialog } = useConfirmDialogStore();

  return (options: ConfirmDialogOptions) => openConfirmDialog(options);
};
