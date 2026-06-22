import { useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore, selectProjects } from "../stores/projectStore";
import { ProjectSkeleton } from "../components/Skeleton";
import { useToastStore } from "../stores/toastStore";
import { Trash2, ExternalLink, Pencil } from "lucide-react";
import { useConfirm } from "../stores/confirmDialogStore";

const ProjectCard = memo(
  ({
    project,
    onDelete,
    confirm,
  }: {
    project: {
      id: number;
      slug: string;
      name: string;
      description: string;
      isPublic: boolean;
      updatedAt: string;
      restCount?: number;
      graphqlCount?: number;
      grpcCount?: number;
      totalApiCount?: number;
    };
    onDelete: (id: number) => void;
    confirm: ReturnType<typeof useConfirm>;
  }) => {
    const navigate = useNavigate();

    const handleClick = useCallback(() => {
      navigate(`/projects/${project.id}`);
    }, [navigate, project.id]);

    const handleViewDocs = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`/docs/${project.slug}`, "_blank");
      },
      [project.slug]
    );

    const handleEdit = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/projects/${project.id}/edit`);
      },
      [navigate, project.id]
    );

    const formatDate = useMemo(() => {
      return new Date(project.updatedAt).toLocaleDateString();
    }, [project.updatedAt]);

    const handleDelete = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        let message = `Are you sure you want to delete "${project.name}"?`;
        const restCount = project.restCount || 0;
        const graphqlCount = project.graphqlCount || 0;
        const grpcCount = project.grpcCount || 0;
        if (restCount > 0 || graphqlCount > 0 || grpcCount > 0) {
          const apiTypes = [];
          if (restCount > 0) apiTypes.push(`${restCount} REST API${restCount > 1 ? "s" : ""}`);
          if (graphqlCount > 0)
            apiTypes.push(`${graphqlCount} GraphQL API${graphqlCount > 1 ? "s" : ""}`);
          if (grpcCount > 0) apiTypes.push(`${grpcCount} gRPC API${grpcCount > 1 ? "s" : ""}`);
          if (apiTypes.length > 0) {
            message += `\n\nThis project contains:\n${apiTypes.join("\n")}\n\nAll will be permanently deleted.`;
          }
        }

        const confirmed = await confirm({
          title: "Delete Project",
          message,
          confirmText: "Delete",
          cancelText: "Cancel",
          variant: "danger",
        });

        if (!confirmed) return;

        onDelete(project.id);
      },
      [
        project.id,
        project.name,
        onDelete,
        project.restCount,
        project.graphqlCount,
        project.grpcCount,
        confirm,
      ]
    );

    return (
      <div
        onClick={handleClick}
        className="relative bg-card rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer border border-border group"
      >
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100"
          aria-label="Delete project"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold text-foreground mb-2 pr-6">{project.name}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {project.description || "No description"}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleViewDocs}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary transition-colors"
            aria-label="View documentation"
          >
            <ExternalLink className="w-3 h-3" />
            View Docs
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary transition-colors"
            aria-label="Edit project"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span
            className={`px-2 py-1 rounded ${project.isPublic ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
          >
            {project.isPublic ? "Public" : "Private"}
          </span>
          <span>Updated {formatDate}</span>
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

export default function Dashboard() {
  const projects = useProjectStore(selectProjects);
  const loading = useProjectStore((state) => state.loading);
  const error = useProjectStore((state) => state.error);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [projects]
  );

  const handleCreateProject = useCallback(() => {
    navigate("/projects/new");
  }, [navigate]);

  const handleDeleteProject = useCallback(
    async (projectId: number) => {
      try {
        await deleteProject(projectId);
        addToast("Project deleted successfully", "success");
      } catch {
        addToast("Failed to delete project", "error");
      }
    },
    [deleteProject, addToast]
  );
  const confirm = useConfirm();

  const handleRetry = useCallback(() => {
    fetchProjects();
    addToast("Retrying...", "success");
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
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-4">
            No projects yet. Create your first project to get started!
          </p>
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
              confirm={confirm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
