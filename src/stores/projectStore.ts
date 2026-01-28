import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

export interface Project {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  setCurrentProject: (project: Project) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    (set, get) => ({
      projects: [],
      currentProject: null,
      loading: false,
      error: null,
      fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get('/api/v1/projects');
          set({ projects: response.data, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch projects',
            loading: false,
          });
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
