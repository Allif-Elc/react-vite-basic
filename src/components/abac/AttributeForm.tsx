import { memo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attributeSchema, type AttributeFormData } from "../../schemas/abacSchema";
import { useABACStore } from "../../stores/abacStore";
import { useToastStore } from "../../stores/toastStore";
import { X, Tag } from "lucide-react";
import type { Attribute, CreateAttributeRequest } from "../../types/abac";

interface AttributeFormProps {
  initialData?: Attribute | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AttributeForm = memo<AttributeFormProps>(({ initialData, onClose, onSuccess }) => {
  const { createAttribute, updateAttribute } = useABACStore();
  const { addToast } = useToastStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AttributeFormData>({
    mode: "onBlur",
    resolver: zodResolver(attributeSchema),
    delayError: 300,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      type: initialData?.type || "string",
      enum_values: initialData?.enum_values || [],
    },
  });

  const watchedType = watch("type");
  const watchedEnumValues = watch("enum_values") || [];

  useEffect(() => {
    if (watchedType !== "enum") {
      setValue("enum_values", []);
    }
  }, [watchedType, setValue]);

  const addEnumValue = useCallback(() => {
    const current = watchedEnumValues || [];
    setValue("enum_values", [...current, ""]);
  }, [watchedEnumValues, setValue]);

  const updateEnumValue = useCallback(
    (index: number, value: string) => {
      const current = [...(watchedEnumValues || [])];
      current[index] = value;
      setValue("enum_values", current);
    },
    [watchedEnumValues, setValue]
  );

  const removeEnumValue = useCallback(
    (index: number) => {
      const current = watchedEnumValues || [];
      setValue(
        "enum_values",
        current.filter((_, i) => i !== index)
      );
    },
    [watchedEnumValues, setValue]
  );

  const onSubmit = async (data: AttributeFormData) => {
    try {
      if (initialData) {
        await updateAttribute(initialData.id_attribute, data);
        addToast("Attribute updated successfully", "success");
      } else {
        await createAttribute(data as CreateAttributeRequest);
        addToast("Attribute created successfully", "success");
      }
      onSuccess();
    } catch {
      addToast("Failed to save attribute", "error");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Tag className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? "Edit Attribute" : "New Attribute"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            {...register("name")}
            id="name"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., department, role, location"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            {...register("type")}
            id="type"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="enum">Enum</option>
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        {watchedType === "enum" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Allowed Values *</label>
              <button
                type="button"
                onClick={addEnumValue}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Value
              </button>
            </div>
            <div className="space-y-2">
              {watchedEnumValues.map((value, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateEnumValue(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter value"
                  />
                  <button
                    type="button"
                    onClick={() => removeEnumValue(index)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.enum_values && (
              <p className="mt-1 text-sm text-red-600">{errors.enum_values.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            id="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe this attribute..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Saving..." : initialData ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
});

AttributeForm.displayName = "AttributeForm";
