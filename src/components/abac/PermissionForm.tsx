import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { permissionSchema, type PermissionFormData } from "../../schemas/abacSchema";
import { useABACStore } from "../../stores/abacStore";
import { useToastStore } from "../../stores/toastStore";
import { X, ShieldCheck, X as XIcon } from "lucide-react";
import type { Permission, CreatePermissionRequest } from "../../types/abac";

interface PermissionFormProps {
  initialData?: Permission | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PermissionForm = memo<PermissionFormProps>(({ initialData, onClose, onSuccess }) => {
  const { createPermission, updatePermission } = useABACStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PermissionFormData>({
    mode: "onBlur",
    resolver: zodResolver(permissionSchema),
    delayError: 300,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      effect: initialData?.effect || "allow",
      actions: initialData?.actions || [],
      condition: initialData?.condition ?? undefined,
    },
  });

  const watchedActions = watch("actions") || [];
  const watchedEffect = watch("effect") || "allow";

  const addAction = useCallback(() => {
    const current = watchedActions || [];
    setValue("actions", [...current, ""]);
  }, [watchedActions, setValue]);

  const updateAction = useCallback(
    (index: number, value: string) => {
      const current = [...(watchedActions || [])];
      current[index] = value;
      setValue("actions", current);
    },
    [watchedActions, setValue]
  );

  const removeAction = useCallback(
    (index: number) => {
      const current = watchedActions || [];
      setValue(
        "actions",
        current.filter((_, i) => i !== index)
      );
    },
    [watchedActions, setValue]
  );

  const onSubmit = async (data: PermissionFormData) => {
    const cleanedData = {
      ...data,
      actions: data.actions.filter((a) => a.trim() !== ""),
      condition: data.condition || undefined,
    };
    try {
      if (initialData) {
        await updatePermission(initialData.id_permission, cleanedData);
        addToast("Permission updated successfully", "success");
      } else {
        await createPermission(cleanedData as CreatePermissionRequest);
        addToast("Permission created successfully", "success");
      }
      onSuccess();
    } catch {
      addToast("Failed to save permission", "error");
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${watchedEffect === "deny" ? "bg-red-100" : "bg-green-100"}`}
          >
            <ShieldCheck
              className={`w-5 h-5 ${watchedEffect === "deny" ? "text-red-600" : "text-green-600"}`}
            />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {initialData ? "Edit Permission" : "New Permission"}
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
            placeholder="e.g., read_documents, edit_users"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="effect" className="block text-sm font-medium text-muted-foreground mb-1">
            Effect *
          </label>
          <select
            {...register("effect")}
            id="effect"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="allow">Allow</option>
            <option value="deny">Deny</option>
          </select>
          {errors.effect && <p className="mt-1 text-sm text-red-600">{errors.effect.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-muted-foreground">Actions *</label>
            <button
              type="button"
              onClick={addAction}
              className="text-sm text-primary hover:text-primary"
            >
              + Add Action
            </button>
          </div>
          <div className="space-y-2">
            {watchedActions.map((action, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={action}
                  onChange={(e) => updateAction(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., read, write, delete"
                />
                <button
                  type="button"
                  onClick={() => removeAction(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {errors.actions && <p className="mt-1 text-sm text-red-600">{errors.actions.message}</p>}
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-muted-foreground mb-1">
            Condition (Optional)
          </label>
          <textarea
            {...register("condition")}
            id="condition"
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
            placeholder="e.g., attribute.department == 'engineering'"
          />
          {errors.condition && (
            <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
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
            placeholder="Describe this permission..."
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

PermissionForm.displayName = "PermissionForm";
