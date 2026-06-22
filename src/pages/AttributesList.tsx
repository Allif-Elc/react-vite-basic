import { memo, useEffect, useState, useCallback, useMemo } from "react";
import {
  useABACStore,
  selectAttributes,
  selectABACLoading,
  selectABACError,
} from "../stores/abacStore";
import { useToastStore } from "../stores/toastStore";
import { useConfirm } from "../stores/confirmDialogStore";
import { PageSkeleton } from "../components/Skeleton";
import { AttributeForm } from "../components/abac/AttributeForm";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import type { Attribute } from "../types/abac";

const AttributeCard = memo(
  ({
    attribute,
    onEdit,
    onDelete,
  }: {
    attribute: Attribute;
    onEdit: (attribute: Attribute) => void;
    onDelete: (id: number) => void;
  }) => (
    <div className="bg-card rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Tag className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{attribute.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                attribute.type === "string"
                  ? "bg-primary/10 text-primary"
                  : attribute.type === "number"
                    ? "bg-green-100 text-green-700"
                    : attribute.type === "boolean"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-purple-100 text-purple-700"
              }`}
            >
              {attribute.type}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(attribute)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
            aria-label="Edit attribute"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(attribute.id_attribute)}
            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete attribute"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {attribute.description && (
        <p className="text-sm text-muted-foreground mb-2">{attribute.description}</p>
      )}
      {attribute.type === "enum" && attribute.enum_values && attribute.enum_values.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Allowed values:</p>
          <div className="flex flex-wrap gap-1">
            {attribute.enum_values.map((value) => (
              <span key={value} className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
);

AttributeCard.displayName = "AttributeCard";

export default function AttributesList() {
  const attributes = useABACStore(selectAttributes);
  const loading = useABACStore(selectABACLoading);
  const error = useABACStore(selectABACError);
  const { fetchAttributes, deleteAttribute, clearError } = useABACStore();
  const { addToast } = useToastStore();
  const confirm = useConfirm();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const handleCreate = useCallback(() => {
    setEditingAttribute(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((attribute: Attribute) => {
    setEditingAttribute(attribute);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      const attribute = attributes.find((a) => a.id_attribute === id);
      const confirmed = await confirm({
        title: "Delete Attribute",
        message: `Are you sure you want to delete "${attribute?.name}"? This action cannot be undone.`,
        variant: "danger",
        confirmText: "Delete",
      });

      if (confirmed) {
        try {
          await deleteAttribute(id);
          addToast("Attribute deleted successfully", "success");
        } catch {
          addToast("Failed to delete attribute", "error");
        }
      }
    },
    [attributes, confirm, deleteAttribute, addToast]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingAttribute(null);
  }, []);

  const groupedAttributes = useMemo(() => {
    const groups: Record<string, Attribute[]> = {
      string: [],
      number: [],
      boolean: [],
      enum: [],
    };
    attributes.forEach((attr) => {
      if (groups[attr.type]) {
        groups[attr.type].push(attr);
      }
    });
    return groups;
  }, [attributes]);

  if (loading && attributes.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attributes</h1>
          <p className="text-muted-foreground mt-1">Define user attributes for access control</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Attribute
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
          <AttributeForm
            initialData={editingAttribute}
            onClose={handleFormClose}
            onSuccess={() => {
              handleFormClose();
              fetchAttributes();
            }}
          />
        </div>
      )}

      {attributes.length === 0 ? (
        <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
          <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Attributes Yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first attribute to define user properties
          </p>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Attribute
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAttributes).map(([type, attrs]) =>
            attrs.length > 0 ? (
              <div key={type}>
                <h2 className="text-lg font-semibold text-foreground mb-3 capitalize">{type}s</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attrs.map((attr) => (
                    <AttributeCard
                      key={attr.id_attribute}
                      attribute={attr}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
