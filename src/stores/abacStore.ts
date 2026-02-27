import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  fetchAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  fetchUserPolicies,
  createUserPolicy,
  updateUserPolicy,
  deleteUserPolicy,
  fetchPolicies,
  fetchPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
  fetchUsers,
  fetchUserAttributes,
  createUserAttribute,
  updateUserAttribute,
  deleteUserAttribute,
} from "../services/abacService";
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
  UserPolicyDetail,
  CreateUserPolicyRequest,
  UpdateUserPolicyRequest,
  Policy,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  UserAttributeDetail,
  CreateUserAttributeRequest,
  UpdateUserAttributeRequest,
} from "../types/abac";
import { logger } from "../utils/logger";

interface ABACState {
  attributes: Attribute[];
  resources: Resource[];
  permissions: Permission[];
  userPolicies: UserPolicyDetail[];
  policies: Policy[];
  users: Array<{ id_user: number; name: string; email: string }>;
  userAttributes: UserAttributeDetail[];
  loading: boolean;
  error: string | null;
  fetchAttributes: () => Promise<void>;
  createAttribute: (data: CreateAttributeRequest) => Promise<Attribute>;
  updateAttribute: (id: number, data: UpdateAttributeRequest) => Promise<void>;
  deleteAttribute: (id: number) => Promise<void>;
  fetchResources: () => Promise<void>;
  createResource: (data: CreateResourceRequest) => Promise<Resource>;
  updateResource: (id: number, data: UpdateResourceRequest) => Promise<void>;
  deleteResource: (id: number) => Promise<void>;
  fetchPermissions: () => Promise<void>;
  createPermission: (data: CreatePermissionRequest) => Promise<Permission>;
  updatePermission: (id: number, data: UpdatePermissionRequest) => Promise<void>;
  deletePermission: (id: number) => Promise<void>;
  fetchUserPolicies: () => Promise<void>;
  createUserPolicy: (data: CreateUserPolicyRequest) => Promise<void>;
  updateUserPolicy: (id: number, data: UpdateUserPolicyRequest) => Promise<void>;
  deleteUserPolicy: (id: number) => Promise<void>;
  fetchPolicies: () => Promise<void>;
  fetchPolicy: (id: number) => Promise<void>;
  createPolicy: (data: CreatePolicyRequest) => Promise<void>;
  updatePolicy: (id: number, data: UpdatePolicyRequest) => Promise<void>;
  deletePolicy: (id: number) => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchUserAttributes: (userId?: number) => Promise<void>;
  createUserAttribute: (data: CreateUserAttributeRequest) => Promise<void>;
  updateUserAttribute: (id: number, data: UpdateUserAttributeRequest) => Promise<void>;
  deleteUserAttribute: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useABACStore = create<ABACState>()(
  devtools(
    (set, get) => ({
      attributes: [],
      resources: [],
      permissions: [],
      userPolicies: [],
      policies: [],
      users: [],
      userAttributes: [],
      loading: false,
      error: null,
      fetchAttributes: async () => {
        set({ loading: true, error: null });
        try {
          const attributes = await fetchAttributes();
          set({ attributes, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch attributes",
            loading: false,
          });
        }
      },
      createAttribute: async (data) => {
        set({ loading: true, error: null });
        try {
          const attribute = await createAttribute(data);
          set((state) => ({
            attributes: [...state.attributes, attribute],
            loading: false,
          }));
          return attribute;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to create attribute",
            loading: false,
          });
          throw error;
        }
      },
      updateAttribute: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const attribute = await updateAttribute(id, data);
          set((state) => ({
            attributes: state.attributes.map((a) => (a.id_attribute === id ? attribute : a)),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update attribute",
            loading: false,
          });
          throw error;
        }
      },
      deleteAttribute: async (id) => {
        set({ loading: true, error: null });
        try {
          await deleteAttribute(id);
          set((state) => ({
            attributes: state.attributes.filter((a) => a.id_attribute !== id),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to delete attribute",
            loading: false,
          });
          throw error;
        }
      },
      fetchResources: async () => {
        set({ loading: true, error: null });
        try {
          const resources = await fetchResources();
          set({ resources, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch resources",
            loading: false,
          });
        }
      },
      createResource: async (data) => {
        set({ loading: true, error: null });
        try {
          const resource = await createResource(data);
          set((state) => ({
            resources: [...state.resources, resource],
            loading: false,
          }));
          return resource;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to create resource",
            loading: false,
          });
          throw error;
        }
      },
      updateResource: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const resource = await updateResource(id, data);
          set((state) => ({
            resources: state.resources.map((r) => (r.id_resource === id ? resource : r)),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update resource",
            loading: false,
          });
          throw error;
        }
      },
      deleteResource: async (id) => {
        set({ loading: true, error: null });
        try {
          await deleteResource(id);
          set((state) => ({
            resources: state.resources.filter((r) => r.id_resource !== id),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to delete resource",
            loading: false,
          });
          throw error;
        }
      },
      fetchPermissions: async () => {
        set({ loading: true, error: null });
        try {
          const permissions = await fetchPermissions();
          set({ permissions, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch permissions",
            loading: false,
          });
        }
      },
      createPermission: async (data) => {
        set({ loading: true, error: null });
        try {
          const permission = await createPermission(data);
          set((state) => ({
            permissions: [...state.permissions, permission],
            loading: false,
          }));
          return permission;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to create permission",
            loading: false,
          });
          throw error;
        }
      },
      updatePermission: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const permission = await updatePermission(id, data);
          set((state) => ({
            permissions: state.permissions.map((p) => (p.id_permission === id ? permission : p)),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update permission",
            loading: false,
          });
          throw error;
        }
      },
      deletePermission: async (id) => {
        set({ loading: true, error: null });
        try {
          await deletePermission(id);
          set((state) => ({
            permissions: state.permissions.filter((p) => p.id_permission !== id),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to delete permission",
            loading: false,
          });
          throw error;
        }
      },
      fetchUserPolicies: async () => {
        logger.debug("[abacStore] fetchUserPolicies started");
        set({ loading: true, error: null });
        try {
          const userPolicies = await fetchUserPolicies();
          set({ userPolicies, loading: false });
          logger.debug("[abacStore] fetchUserPolicies complete", { count: userPolicies.length });
        } catch (error) {
          logger.error("[abacStore] Error fetching user policies", error);
          set({
            error: error instanceof Error ? error.message : "Failed to fetch user policies",
            loading: false,
          });
        }
      },
      createUserPolicy: async (data) => {
        set({ loading: true, error: null });
        try {
          await createUserPolicy(data);
          // Re-fetch to get updated data with user/policy details
          await get().fetchUserPolicies();
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to create user policy",
            loading: false,
          });
          throw error;
        }
      },
      updateUserPolicy: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await updateUserPolicy(id, data);
          await get().fetchUserPolicies();
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update user policy",
            loading: false,
          });
          throw error;
        }
      },
      deleteUserPolicy: async (id) => {
        set({ loading: true, error: null });
        try {
          await deleteUserPolicy(id);
          set((state) => ({
            userPolicies: state.userPolicies.filter((up) => up.id_user_policy !== id),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to delete user policy",
            loading: false,
          });
          throw error;
        }
      },
      fetchPolicies: async () => {
        set({ loading: true, error: null });
        try {
          const policies = await fetchPolicies();
          set({ policies, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch policies",
            loading: false,
          });
        }
      },
      fetchPolicy: async (id) => {
        set({ loading: true, error: null });
        try {
          const policy = await fetchPolicy(id);
          set((state) => ({
            policies: state.policies.map((p) => (p.id_policy === id ? policy : p)),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch policy",
            loading: false,
          });
        }
      },
      createPolicy: async (data) => {
        set({ loading: true, error: null });
        try {
          const policy = await createPolicy(data);
          set((state) => ({
            policies: [...state.policies, policy],
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to create policy",
            loading: false,
          });
          throw error;
        }
      },
      updatePolicy: async (id, data) => {
        set({ loading: true, error: null });
        try {
          const policy = await updatePolicy(id, data);
          set((state) => ({
            policies: state.policies.map((p) => (p.id_policy === id ? policy : p)),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update policy",
            loading: false,
          });
          throw error;
        }
      },
      deletePolicy: async (id) => {
        set({ loading: true, error: null });
        try {
          await deletePolicy(id);
          set((state) => ({
            policies: state.policies.filter((p) => p.id_policy !== id),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to delete policy",
            loading: false,
          });
          throw error;
        }
      },
      fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
          const users = await fetchUsers();
          set({ users, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to fetch users",
            loading: false,
          });
        }
      },
      fetchUserAttributes: async (userId?: number) => {
        logger.debug("[abacStore] fetchUserAttributes started", { userId });
        set({ loading: true, error: null });
        try {
          const userAttributes = await fetchUserAttributes(userId);
          set({ userAttributes, loading: false });
          logger.debug("[abacStore] fetchUserAttributes complete", { count: userAttributes.length });
        } catch (error) {
          logger.error("[abacStore] Error fetching user attributes", error);
          set({
            error: error instanceof Error ? error.message : "Failed to fetch user attributes",
            loading: false,
          });
        }
      },
      createUserAttribute: async (data) => {
        set({ loading: true, error: null });
        try {
          await createUserAttribute(data);
          await get().fetchUserAttributes();
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to create user attribute",
            loading: false,
          });
          throw error;
        }
      },
      updateUserAttribute: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await updateUserAttribute(id, data);
          await get().fetchUserAttributes();
          set({ loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to update user attribute",
            loading: false,
          });
          throw error;
        }
      },
      deleteUserAttribute: async (id) => {
        set({ loading: true, error: null });
        try {
          await deleteUserAttribute(id);
          set((state) => ({
            userAttributes: state.userAttributes.filter((ua) => ua.id_user_attribute !== id),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to delete user attribute",
            loading: false,
          });
          throw error;
        }
      },
      clearError: () => set({ error: null }),
    }),
    { name: "ABACStore" }
  )
);

export const selectAttributes = (state: ABACState) => state.attributes;
export const selectResources = (state: ABACState) => state.resources;
export const selectPermissions = (state: ABACState) => state.permissions;
export const selectUserPolicies = (state: ABACState) => state.userPolicies;
export const selectPolicies = (state: ABACState) => state.policies;
export const selectUsers = (state: ABACState) => state.users;
export const selectUserAttributes = (state: ABACState) => state.userAttributes;
export const selectABACLoading = (state: ABACState) => state.loading;
export const selectABACError = (state: ABACState) => state.error;
