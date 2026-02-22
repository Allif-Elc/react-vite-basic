import type { Project as BackendProject } from '../types/api';

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
}

export const transformProject = (data: BackendProject): Project => ({
  id: data.id_project,
  idUser: data.id_user,
  name: data.name,
  slug: data.slug,
  description: data.description,
  version: data.version,
  isPublic: data.is_public,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

export const transformProjectList = (data: BackendProject[]): Project[] => {
  return data.map(transformProject);
};
