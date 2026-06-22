import { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resourceSchema, type ResourceFormData } from "../../schemas/abacSchema";
import { useABACStore } from "../../stores/abacStore";
import { useToastStore } from "../../stores/toastStore";
import { X, Folder } from "lucide-react";
import type { Resource, CreateResourceRequest } from "../../types/abac";

interface ResourceFormProps {
  initialData?: Resource | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResourceForm = memo<ResourceFormProps>(({ initialData, onClose, onSuccess }) => {
  const { createResource, updateResource } = useABACStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormData>({
    mode: "onBlur",
    resolver: zodResolver(resourceSchema),
    delayError: 300,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      resource_type: initialData?.resource_type || "",
    },
  });

  const onSubmit = async (data: ResourceFormData) => {
    try {
      if (initialData) {
        await updateResource(initialData.id_resource, data);
        addToast("Resource updated successfully", "success");
      } else {
        await createResource(data as CreateResourceRequest);
        addToast("Resource created successfully", "success");
      }
      onSuccess();
    } catch {
      addToast("Failed to save resource", "error");
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {initialData ? "Edit Resource" : "New Resource"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
            Name *
          </label>
          <input
            {...register("name")}
            id="name"
            type="text"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g., users, projects, documents"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="resource_type" className="block text-sm font-medium text-muted-foreground mb-1">
            Resource Type *
          </label>
          <input
            {...register("resource_type")}
            id="resource_type"
            type="text"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g., api, database, file"
          />
          {errors.resource_type && (
            <p className="mt-1 text-sm text-red-600">{errors.resource_type.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Describe this resource..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
});

ResourceForm.displayName = "ResourceForm";
