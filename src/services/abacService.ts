import api from "./api";
import type {
  Attribute,
  Resource,
  Permission,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  CreateResourceRequest,
  UpdateResourceRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  AttributeListResponse,
  AttributeResponse,
  ResourceListResponse,
  ResourceResponse,
  PermissionListResponse,
  PermissionResponse,
  UserPolicy,
  UserPolicyDetail,
  CreateUserPolicyRequest,
  UpdateUserPolicyRequest,
  Policy,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  User,
  UserPolicyListResponse,
  UserPolicyResponse,
  PolicyListResponse,
  PolicyResponse,
  UserListResponse,
  UserAttributeDetail,
  CreateUserAttributeRequest,
  UpdateUserAttributeRequest,
  UserAttributeListResponse,
} from "../types/abac";
import { logger } from "../utils/logger";

const unwrapResponse = <T>(response: { data: any }): T => {
  const data = response.data;
  if (data.status === "error") {
    throw new Error(data.message || data.error || "Request failed");
  }
  return data.data as T;
};

// Attributes
export const fetchAttributes = async (): Promise<Attribute[]> => {
  const response = await api.get<AttributeListResponse>("/api/v1/permissions/attributes");
  const data = unwrapResponse<Attribute[]>(response);
  return Array.isArray(data) ? data : [];
};

export const fetchAttribute = async (attributeId: number): Promise<Attribute> => {
  const response = await api.get<AttributeResponse>(
    `/api/v1/permissions/attributes/${attributeId}`
  );
  return unwrapResponse<Attribute>(response);
};

export const createAttribute = async (data: CreateAttributeRequest): Promise<Attribute> => {
  const response = await api.post<AttributeResponse>("/api/v1/permissions/attributes", data);
  return unwrapResponse<Attribute>(response);
};

export const updateAttribute = async (
  attributeId: number,
  data: UpdateAttributeRequest
): Promise<Attribute> => {
  const response = await api.put<AttributeResponse>(
    `/api/v1/permissions/attributes/${attributeId}`,
    data
  );
  return unwrapResponse<Attribute>(response);
};

export const deleteAttribute = async (attributeId: number): Promise<void> => {
  await api.delete(`/api/v1/permissions/attributes/${attributeId}`);
};

// Resources
export const fetchResources = async (): Promise<Resource[]> => {
  const response = await api.get<ResourceListResponse>("/api/v1/permissions/resources");
  const data = unwrapResponse<Resource[]>(response);
  return Array.isArray(data) ? data : [];
};

export const fetchResource = async (resourceId: number): Promise<Resource> => {
  const response = await api.get<ResourceResponse>(`/api/v1/permissions/resources/${resourceId}`);
  return unwrapResponse<Resource>(response);
};

export const createResource = async (data: CreateResourceRequest): Promise<Resource> => {
  const response = await api.post<ResourceResponse>("/api/v1/permissions/resources", data);
  return unwrapResponse<Resource>(response);
};

export const updateResource = async (
  resourceId: number,
  data: UpdateResourceRequest
): Promise<Resource> => {
  const response = await api.put<ResourceResponse>(
    `/api/v1/permissions/resources/${resourceId}`,
    data
  );
  return unwrapResponse<Resource>(response);
};

export const deleteResource = async (resourceId: number): Promise<void> => {
  await api.delete(`/api/v1/permissions/resources/${resourceId}`);
};

// Permissions
export const fetchPermissions = async (): Promise<Permission[]> => {
  const response = await api.get<PermissionListResponse>("/api/v1/permissions/permissions");
  const data = unwrapResponse<Permission[]>(response);
  return Array.isArray(data) ? data : [];
};

export const fetchPermission = async (permissionId: number): Promise<Permission> => {
  const response = await api.get<PermissionResponse>(
    `/api/v1/permissions/permissions/${permissionId}`
  );
  return unwrapResponse<Permission>(response);
};

export const createPermission = async (data: CreatePermissionRequest): Promise<Permission> => {
  const response = await api.post<PermissionResponse>("/api/v1/permissions/permissions", data);
  return unwrapResponse<Permission>(response);
};

export const updatePermission = async (
  permissionId: number,
  data: UpdatePermissionRequest
): Promise<Permission> => {
  const response = await api.put<PermissionResponse>(
    `/api/v1/permissions/permissions/${permissionId}`,
    data
  );
  return unwrapResponse<Permission>(response);
};

