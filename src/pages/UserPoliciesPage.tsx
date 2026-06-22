import { useState, useEffect, useCallback } from "react";
import { useToastStore } from "../stores/toastStore";
import { useConfirm } from "../stores/confirmDialogStore";
import { Plus, UserCog, Search, Loader2, AlertCircle } from "lucide-react";
import { CreateUserPolicyForm } from "../components/abac/CreateUserPolicyForm";
import { UserPolicyItem } from "../components/abac/UserPolicyItem";
import type { UserPolicyDetail } from "../types/abac";
import api from "../services/api";

export default function UserPoliciesPage() {
  const { addToast } = useToastStore();
  const confirm = useConfirm();

  const [userPolicies, setUserPolicies] = useState<UserPolicyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<UserPolicyDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: UserPolicyDetail[] }>(
        "/api/v1/permissions/user-policies/details"
      );
      setUserPolicies(res.data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch user policies";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUserPolicies();
  }, [fetchUserPolicies]);

  const handleCreate = useCallback(() => {
    setEditingPolicy(null);
    setIsCreating(true);
  }, []);

  const handleEdit = useCallback((policy: UserPolicyDetail) => {
    setEditingPolicy(policy);
    setIsCreating(false);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      const policy = userPolicies.find((p) => p.id_user_policy === id);
      const confirmed = await confirm({
        title: "Delete User Policy",
        message: `Are you sure you want to delete the user policy for "${policy?.user_name}"? This action cannot be undone.`,
        variant: "danger",
        confirmText: "Delete",
      });

      if (!confirmed) return;

      setIsSubmitting(true);
      try {
        await api.delete(`/api/v1/permissions/user-policies/${id}`);
        setUserPolicies((prev) => prev.filter((p) => p.id_user_policy !== id));
        addToast("User policy deleted successfully", "success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete user policy";
        addToast(message, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [userPolicies, confirm, addToast]
  );

  const handleFormCancel = useCallback(() => {
    setIsCreating(false);
    setEditingPolicy(null);
  }, []);

  const handleFormSuccess = useCallback(
    async (policy: UserPolicyDetail) => {
      setIsSubmitting(true);
      try {
        if (editingPolicy) {
          setUserPolicies((prev) =>
            prev.map((p) => (p.id_user_policy === policy.id_user_policy ? policy : p))
          );
        } else {
          setUserPolicies((prev) => [...prev, policy]);
        }
        setIsCreating(false);
        setEditingPolicy(null);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingPolicy]
  );

  const filteredPolicies = userPolicies.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    const userName = p.user_name || "";
    const userEmail = p.user_email || "";
    const policyName = p.policy_name || "";
    return (
      userName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower) ||
      policyName.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Policies</h1>
          <p className="text-muted-foreground mt-1">
            Manage user-to-policy assignments with priority overrides
          </p>
        </div>
        {!isCreating && !editingPolicy && (
          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create User Policy
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Error loading user policies</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={fetchUserPolicies}
            className="ml-auto px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by user name, email, or policy..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isSubmitting}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:cursor-not-allowed"
        />
      </div>

      {(isCreating || editingPolicy) && (
        <div className="mb-6">
          <CreateUserPolicyForm
            key={editingPolicy ? `edit-${editingPolicy.id_user_policy}` : "create"}
            initialData={editingPolicy}
            onCancel={handleFormCancel}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      {filteredPolicies.length === 0 ? (
        <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
          <UserCog className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {searchTerm ? "No Matching User Policies" : "No User Policies Found"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first user policy to assign specific policies to users"}
          </p>
          {!searchTerm && !isCreating && !editingPolicy && (
            <button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create User Policy
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <UserPolicyItem
              key={policy.id_user_policy}
              userPolicy={policy}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
