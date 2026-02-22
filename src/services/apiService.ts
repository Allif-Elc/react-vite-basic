import api from './api';
import type { ApiResponse, RestAPI, GraphQLAPI, GrpcAPI, Project } from '../types/api';
import { transformProject, transformProjectList } from '../utils/transformers';
import type { Project as FrontendProject } from '../utils/transformers';

const unwrapResponse = <T>(response: { data: ApiResponse<T> }): T => {
  if (response.data.status === 'error') {
    throw new Error(response.data.message || response.data.error || 'Request failed');
  }
  return response.data.data as T;
};

// Projects
export const fetchProjects = async (): Promise<FrontendProject[]> => {
  const response = await api.get<ApiResponse<Project[]>>('/api/v1/projects');
  const data = unwrapResponse(response);
  const projects = Array.isArray(data) ? data : (data as any)?.Data || [];
  return transformProjectList(projects);
};

export const fetchProject = async (projectId: number): Promise<FrontendProject> => {
  const response = await api.get<ApiResponse<Project>>(`/api/v1/projects/${projectId}`);
  const data = unwrapResponse(response);
  return transformProject(data);
};

export const fetchProjectBySlug = async (slug: string): Promise<FrontendProject> => {
  const response = await api.get<ApiResponse<Project>>(`/api/v1/public/projects/${slug}`);
  const data = unwrapResponse(response);
  return transformProject(data);
};

export const fetchProjectAPIStats = async (projectId: number): Promise<{
  rest: number;
  graphql: number;
  grpc: number;
}> => {
  const response = await api.get<ApiResponse<any>>(`/api/v1/projects/${projectId}/api-stats`);
  return unwrapResponse(response);
};

export const deleteProject = async (projectId: number): Promise<void> => {
  await api.delete(`/api/v1/projects/${projectId}`);
};

// Helper function to normalize array fields that may be serialized as objects with numeric keys
const normalizeToArray = <T>(value: T[] | Record<string, T> | null | undefined): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  // Convert object with numeric keys to array (sorted by key to maintain order)
  const entries = Object.entries(value);
  if (entries.length === 0) return [];
  // Check if all keys are numeric strings
  const allNumeric = entries.every(([key]) => /^\d+$/.test(key));
  if (allNumeric) {
    return entries
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([, val]) => val);
  }
  return Object.values(value);
};

// Normalize RestAPI data to ensure proper array structures
const normalizeRestAPI = (api: RestAPI): RestAPI => ({
  ...api,
  headers: normalizeToArray(api.headers),
  path_params: normalizeToArray(api.path_params),
  query_params: normalizeToArray(api.query_params),
  responses: api.responses || {},
});

// REST APIs
export const fetchRestAPIs = async (projectId: number): Promise<RestAPI[]> => {
  const response = await api.get<ApiResponse<RestAPI[]>>(`/api/v1/projects/${projectId}/rest-apis`);
  const data = unwrapResponse(response);
  const apis = Array.isArray(data) ? data : (data as any)?.Data || [];
  return apis.map(normalizeRestAPI);
};

export const fetchRestAPI = async (apiId: number): Promise<RestAPI> => {
  const response = await api.get<ApiResponse<RestAPI>>(`/api/v1/rest-apis/${apiId}`);
  const data = unwrapResponse(response);
  return normalizeRestAPI(data);
};

export const createRestAPI = async (projectId: number, data: Partial<RestAPI>): Promise<RestAPI> => {
  const response = await api.post<ApiResponse<RestAPI>>(`/api/v1/projects/${projectId}/rest-apis`, data);
  return unwrapResponse(response);
};

export const updateRestAPI = async (apiId: number, data: Partial<RestAPI>): Promise<RestAPI> => {
  const response = await api.put<ApiResponse<RestAPI>>(`/api/v1/rest-apis/${apiId}`, data);
  return unwrapResponse(response);
};

export const deleteRestAPI = async (apiId: number): Promise<void> => {
  await api.delete(`/api/v1/rest-apis/${apiId}`);
};

