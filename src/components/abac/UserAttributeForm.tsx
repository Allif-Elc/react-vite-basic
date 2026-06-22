import { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userAttributeSchema, type UserAttributeFormData } from "../../schemas/abacSchema";
import { useABACStore } from "../../stores/abacStore";
import { useToastStore } from "../../stores/toastStore";
import { X, Shield } from "lucide-react";
import type { UserAttributeDetail, Attribute, User } from "../../types/abac";

interface UserAttributeFormProps {
  initialData?: UserAttributeDetail | null;
  users: User[];
  attributes: Attribute[];
  onClose: () => void;
  onSuccess: () => void;
}

export const UserAttributeForm = memo<UserAttributeFormProps>(
  ({ initialData, users, attributes, onClose, onSuccess }) => {
    const { createUserAttribute, updateUserAttribute, fetchUserAttributes } = useABACStore();
    const { addToast } = useToastStore();
    const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
      initialData
        ? attributes.find((a) => a.id_attribute === initialData.id_attribute) || null
        : null
    );
    const [enumValues, setEnumValues] = useState<string[]>([]);

    const defaultValues: UserAttributeFormData = initialData
      ? {
          id_user: initialData.id_user,
          id_attribute: initialData.id_attribute,
          value: initialData.value,
        }
      : {
          id_user: 0,
          id_attribute: 0,
          value: "",
        };

    const {
      register,
      handleSubmit,
      watch,
      setValue,
      formState: { errors, isSubmitting },
    } = useForm<UserAttributeFormData>({
      mode: "onBlur",
      resolver: zodResolver(userAttributeSchema),
      delayError: 300,
      defaultValues,
    });

    const watchedAttributeId = watch("id_attribute");

    // Update selected attribute and enum values when attribute changes
    useEffect(() => {
      const attr = attributes.find((a) => a.id_attribute === watchedAttributeId);
      setSelectedAttribute(attr || null);
      if (attr?.type === "enum" && attr.enum_values) {
        setEnumValues(attr.enum_values);
      } else {
        setEnumValues([]);
      }
    }, [watchedAttributeId, attributes]);

    // Set initial attribute value
    useEffect(() => {
      if (initialData && !watchedAttributeId) {
        setValue("id_attribute", initialData.id_attribute);
      }
    }, [initialData, watchedAttributeId, setValue]);

    const onSubmit = async (data: UserAttributeFormData) => {
      try {
        if (initialData) {
          await updateUserAttribute(initialData.id_user_attribute, { value: data.value });
          addToast("User attribute updated successfully", "success");
        } else {
          await createUserAttribute(data);
          addToast("User attribute created successfully", "success");
        }
        await fetchUserAttributes();
        onSuccess();
      } catch (error) {
        addToast((error as Error).message, "error");
      }
    };

    const renderValueInput = () => {
      if (!selectedAttribute) {
        return (
          <input
            {...register("value")}
            placeholder="Select an attribute first"
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
          />
        );
      }

      switch (selectedAttribute.type) {
        case "boolean":
          return (
            <select
              {...register("value")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select value</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          );
        case "enum":
          return (
            <select
              {...register("value")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select value</option>
              {enumValues.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          );
        case "number":
          return (
            <input
              {...register("value")}
              type="number"
              step="any"
              placeholder="Enter a number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          );
        case "string":
        default:
          return (
            <input
              {...register("value")}
              type="text"
              placeholder="Enter value"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          );
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? "Edit User Attribute" : "Assign User Attribute"}
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
          {/* User */}
          <div>
            <label htmlFor="id_user" className="block text-sm font-medium text-gray-700 mb-1">
              User *
            </label>
            <select
              {...register("id_user", { valueAsNumber: true })}
              id="id_user"
              disabled={!!initialData}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="0">Select a user</option>
              {users.map((user) => (
                <option key={user.id_user} value={user.id_user}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.id_user && <p className="mt-1 text-sm text-red-600">{errors.id_user.message}</p>}
          </div>

          {/* Attribute */}
          <div>
            <label htmlFor="id_attribute" className="block text-sm font-medium text-gray-700 mb-1">
              Attribute *
            </label>
            <select
              {...register("id_attribute", { valueAsNumber: true })}
              id="id_attribute"
              disabled={!!initialData}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="0">Select an attribute</option>
              {attributes.map((attr) => (
                <option key={attr.id_attribute} value={attr.id_attribute}>
                  {attr.name} ({attr.type})
                </option>
              ))}
            </select>
            {errors.id_attribute && (
              <p className="mt-1 text-sm text-red-600">{errors.id_attribute.message}</p>
            )}
            {selectedAttribute && (
              <p className="mt-1 text-xs text-gray-500">
                Type: {selectedAttribute.type}
                {selectedAttribute.description && ` - ${selectedAttribute.description}`}
              </p>
            )}
          </div>

          {/* Value */}
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
              Value *
            </label>
            {renderValueInput()}
            {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>}
            {selectedAttribute?.type === "enum" && (
              <p className="mt-1 text-xs text-gray-500">
                Allowed values: {enumValues.join(", ")}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving..." : initialData ? "Update" : "Assign"}
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
  }
);

UserAttributeForm.displayName = "UserAttributeForm";
