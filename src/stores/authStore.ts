import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createVersionedStorage } from '../utils/storage';

export interface User {
  id: number;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUserName: (name: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUserName: (name) =>
        set((state) =>
          state.user ? { user: { ...state.user, name } } : {}
        ),
    }),
    {
      name: 'auth-storage',
      version: 1,
      storage: createJSONStorage(() => createVersionedStorage('auth-storage', 1)),
    }
  )
);

export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUser = (state: AuthState) => state.user;
export const selectToken = (state: AuthState) => state.token;
