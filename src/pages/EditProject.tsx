import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useToastStore } from "../stores/toastStore";
import { useProjectStore } from "../stores/projectStore";
import { fetchProject } from "../services/apiService";

const projectSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const updateProject = useProjectStore((state) => state.updateProject);
  const [loadingProject, setLoadingProject] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjectFormData>({
    mode: "onBlur",
    resolver: zodResolver(projectSchema),
    delayError: 300,
  });

  useEffect(() => {
    if (!id) return;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      addToast("Invalid project ID", "error");
      navigate("/");
      return;
    }

    fetchProject(projectId)
      .then((project) => {
        reset({
          name: project.name,
          description: project.description || "",
        });
      })
      .catch(() => {
        addToast("Failed to load project", "error");
        navigate("/");
      })
      .finally(() => setLoadingProject(false));
  }, [id, reset, addToast, navigate]);

  const onSubmit = async (data: ProjectFormData) => {
    if (!id) return;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) return;

    try {
      await updateProject(projectId, data);
      addToast("Project updated successfully", "success");
      navigate("/");
    } catch {
      addToast("Failed to update project", "error");
    }
  };

  if (loadingProject) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Project</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-full" />
          <div className="h-24 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Project</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
            Project Name *
          </label>
          <input
            {...register("name")}
            type="text"
            id="name"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="My Awesome Project"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Describe your project..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
