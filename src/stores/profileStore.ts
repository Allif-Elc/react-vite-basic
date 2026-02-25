import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  fetchCurrentUserProfile,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../services/profileService";
import type { Profile, CreateProfileRequest, UpdateProfileRequest } from "../types/profile";
import { useAuthStore } from "./authStore";
import { logger } from "../utils/logger";

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  createProfile: (data: Omit<CreateProfileRequest, "id_user">) => Promise<Profile>;
  updateProfile: (
    profileId: number,
    data: Omit<UpdateProfileRequest, "id_profile">
  ) => Promise<void>;
  deleteProfile: (profileId: number) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set) => ({
      profile: null,
      loading: false,
      error: null,
      fetchProfile: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id_user) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const profile = await fetchCurrentUserProfile(user.id_user);
          set({ profile, loading: false });
        } catch (error) {
          logger.error("[ProfileStore] Fetch failed", error);
          set({
            error: error instanceof Error ? error.message : "Failed to fetch profile",
            loading: false,
          });
        }
      },
      createProfile: async (data) => {
        set({ loading: true, error: null });
        try {
          const user = useAuthStore.getState().user;
          if (!user) {
            throw new Error("User not authenticated");
          }
          const requestData: CreateProfileRequest = {
            id_user: user.id_user,
            ...data,
          };
          const profile = await createProfile(requestData);
          set({ profile, loading: false });
          return profile;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to create profile",
            loading: false,
          });
          throw error;
        }
      },
      updateProfile: async (profileId, data) => {
        set({ loading: true, error: null });
        try {
          const profile = await updateProfile(profileId, data);
          set({ profile, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update profile",
            loading: false,
          });
          throw error;
        }
      },
      deleteProfile: async (profileId) => {
        set({ loading: true, error: null });
        try {
          await deleteProfile(profileId);
          set({ profile: null, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to delete profile",
            loading: false,
          });
          throw error;
        }
      },
      clearError: () => set({ error: null }),
    }),
    { name: "ProfileStore" }
  )
);

export const selectProfile = (state: ProfileState) => state.profile;
export const selectProfileLoading = (state: ProfileState) => state.loading;
export const selectProfileError = (state: ProfileState) => state.error;
