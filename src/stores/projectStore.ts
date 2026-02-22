import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { fetchProjects as fetchProjectsFromAPI, deleteProject as deleteProjectFromAPI } from '../services/apiService';
import type { Project } from '../utils/transformers';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  deleteProject: (projectId: number) => Promise<void>;
  setCurrentProject: (project: Project) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set) => ({
      projects: [],
      currentProject: null,
      loading: false,
      error: null,
      fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
          const projects = await fetchProjectsFromAPI();
          set({ projects, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch projects',
            loading: false,
          });
        }
      },
      deleteProject: async (projectId: number) => {
        set({ loading: true, error: null });
        try {
          await deleteProjectFromAPI(projectId);
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== projectId),
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete project',
            loading: false,
          });
          throw error;
        }
      },
      setCurrentProject: (project) => set({ currentProject: project }),
      clearError: () => set({ error: null }),
    }),
    { name: 'ProjectStore' }
  )
);

export const selectProjects = (state: ProjectState) => state.projects;
export const selectCurrentProject = (state: ProjectState) => state.currentProject;
export const selectProjectById = (id: number) => (state: ProjectState) =>
  state.projects.find((p) => p.id === id);
