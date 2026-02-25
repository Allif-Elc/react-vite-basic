import { memo, useEffect, useState, useCallback, useMemo } from "react";
import {
  useABACStore,
  selectPermissions,
  selectABACLoading,
  selectABACError,
} from "../stores/abacStore";
import { useToastStore } from "../stores/toastStore";
import { useConfirm } from "../stores/confirmDialogStore";
import { PageSkeleton } from "../components/Skeleton";
import { PermissionForm } from "../components/abac/PermissionForm";
import { Plus, Edit2, Trash2, ShieldCheck, ShieldX } from "lucide-react";
import type { Permission } from "../types/abac";

const PermissionCard = memo(
  ({
    permission,
    onEdit,
    onDelete,
  }: {
    permission: Permission;
    onEdit: (permission: Permission) => void;
    onDelete: (id: number) => void;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${permission.effect === "allow" ? "bg-green-100" : "bg-red-100"}`}
          >
            {permission.effect === "allow" ? (
              <ShieldCheck className="w-5 h-5 text-green-600" />
            ) : (
              <ShieldX className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{permission.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                permission.effect === "allow"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {permission.effect}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(permission)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit permission"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(permission.id_permission)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete permission"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {permission.description && (
        <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
      )}
      {permission.actions && permission.actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {permission.actions.map((action) => (
            <span key={action} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
              {action}
            </span>
          ))}
        </div>
      )}
      {(!permission.actions || permission.actions.length === 0) && (
        <p className="text-xs text-gray-400 italic mb-2">No actions defined</p>
      )}
      {permission.condition && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1">Condition:</p>
          <code className="text-xs bg-gray-50 px-2 py-1 rounded block overflow-x-auto">
            {permission.condition}
          </code>
        </div>
      )}
    </div>
  )
);

PermissionCard.displayName = "PermissionCard";

export default function PermissionsList() {
  const permissions = useABACStore(selectPermissions);
  const loading = useABACStore(selectABACLoading);
  const error = useABACStore(selectABACError);
  const { fetchPermissions, deletePermission, clearError } = useABACStore();
  const { addToast } = useToastStore();
  const confirm = useConfirm();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleCreate = useCallback(() => {
    setEditingPermission(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((permission: Permission) => {
    setEditingPermission(permission);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      const permission = permissions.find((p) => p.id_permission === id);
      const confirmed = await confirm({
        title: "Delete Permission",
        message: `Are you sure you want to delete "${permission?.name}"? This action cannot be undone.`,
        variant: "danger",
        confirmText: "Delete",
      });

      if (confirmed) {
        try {
          await deletePermission(id);
          addToast("Permission deleted successfully", "success");
        } catch {
          addToast("Failed to delete permission", "error");
        }
      }
    },
    [permissions, confirm, deletePermission, addToast]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingPermission(null);
  }, []);

  const groupedPermissions = useMemo(() => {
    return {
      allow: permissions.filter((p) => p.effect === "allow"),
      deny: permissions.filter((p) => p.effect === "deny"),
    };
  }, [permissions]);

  if (loading && permissions.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
          <p className="text-gray-500 mt-1">Define access permissions for users</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Permission
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
          <PermissionForm
            initialData={editingPermission}
            onClose={handleFormClose}
            onSuccess={() => {
              handleFormClose();
              fetchPermissions();
            }}
          />
        </div>
      )}

      {permissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ShieldCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Permissions Yet</h2>
          <p className="text-gray-500 mb-6">Create your first permission to define access rules</p>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Permission
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedPermissions.allow.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                Allow Permissions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedPermissions.allow.map((permission) => (
                  <PermissionCard
                    key={permission.id_permission}
                    permission={permission}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
          {groupedPermissions.deny.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldX className="w-5 h-5 text-red-600" />
                Deny Permissions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedPermissions.deny.map((permission) => (
                  <PermissionCard
                    key={permission.id_permission}
                    permission={permission}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
