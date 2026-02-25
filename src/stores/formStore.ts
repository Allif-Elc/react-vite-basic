import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RestAPIFormData } from "../schemas/restSchema";
import { createVersionedStorage } from "../utils/storage";

const versionedStorage = createVersionedStorage("form-draft-storage", 1);

const customStorage = {
  getItem: (name: string) => {
    const item = versionedStorage.getItem(name);
    if (!item) return null;
    try {
      return JSON.parse(String(item));
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    versionedStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    versionedStorage.removeItem(name);
  },
};

interface FormDraftState {
  drafts: Record<string, RestAPIFormData>;
  saveDraft: (formKey: string, data: RestAPIFormData) => void;
  loadDraft: (formKey: string) => RestAPIFormData | null;
  clearDraft: (formKey: string) => void;
}

export const useFormDraftStore = create<FormDraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      saveDraft: (formKey, data) =>
        set((state) => ({
          drafts: { ...state.drafts, [formKey]: data },
        })),
      loadDraft: (formKey) => get().drafts[formKey] || null,
      clearDraft: (formKey) =>
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[formKey];
          return { drafts: newDrafts };
        }),
    }),
    {
      name: "form-draft-storage",
      version: 1,
      storage: customStorage as any,
    }
  )
);
