import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';

const mockUseProjectStore = vi.fn();
vi.mock('../../stores/projectStore', () => ({
  useProjectStore: (selector: any) => selector(mockUseProjectStore()),
  selectProjects: (state: any) => state.projects,
}));

vi.mock('../../stores/toastStore', () => ({
  useToastStore: () => ({
    addToast: vi.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Dashboard', () => {
  const mockFetchProjects = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchProjects.mockResolvedValue(undefined);
  });

  it('shows loading skeleton when loading is true', () => {
    mockUseProjectStore.mockReturnValue({
      projects: [],
      currentProject: null,
      loading: true,
      error: null,
      fetchProjects: mockFetchProjects,
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('shows empty state when no projects', () => {
    mockUseProjectStore.mockReturnValue({
      projects: [],
      currentProject: null,
      loading: false,
      error: null,
      fetchProjects: mockFetchProjects,
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
  });

  it('displays project cards when projects exist', () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockUseProjectStore.mockReturnValue({
      projects: mockProjects,
      currentProject: null,
      loading: false,
      error: null,
      fetchProjects: mockFetchProjects,
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText(/public/i)).toBeInTheDocument();
  });

  it('shows error message when there is an error', () => {
    mockUseProjectStore.mockReturnValue({
      projects: [],
      currentProject: null,
      loading: false,
      error: 'Failed to load projects',
      fetchProjects: mockFetchProjects,
    });

    renderWithRouter(<Dashboard />);
    expect(screen.getByText(/failed to load projects/i)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it('calls fetchProjects on mount', async () => {
    mockUseProjectStore.mockReturnValue({
      projects: [],
      currentProject: null,
      loading: false,
      error: null,
      fetchProjects: mockFetchProjects,
    });

    renderWithRouter(<Dashboard />);
    await waitFor(() => {
      expect(mockFetchProjects).toHaveBeenCalled();
    });
  });
});
