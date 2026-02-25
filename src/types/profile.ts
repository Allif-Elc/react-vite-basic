import type { ApiResponse } from "./api";

export interface User {
  id_user: number;
  name: string;
  email: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id_profile: number;
  id_user: number;
  age?: number;
  gender?: "male" | "female" | "other";
  bio?: string;
  phonenumber?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateProfileRequest {
  id_user: number;
  age?: number;
  gender?: "male" | "female" | "other";
  bio?: string;
  phonenumber?: string;
  website?: string;
}

export interface UpdateProfileRequest {
  id_profile: number;
  age?: number;
  gender?: "male" | "female" | "other";
  bio?: string;
  phonenumber?: string;
  website?: string;
}

export type ProfileListResponse = ApiResponse<Profile[]>;
export type ProfileResponse = ApiResponse<Profile>;