export const deletePermission = async (permissionId: number): Promise<void> => {
  await api.delete(`/api/v1/permissions/permissions/${permissionId}`);
};

// User Policies
export const fetchUserPolicies = async (): Promise<UserPolicyDetail[]> => {
  logger.api("GET", "/api/v1/permissions/user-policies/details");
  const response = await api.get<UserPolicyListResponse>(
    "/api/v1/permissions/user-policies/details"
  );
  const data = unwrapResponse<UserPolicyDetail[]>(response);
  const result = Array.isArray(data) ? data : [];
  logger.apiResponse("GET", "/api/v1/permissions/user-policies/details", { count: result.length });
  return result;
};

export const fetchUserPolicy = async (id: number): Promise<UserPolicy> => {
  const response = await api.get<UserPolicyResponse>(`/api/v1/permissions/user-policies/${id}`);
  return unwrapResponse<UserPolicy>(response);
};

export const createUserPolicy = async (data: CreateUserPolicyRequest): Promise<UserPolicy> => {
  const response = await api.post<UserPolicyResponse>("/api/v1/permissions/user-policies", data);
  return unwrapResponse<UserPolicy>(response);
};

export const updateUserPolicy = async (
  id: number,
  data: UpdateUserPolicyRequest
): Promise<UserPolicy> => {
  const response = await api.put<UserPolicyResponse>(
    `/api/v1/permissions/user-policies/${id}`,
    data
  );
  return unwrapResponse<UserPolicy>(response);
};

export const deleteUserPolicy = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/permissions/user-policies/${id}`);
};

// Policies
export const fetchPolicies = async (): Promise<Policy[]> => {
  const response = await api.get<PolicyListResponse>("/api/v1/permissions/policies");
  const data = unwrapResponse<Policy[]>(response);
  return Array.isArray(data) ? data : [];
};

export const fetchPolicy = async (policyId: number): Promise<Policy> => {
  const response = await api.get<PolicyResponse>(`/api/v1/permissions/policies/${policyId}`);
  return unwrapResponse<Policy>(response);
};

export const createPolicy = async (data: CreatePolicyRequest): Promise<Policy> => {
  const response = await api.post<PolicyResponse>("/api/v1/permissions/policies", data);
  return unwrapResponse<Policy>(response);
};

export const updatePolicy = async (
  policyId: number,
  data: UpdatePolicyRequest
): Promise<Policy> => {
  const response = await api.put<PolicyResponse>(`/api/v1/permissions/policies/${policyId}`, data);
  return unwrapResponse<Policy>(response);
};

export const deletePolicy = async (policyId: number): Promise<void> => {
  await api.delete(`/api/v1/permissions/policies/${policyId}`);
};

// Users
export const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get<UserListResponse>("/api/v1/users");
  const data = unwrapResponse<{ Data: User[]; Page: number; Size: number; StartRow: number; EndRow: number; NextCursor: number }>(response);
  return Array.isArray(data?.Data) ? data.Data : [];
};

// User Attributes
export const fetchUserAttributes = async (userId?: number): Promise<UserAttributeDetail[]> => {
  const url = userId
    ? `/api/v1/permissions/user-attributes?user_id=${userId}`
    : "/api/v1/permissions/user-attributes";
  logger.api("GET", url);
  const response = await api.get<UserAttributeListResponse>(url);
  const data = unwrapResponse<UserAttributeDetail[]>(response);
  const result = Array.isArray(data) ? data : [];
  logger.apiResponse("GET", url, { count: result.length });
  return result;
};

export const fetchUserAttribute = async (id: number): Promise<UserAttributeDetail> => {
  const response = await api.get<UserAttributeListResponse>(
    `/api/v1/permissions/user-attributes/${id}`
  );
  return unwrapResponse<UserAttributeDetail>(response);
};

export const createUserAttribute = async (
  data: CreateUserAttributeRequest
): Promise<UserAttributeDetail> => {
  const response = await api.post<UserAttributeListResponse>(
    "/api/v1/permissions/user-attributes",
    data
  );
  return unwrapResponse<UserAttributeDetail>(response);
};

export const updateUserAttribute = async (
  id: number,
  data: UpdateUserAttributeRequest
): Promise<UserAttributeDetail> => {
  const response = await api.put<UserAttributeListResponse>(
    `/api/v1/permissions/user-attributes/${id}`,
    data
  );
  return unwrapResponse<UserAttributeDetail>(response);
};

export const deleteUserAttribute = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/permissions/user-attributes/${id}`);
};
