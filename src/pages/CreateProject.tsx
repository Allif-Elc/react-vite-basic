import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "../stores/toastStore";
import api from "../services/api";

const projectSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function CreateProject() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    mode: "onBlur",
    resolver: zodResolver(projectSchema),
    delayError: 300,
  });

  const onSubmit = async (data: ProjectFormData) => {
    try {
      await api.post("/api/v1/projects", data);
      addToast("Project created successfully", "success");
      navigate("/");
    } catch {
      addToast("Failed to create project", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Project</h1>

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
            {isSubmitting ? "Creating..." : "Create Project"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
