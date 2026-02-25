import api from "./api";
import type {
  Profile,
  CreateProfileRequest,
  UpdateProfileRequest,
  ProfileListResponse,
  ProfileResponse,
} from "../types/profile";
import { logger } from "../utils/logger";

const unwrapResponse = <T>(response: { data: ProfileResponse | ProfileListResponse }): T => {
  const data = response.data as any;
  if (data.status === "error") {
    throw new Error(data.message || data.error || "Request failed");
  }
  return data.data as T;
};

export const fetchProfiles = async (): Promise<Profile[]> => {
  const response = await api.get<ProfileListResponse>("/api/v1/profiles");
  const data = unwrapResponse<Profile[]>(response);
  return Array.isArray(data) ? data : [];
};

export const fetchProfile = async (profileId: number): Promise<Profile> => {
  const response = await api.get<ProfileResponse>(`/api/v1/profiles/${profileId}`);
  return unwrapResponse<Profile>(response);
};

export const fetchCurrentUserProfile = async (userId: number): Promise<Profile | null> => {
  try {
    if (!userId) {
      logger.error("[Profile] No user ID provided");
      throw new Error("User not authenticated");
    }

    const url = `/api/v1/profiles/me?userId=${userId}`;
    const response = await api.get<ProfileResponse>(url);
    return unwrapResponse<Profile>(response);
  } catch (error) {
    logger.error("[Profile] Error fetching profile", error);
    // Return null to allow "Create Profile" flow
    return null;
  }
};

export const createProfile = async (data: CreateProfileRequest): Promise<Profile> => {
  const response = await api.post<ProfileResponse>("/api/v1/profiles", data);
  return unwrapResponse<Profile>(response);
};

export const updateProfile = async (
  profileId: number,
  data: Omit<UpdateProfileRequest, "id_profile">
): Promise<Profile> => {
  const requestData: UpdateProfileRequest = {
    id_profile: profileId,
    ...data,
  };
  const response = await api.put<ProfileResponse>(`/api/v1/profiles/${profileId}`, requestData);
  return unwrapResponse<Profile>(response);
};

export const deleteProfile = async (profileId: number): Promise<void> => {
  await api.delete(`/api/v1/profiles/${profileId}`);
};
