import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { RestAPI, GraphQLAPI, GrpcAPI } from "../types/api";
import * as apiService from "../services/apiService";
import { isAuthError } from "../services/errors";

interface APIState {
  // REST APIs
  restAPIs: RestAPI[];
  currentRestAPI: RestAPI | null;

  // GraphQL APIs
  graphqlAPIs: GraphQLAPI[];
  currentGraphQLAPI: GraphQLAPI | null;

  // gRPC APIs
  grpcAPIs: GrpcAPI[];
  currentGrpcAPI: GrpcAPI | null;

  loading: boolean;
  error: string | null;

  // Actions
  fetchAPIs: (projectId: number) => Promise<void>;
  fetchRestAPI: (apiId: number) => Promise<void>;
  fetchGraphQLAPI: (apiId: number) => Promise<void>;
  fetchGrpcAPI: (apiId: number) => Promise<void>;

  createRestAPI: (projectId: number, data: Partial<RestAPI>) => Promise<RestAPI>;
  updateRestAPI: (apiId: number, data: Partial<RestAPI>) => Promise<void>;
  deleteRestAPI: (apiId: number) => Promise<void>;

  createGraphQLAPI: (projectId: number, data: Partial<GraphQLAPI>) => Promise<GraphQLAPI>;
  updateGraphQLAPI: (apiId: number, data: Partial<GraphQLAPI>) => Promise<void>;
  deleteGraphQLAPI: (apiId: number) => Promise<void>;

  createGrpcAPI: (projectId: number, data: Partial<GrpcAPI>) => Promise<GrpcAPI>;
  updateGrpcAPI: (apiId: number, data: Partial<GrpcAPI>) => Promise<void>;
  deleteGrpcAPI: (apiId: number) => Promise<void>;

  setCurrentAPI: (type: "rest" | "graphql" | "grpc", api: any) => void;
  clearCurrentAPI: () => void;
  clearError: () => void;
}

export const useAPIStore = create<APIState>()(
  devtools(
    (set) => ({
      restAPIs: [],
      currentRestAPI: null,
      graphqlAPIs: [],
      currentGraphQLAPI: null,
      grpcAPIs: [],
      currentGrpcAPI: null,
      loading: false,
      error: null,

      fetchAPIs: async (projectId: number) => {
        set({ loading: true, error: null });
        try {
          const [rest, graphql, grpc] = await Promise.all([
            apiService.fetchRestAPIs(projectId),
            apiService.fetchGraphQLAPIs(projectId),
            apiService.fetchGrpcAPIs(projectId),
          ]);
          set({ restAPIs: rest, graphqlAPIs: graphql, grpcAPIs: grpc, loading: false });
        } catch (error) {
          // Don't set error for auth errors (401) - auto-redirect will handle it
          if (!isAuthError(error)) {
            set({
              error: error instanceof Error ? error.message : "Failed to fetch APIs",
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        }
      },

      fetchRestAPI: async (apiId: number) => {
        set({ loading: true, error: null });
        try {
          const api = await apiService.fetchRestAPI(apiId);
          set({ currentRestAPI: api, loading: false });
        } catch (error) {
          if (!isAuthError(error)) {
            set({
              error: error instanceof Error ? error.message : "Failed to fetch API",
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        }
      },

      fetchGraphQLAPI: async (apiId: number) => {
        set({ loading: true, error: null });
        try {
          const api = await apiService.fetchGraphQLAPI(apiId);
          set({ currentGraphQLAPI: api, loading: false });
        } catch (error) {
          if (!isAuthError(error)) {
            set({
              error: error instanceof Error ? error.message : "Failed to fetch API",
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        }
      },

      fetchGrpcAPI: async (apiId: number) => {
        set({ loading: true, error: null });
        try {
          const api = await apiService.fetchGrpcAPI(apiId);
          set({ currentGrpcAPI: api, loading: false });
        } catch (error) {
          if (!isAuthError(error)) {
            set({
              error: error instanceof Error ? error.message : "Failed to fetch API",
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        }
      },

      createRestAPI: async (projectId, data) => {
        const api = await apiService.createRestAPI(projectId, data);
        set((state) => ({ restAPIs: [...state.restAPIs, api] }));
        return api;
      },

      updateRestAPI: async (apiId, data) => {
        const api = await apiService.updateRestAPI(apiId, data);
        set((state) => ({
          restAPIs: state.restAPIs.map((a) => (a.id_rest_api === apiId ? api : a)),
          currentRestAPI: state.currentRestAPI?.id_rest_api === apiId ? api : state.currentRestAPI,
        }));
      },

      deleteRestAPI: async (apiId) => {
        await apiService.deleteRestAPI(apiId);
        set((state) => ({
          restAPIs: state.restAPIs.filter((a) => a.id_rest_api !== apiId),
        }));
      },

      createGraphQLAPI: async (projectId, data) => {
        const api = await apiService.createGraphQLAPI(projectId, data);
        set((state) => ({ graphqlAPIs: [...state.graphqlAPIs, api] }));
        return api;
      },

      updateGraphQLAPI: async (apiId, data) => {
        const api = await apiService.updateGraphQLAPI(apiId, data);
        set((state) => ({
          graphqlAPIs: state.graphqlAPIs.map((a) => (a.id_graphql_api === apiId ? api : a)),
          currentGraphQLAPI:
            state.currentGraphQLAPI?.id_graphql_api === apiId ? api : state.currentGraphQLAPI,
        }));
      },

      deleteGraphQLAPI: async (apiId) => {
        await apiService.deleteGraphQLAPI(apiId);
        set((state) => ({
          graphqlAPIs: state.graphqlAPIs.filter((a) => a.id_graphql_api !== apiId),
        }));
      },

      createGrpcAPI: async (projectId, data) => {
        const api = await apiService.createGrpcAPI(projectId, data);
        set((state) => ({ grpcAPIs: [...state.grpcAPIs, api] }));
        return api;
      },

      updateGrpcAPI: async (apiId, data) => {
        const api = await apiService.updateGrpcAPI(apiId, data);
        set((state) => ({
          grpcAPIs: state.grpcAPIs.map((a) => (a.id_grpc_api === apiId ? api : a)),
          currentGrpcAPI: state.currentGrpcAPI?.id_grpc_api === apiId ? api : state.currentGrpcAPI,
        }));
      },

      deleteGrpcAPI: async (apiId) => {
        await apiService.deleteGrpcAPI(apiId);
        set((state) => ({
          grpcAPIs: state.grpcAPIs.filter((a) => a.id_grpc_api !== apiId),
        }));
      },

      setCurrentAPI: (type, api) => {
        if (type === "rest") set({ currentRestAPI: api });
        else if (type === "graphql") set({ currentGraphQLAPI: api });
        else set({ currentGrpcAPI: api });
      },

      clearCurrentAPI: () => {
        set({ currentRestAPI: null, currentGraphQLAPI: null, currentGrpcAPI: null });
      },

      clearError: () => set({ error: null }),
    }),
    { name: "APIStore" }
  )
);

// Selectors
export const selectRestAPIs = (state: APIState) => state.restAPIs;
export const selectGraphQLAPIs = (state: APIState) => state.graphqlAPIs;
export const selectGrpcAPIs = (state: APIState) => state.grpcAPIs;
export const selectCurrentRestAPI = (state: APIState) => state.currentRestAPI;
export const selectCurrentGraphQLAPI = (state: APIState) => state.currentGraphQLAPI;
export const selectCurrentGrpcAPI = (state: APIState) => state.currentGrpcAPI;
export const selectAPILoading = (state: APIState) => state.loading;
export const selectAPIError = (state: APIState) => state.error;
