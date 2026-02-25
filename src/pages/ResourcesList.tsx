import { memo, useEffect, useState, useCallback, useMemo } from "react";
import {
  useABACStore,
  selectResources,
  selectABACLoading,
  selectABACError,
} from "../stores/abacStore";
import { useToastStore } from "../stores/toastStore";
import { useConfirm } from "../stores/confirmDialogStore";
import { PageSkeleton } from "../components/Skeleton";
import { ResourceForm } from "../components/abac/ResourceForm";
import { Plus, Edit2, Trash2, Folder } from "lucide-react";
import type { Resource } from "../types/abac";

const ResourceCard = memo(
  ({
    resource,
    onEdit,
    onDelete,
  }: {
    resource: Resource;
    onEdit: (resource: Resource) => void;
    onDelete: (id: number) => void;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Folder className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{resource.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {resource.resource_type}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(resource)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit resource"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(resource.id_resource)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete resource"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {resource.description && <p className="text-sm text-gray-600">{resource.description}</p>}
    </div>
  )
);

ResourceCard.displayName = "ResourceCard";

export default function ResourcesList() {
  const resources = useABACStore(selectResources);
  const loading = useABACStore(selectABACLoading);
  const error = useABACStore(selectABACError);
  const { fetchResources, deleteResource, clearError } = useABACStore();
  const { addToast } = useToastStore();
  const confirm = useConfirm();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleCreate = useCallback(() => {
    setEditingResource(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((resource: Resource) => {
    setEditingResource(resource);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      const resource = resources.find((r) => r.id_resource === id);
      const confirmed = await confirm({
        title: "Delete Resource",
        message: `Are you sure you want to delete "${resource?.name}"? This action cannot be undone.`,
        variant: "danger",
        confirmText: "Delete",
      });

      if (confirmed) {
        try {
          await deleteResource(id);
          addToast("Resource deleted successfully", "success");
        } catch {
          addToast("Failed to delete resource", "error");
        }
      }
    },
    [resources, confirm, deleteResource, addToast]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingResource(null);
  }, []);

  const groupedResources = useMemo(() => {
    const groups: Record<string, Resource[]> = {};
    resources.forEach((res) => {
      if (!groups[res.resource_type]) {
        groups[res.resource_type] = [];
      }
      groups[res.resource_type].push(res);
    });
    return groups;
  }, [resources]);

  if (loading && resources.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-500 mt-1">Define resources for access control</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Resource
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-700 hover:text-red-900 font-medium">
            Dismiss
          </button>
        </div>
      )}

      {isFormOpen && (
        <div className="mb-6">
          <ResourceForm
            initialData={editingResource}
            onClose={handleFormClose}
            onSuccess={() => {
              handleFormClose();
              fetchResources();
            }}
          />
        </div>
      )}

      {resources.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Resources Yet</h2>
          <p className="text-gray-500 mb-6">
            Create your first resource to define protected assets
          </p>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Resource
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedResources).map(([type, res]) => (
            <div key={type}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{type}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {res.map((resource) => (
                  <ResourceCard
                    key={resource.id_resource}
                    resource={resource}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
