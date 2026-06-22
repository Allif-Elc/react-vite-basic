import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useToastStore } from "../stores/toastStore";
import { useConfirm } from "../stores/confirmDialogStore";
import { useABACStore, selectUserAttributes, selectUsers, selectAttributes } from "../stores/abacStore";
import { Plus, Shield, Search, Loader2, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { UserAttributeForm } from "../components/abac/UserAttributeForm";
import type { UserAttributeDetail } from "../types/abac";

interface UserAttributeCardProps {
  userAttribute: UserAttributeDetail;
  onEdit: (attr: UserAttributeDetail) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const UserAttributeCard = memo<UserAttributeCardProps>(({ userAttribute, onEdit, onDelete, isDeleting }) => {
  const getBadgeColor = (attrType: string) => {
    switch (attrType) {
      case "enum":
        return "bg-purple-100 text-purple-800";
      case "number":
        return "bg-primary/10 text-primary";
      case "boolean":
        return "bg-green-100 text-green-800";
      case "string":
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${getBadgeColor(userAttribute.attribute_type)}`}>
            {userAttribute.attribute_name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(userAttribute)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(userAttribute.id_user_attribute)}
            disabled={isDeleting}
            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-foreground">{userAttribute.user_name}</p>
          <p className="text-xs text-muted-foreground">{userAttribute.user_email}</p>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Value</p>
          <p className="text-sm font-medium text-foreground bg-muted px-2 py-1 rounded inline-block">
            {userAttribute.value}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Type: {userAttribute.attribute_type}</span>
        <span>{new Date(userAttribute.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
});

UserAttributeCard.displayName = "UserAttributeCard";

export default function UserAttributesList() {
  const { addToast } = useToastStore();
  const confirm = useConfirm();
  const userAttributes = useABACStore(selectUserAttributes);
  const users = useABACStore(selectUsers);
  const attributes = useABACStore(selectAttributes);
  const { fetchUserAttributes, fetchUsers, fetchAttributes, deleteUserAttribute } = useABACStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<UserAttributeDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchUserAttributes(), fetchUsers(), fetchAttributes()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch data";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [fetchUserAttributes, fetchUsers, fetchAttributes, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = useCallback(() => {
    setEditingAttribute(null);
    setIsCreating(true);
  }, []);

  const handleEdit = useCallback((attr: UserAttributeDetail) => {
    setEditingAttribute(attr);
    setIsCreating(false);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      const attr = userAttributes.find((a) => a.id_user_attribute === id);
      const confirmed = await confirm({
        title: "Delete User Attribute",
        message: `Are you sure you want to remove the ${attr?.attribute_name}="${attr?.value}" assignment from "${attr?.user_name}"? This action cannot be undone.`,
        variant: "danger",
        confirmText: "Delete",
      });

      if (!confirmed) return;

      setIsDeleting(true);
      try {
        await deleteUserAttribute(id);
        addToast("User attribute deleted successfully", "success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete user attribute";
        addToast(message, "error");
      } finally {
        setIsDeleting(false);
      }
    },
    [userAttributes, confirm, deleteUserAttribute, addToast]
  );

  const handleFormCancel = useCallback(() => {
    setIsCreating(false);
    setEditingAttribute(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsCreating(false);
    setEditingAttribute(null);
  }, []);

  const filteredAttributes = useMemo(() => {
    return userAttributes.filter((attr) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        attr.user_name.toLowerCase().includes(searchLower) ||
        attr.user_email.toLowerCase().includes(searchLower) ||
        attr.attribute_name.toLowerCase().includes(searchLower) ||
        attr.value.toLowerCase().includes(searchLower)
      );
    });
  }, [userAttributes, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user attributes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Attributes</h1>
          <p className="text-muted-foreground mt-1">
            Assign attributes to users for fine-grained access control
          </p>
        </div>
        {!isCreating && !editingAttribute && (
          <button
            onClick={handleCreate}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-5 h-5" />
            Assign Attribute
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Error loading user attributes</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={loadData}
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
          placeholder="Search by user name, attribute, or value..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isDeleting}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:cursor-not-allowed"
        />
      </div>

      {(isCreating || editingAttribute) && (
        <div className="mb-6">
          <UserAttributeForm
            key={editingAttribute ? `edit-${editingAttribute.id_user_attribute}` : "create"}
            initialData={editingAttribute}
            users={users}
            attributes={attributes}
            onClose={handleFormCancel}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      {filteredAttributes.length === 0 ? (
        <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {searchTerm ? "No Matching User Attributes" : "No User Attributes Found"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Assign your first attribute to a user to enable attribute-based access control"}
          </p>
          {!searchTerm && !isCreating && !editingAttribute && (
            <button
              onClick={handleCreate}
              disabled={isDeleting}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Assign Attribute
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttributes.map((attr) => (
            <UserAttributeCard
              key={attr.id_user_attribute}
              userAttribute={attr}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