// GraphQL APIs
export const fetchGraphQLAPIs = async (projectId: number): Promise<GraphQLAPI[]> => {
  const response = await api.get<ApiResponse<GraphQLAPI[]>>(`/api/v1/projects/${projectId}/graphql-apis`);
  const data = unwrapResponse(response);
  const apis = Array.isArray(data) ? data : (data as any)?.Data || [];
  return apis.map((api: GraphQLAPI) => ({
    ...api,
    arguments: normalizeToArray(api.arguments),
    examples: normalizeToArray(api.examples),
  }));
};

export const fetchGraphQLAPI = async (apiId: number): Promise<GraphQLAPI> => {
  const response = await api.get<ApiResponse<GraphQLAPI>>(`/api/v1/graphql-apis/${apiId}`);
  const data = unwrapResponse(response);
  return {
    ...data,
    arguments: normalizeToArray(data.arguments),
    examples: normalizeToArray(data.examples),
  };
};

export const createGraphQLAPI = async (projectId: number, data: Partial<GraphQLAPI>): Promise<GraphQLAPI> => {
  const response = await api.post<ApiResponse<GraphQLAPI>>(`/api/v1/projects/${projectId}/graphql-apis`, data);
  return unwrapResponse(response);
};

export const updateGraphQLAPI = async (apiId: number, data: Partial<GraphQLAPI>): Promise<GraphQLAPI> => {
  const response = await api.put<ApiResponse<GraphQLAPI>>(`/api/v1/graphql-apis/${apiId}`, data);
  return unwrapResponse(response);
};

export const deleteGraphQLAPI = async (apiId: number): Promise<void> => {
  await api.delete(`/api/v1/graphql-apis/${apiId}`);
};

// gRPC APIs
export const fetchGrpcAPIs = async (projectId: number): Promise<GrpcAPI[]> => {
  const response = await api.get<ApiResponse<GrpcAPI[]>>(`/api/v1/projects/${projectId}/grpc-apis`);
  const data = unwrapResponse(response);
  const apis = Array.isArray(data) ? data : (data as any)?.Data || [];
  return apis.map((api: GrpcAPI) => ({
    ...api,
    request_message: normalizeToArray(api.request_message),
    response_message: normalizeToArray(api.response_message),
    examples: normalizeToArray(api.examples),
  }));
};

export const fetchGrpcAPI = async (apiId: number): Promise<GrpcAPI> => {
  const response = await api.get<ApiResponse<GrpcAPI>>(`/api/v1/grpc-apis/${apiId}`);
  const data = unwrapResponse(response);
  return {
    ...data,
    request_message: normalizeToArray(data.request_message),
    response_message: normalizeToArray(data.response_message),
    examples: normalizeToArray(data.examples),
  };
};

export const createGrpcAPI = async (projectId: number, data: Partial<GrpcAPI>): Promise<GrpcAPI> => {
  const response = await api.post<ApiResponse<GrpcAPI>>(`/api/v1/projects/${projectId}/grpc-apis`, data);
  return unwrapResponse(response);
};

export const updateGrpcAPI = async (apiId: number, data: Partial<GrpcAPI>): Promise<GrpcAPI> => {
  const response = await api.put<ApiResponse<GrpcAPI>>(`/api/v1/grpc-apis/${apiId}`, data);
  return unwrapResponse(response);
};

export const deleteGrpcAPI = async (apiId: number): Promise<void> => {
  await api.delete(`/api/v1/grpc-apis/${apiId}`);
};

// Public APIs (for Viewer)
export const fetchPublicAPIs = async (slug: string): Promise<{
  project: FrontendProject;
  rest: RestAPI[];
  graphql: GraphQLAPI[];
  grpc: GrpcAPI[];
}> => {
  const response = await api.get<ApiResponse<{ project: Project; rest: RestAPI[]; graphql: GraphQLAPI[]; grpc: GrpcAPI[] }>>(`/api/v1/public/projects/${slug}/full`);
  const data = unwrapResponse(response);
  return {
    ...data,
    project: transformProject(data.project),
  };
};
