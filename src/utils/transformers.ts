import type {
  Project as BackendProject,
  ProjectWithStats as BackendProjectWithStats,
} from "../types/api";

export interface Project {
  id: number;
  idUser: number;
  name: string;
  slug: string;
  description: string;
  version: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  restCount?: number;
  graphqlCount?: number;
  grpcCount?: number;
  totalApiCount?: number;
}

export const transformProject = (data: BackendProject | BackendProjectWithStats): Project => {
  const base = {
    id: data.id_project,
    idUser: data.id_user,
    name: data.name,
    slug: data.slug,
    description: data.description,
    version: data.version,
    isPublic: data.is_public,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  // Add API stats if present
  if ("rest_count" in data) {
    return {
      ...base,
      restCount: data.rest_count,
      graphqlCount: data.graphql_count,
      grpcCount: data.grpc_count,
      totalApiCount: data.total_api_count,
    };
  }

  return base;
};

export const transformProjectList = (
  data: BackendProject[] | BackendProjectWithStats[]
): Project[] => {
  return data.map(transformProject);
};
