import { useEffect, useMemo, useCallback, memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore, selectProjects } from '../stores/projectStore';
import { ProjectSkeleton } from '../components/Skeleton';
import { useToastStore } from '../stores/toastStore';
import { Trash2 } from 'lucide-react';
import { fetchProjectAPIStats } from '../services/apiService';
import { useConfirm } from '../stores/confirmDialogStore';

interface APIStats {
  rest: number;
  graphql: number;
  grpc: number;
}

const ProjectCard = memo(({
  project,
  onDelete,
  apiCounts,
  confirm
}: {
  project: { id: number; name: string; description: string; isPublic: boolean; updatedAt: string };
  onDelete: (id: number) => void;
  apiCounts?: APIStats;
  confirm: ReturnType<typeof useConfirm>;
}) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/projects/${project.id}`);
  }, [navigate, project.id]);

  const formatDate = useMemo(() => {
    return new Date(project.updatedAt).toLocaleDateString();
  }, [project.updatedAt]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    let message = `Are you sure you want to delete "${project.name}"?`;
    if (apiCounts) {
      const apiTypes = [];
      if (apiCounts.rest > 0) apiTypes.push(`${apiCounts.rest} REST API${apiCounts.rest > 1 ? 's' : ''}`);
      if (apiCounts.graphql > 0) apiTypes.push(`${apiCounts.graphql} GraphQL API${apiCounts.graphql > 1 ? 's' : ''}`);
      if (apiCounts.grpc > 0) apiTypes.push(`${apiCounts.grpc} gRPC API${apiCounts.grpc > 1 ? 's' : ''}`);
      if (apiTypes.length > 0) {
        message += `\n\nThis project contains:\n${apiTypes.join('\n')}\n\nAll will be permanently deleted.`;
      }
    }

    const confirmed = await confirm({
      title: 'Delete Project',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    onDelete(project.id);
  }, [project.id, project.name, onDelete, apiCounts, confirm]);

  return (
    <div
      onClick={handleClick}
      className="relative bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 group"
    >
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
        aria-label="Delete project"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <h3 className="text-lg font-semibold text-gray-800 mb-2 pr-6">{project.name}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description || 'No description'}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className={`px-2 py-1 rounded ${project.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {project.isPublic ? 'Public' : 'Private'}
        </span>
        <span>Updated {formatDate}</span>
      </div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default function Dashboard() {
  const projects = useProjectStore(selectProjects);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const [apiCounts, setApiCounts] = useState<Record<number, APIStats>>({});

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<number, APIStats> = {};
      await Promise.all(
        projects.map(async (project) => {
          try {
            counts[project.id] = await fetchProjectAPIStats(project.id);
          } catch {
            counts[project.id] = { rest: 0, graphql: 0, grpc: 0 };
          }
        })
      );
      setApiCounts(counts);
    };
    if (projects.length > 0) fetchCounts();
  }, [projects]);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [projects]
  );

  const handleCreateProject = useCallback(() => {
    navigate('/projects/new');
  }, [navigate]);

  const handleDeleteProject = useCallback(async (projectId: number) => {
    try {
      await deleteProject(projectId);
      addToast('Project deleted successfully', 'success');
    } catch {
      addToast('Failed to delete project', 'error');
    }
  }, [deleteProject, addToast]);
  const confirm = useConfirm();

  const handleRetry = useCallback(() => {
    fetchProjects();
    addToast('Retrying...', 'success');
  }, [fetchProjects, addToast]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProjectSkeleton />
          <ProjectSkeleton />
          <ProjectSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 mb-3">{error}</p>
          <button onClick={handleRetry} className="text-red-700 underline hover:text-red-800">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleCreateProject}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started!</p>
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
              apiCounts={apiCounts[project.id]}
              confirm={confirm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
