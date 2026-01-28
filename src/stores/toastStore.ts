import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error') => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>()(
  devtools(
    (set) => ({
      toasts: [],
      addToast: (message, type) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            { id: Date.now().toString(), message, type },
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      clearToasts: () => set({ toasts: [] }),
    }),
    { name: 'ToastStore' }
  )
);
