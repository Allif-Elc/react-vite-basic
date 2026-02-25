import { memo, useEffect, useState, useCallback } from "react";
import { useABACStore, selectPolicies, selectABACLoading } from "../stores/abacStore";
import { useToastStore } from "../stores/toastStore";
import { FileText, Shield, Plus, Edit, Trash2 } from "lucide-react";
import type { Policy } from "../types/abac";
import { PolicyForm } from "../components/abac/PolicyForm";

const PolicyCard = memo(
  ({
    policy,
    onEdit,
    onDelete,
  }: {
    policy: Policy;
    onEdit: (policy: Policy) => void;
    onDelete: (policy: Policy) => void;
  }) => {
    const parsePolicyRule = (rule: Record<string, unknown>) => {
      try {
        return JSON.stringify(rule, null, 2);
      } catch {
        return "{}";
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{policy.name}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  policy.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {policy.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(policy)}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit policy"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(policy)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete policy"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-2">Policy Rule:</p>
          <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto border border-gray-200">
            {parsePolicyRule(policy.policy_rule)}
          </pre>
        </div>
      </div>
    );
  }
);

PolicyCard.displayName = "PolicyCard";

export default function PoliciesList() {
  const policies = useABACStore(selectPolicies);
  const loading = useABACStore(selectABACLoading);
  const { fetchPolicies, deletePolicy } = useABACStore();
  const { addToast } = useToastStore();

  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Policy | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleCreate = useCallback(() => {
    setEditingPolicy(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((policy: Policy) => {
    setEditingPolicy(policy);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((policy: Policy) => {
    setDeleteConfirm(policy);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirm) {
      try {
        await deletePolicy(deleteConfirm.id_policy);
        addToast("Policy deleted successfully", "success");
        await fetchPolicies();
        setDeleteConfirm(null);
      } catch (error) {
        addToast((error as Error).message, "error");
      }
    }
  }, [deleteConfirm, deletePolicy, fetchPolicies, addToast]);

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setEditingPolicy(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setShowForm(false);
    setEditingPolicy(null);
  }, []);

  if (loading && policies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
          <p className="text-gray-500 mt-1">Manage authorization policies</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Policy
        </button>
      </div>

      {policies.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Policies Found</h2>
          <p className="text-gray-500 mb-4">
            Create your first authorization policy to get started
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Policy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <PolicyCard
              key={policy.id_policy}
              policy={policy}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <PolicyForm
              initialData={editingPolicy}
              onClose={handleFormClose}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Policy</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the policy <strong>{deleteConfirm.name}</strong>? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
