import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  fetchProjectsWithStats as fetchProjectsFromAPI,
  deleteProject as deleteProjectFromAPI,
  updateProject as updateProjectFromAPI,
} from "../services/apiService";
import type { Project } from "../utils/transformers";
import { isAuthError } from "../services/errors";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  deleteProject: (projectId: number) => Promise<void>;
  updateProject: (projectId: number, data: { name: string; description?: string }) => Promise<void>;
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
          if (!isAuthError(error)) {
            set({
              error: error instanceof Error ? error.message : "Failed to fetch projects",
              loading: false,
            });
          } else {
            set({ loading: false });
          }
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
          if (!isAuthError(error)) {
            set({
              error: error instanceof Error ? error.message : "Failed to delete project",
              loading: false,
            });
          } else {
            set({ loading: false });
          }
          throw error;
        }
      },
      updateProject: async (projectId: number, data: { name: string; description?: string }) => {
        set({ loading: true, error: null });
        try {
          const updated = await updateProjectFromAPI(projectId, data);
          set((state) => ({
            projects: state.projects.map((p) => (p.id === projectId ? updated : p)),
            currentProject: state.currentProject?.id === projectId ? updated : state.currentProject,
            loading: false,
          }));
        } catch (error) {
          if (!isAuthError(error)) {
            set({
              error: error instanceof Error ? error.message : "Failed to update project",
              loading: false,
            });
          } else {
            set({ loading: false });
          }
          throw error;
        }
      },
      setCurrentProject: (project) => set({ currentProject: project }),
      clearError: () => set({ error: null }),
    }),
    { name: "ProjectStore" }
  )
);

export const selectProjects = (state: ProjectState) => state.projects;
export const selectCurrentProject = (state: ProjectState) => state.currentProject;
export const selectProjectById = (id: number) => (state: ProjectState) =>
  state.projects.find((p) => p.id === id);
