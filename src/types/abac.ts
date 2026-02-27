import type { ApiResponse } from "./api";

export interface Attribute {
  id_attribute: number;
  name: string;
  description?: string;
  type: "string" | "number" | "boolean" | "enum";
  enum_values?: string[];
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id_resource: number;
  name: string;
  description?: string;
  resource_type: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id_permission: number;
  name: string;
  description?: string;
  effect: "allow" | "deny";
  actions: string[];
  condition?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAttributeRequest {
  name: string;
  description?: string;
  type: "string" | "number" | "boolean" | "enum";
  enum_values?: string[];
}

export interface UpdateAttributeRequest {
  name?: string;
  description?: string;
  type?: "string" | "number" | "boolean" | "enum";
  enum_values?: string[];
}

export interface CreateResourceRequest {
  name: string;
  description?: string;
  resource_type: string;
}

export interface UpdateResourceRequest {
  name?: string;
  description?: string;
  resource_type?: string;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
  effect: "allow" | "deny";
  actions: string[];
  condition?: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  effect?: "allow" | "deny";
  actions?: string[];
  condition?: string;
}

export type AttributeListResponse = ApiResponse<Attribute[]>;
export type AttributeResponse = ApiResponse<Attribute>;
export type ResourceListResponse = ApiResponse<Resource[]>;
export type ResourceResponse = ApiResponse<Resource>;
export type PermissionListResponse = ApiResponse<Permission[]>;
export type PermissionResponse = ApiResponse<Permission>;

export interface UserPolicy {
  id_user_policy: number;
  id_user: number;
  id_policy: number;
  priority: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  created_by?: number;
}

export interface UserPolicyDetail {
  id_user_policy: number;
  id_user: number;
  user_name: string;
  user_email: string;
  id_policy: number;
  policy_name: string;
  policy_rule: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface Policy {
  id_policy: number;
  name: string;
  policy_rule: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PolicyRule {
  // Deprecated: Use attribute_name and attribute_value instead
  role?: string;
  // New fields for attribute-based authorization
  attribute_name?: string;
  attribute_value?: string;
  resource: string;
  action: string[];
}

export interface CreatePolicyRequest {
  name: string;
  policy_rule: PolicyRule;
  is_active?: boolean;
}

export interface UpdatePolicyRequest {
  name?: string;
  policy_rule?: PolicyRule;
  is_active?: boolean;
}

export type PolicyResponse = ApiResponse<Policy>;

export interface CreateUserPolicyRequest {
  id_user: number;
  id_policy: number;
  priority: number;
  expires_at?: string;
}

export interface UpdateUserPolicyRequest {
  priority?: number;
  is_active?: boolean;
  expires_at?: string;
}

export interface User {
  id_user: number;
  name: string;
  email: string;
}

export type UserPolicyListResponse = ApiResponse<UserPolicyDetail[]>;
export type UserPolicyResponse = ApiResponse<UserPolicy>;
export type PolicyListResponse = ApiResponse<Policy[]>;
export type UserListResponse = ApiResponse<User[]>;

export interface UserAttributeDetail {
  id_user_attribute: number;
  id_user: number;
  user_name: string;
  user_email: string;
  id_attribute: number;
  attribute_name: string;
  attribute_type: "string" | "number" | "boolean" | "enum";
  enum_values?: string[];
  value: string;
  created_at: string;
}

export interface CreateUserAttributeRequest {
  id_user: number;
  id_attribute: number;
  value: string;
}

export interface UpdateUserAttributeRequest {
  value: string;
}

export type UserAttributeListResponse = ApiResponse<UserAttributeDetail[]>;
export type UserAttributeResponse = ApiResponse<UserAttributeDetail>;
