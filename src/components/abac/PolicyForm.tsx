import { memo, useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { policySchema, policyRuleSchema, type PolicyFormData } from "../../schemas/abacSchema";
import { useABACStore, selectAttributes, selectResources } from "../../stores/abacStore";
import { useToastStore } from "../../stores/toastStore";
import { X, FileText, Code, Plus, Trash2, Type } from "lucide-react";
import type { Policy } from "../../types/abac";

interface PolicyFormProps {
  initialData?: Policy | null;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = "form" | "json";

export const PolicyForm = memo<PolicyFormProps>(({ initialData, onClose, onSuccess }) => {
  const { createPolicy, updatePolicy, fetchPolicies, fetchAttributes, fetchResources } = useABACStore();
  const attributes = useABACStore(selectAttributes);
  const resources = useABACStore(selectResources);
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<TabType>("form");
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [attributeValues, setAttributeValues] = useState<string[]>([]);

  // Load attributes and resources on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchAttributes(), fetchResources()]);
      } catch (error) {
        console.error("Failed to load attributes/resources:", error);
      }
    };
    loadData();
  }, [fetchAttributes, fetchResources]);

  const defaultValues: PolicyFormData = initialData
    ? {
        name: initialData.name,
        policy_rule: initialData.policy_rule as PolicyFormData["policy_rule"],
        is_active: initialData.is_active,
      }
    : {
        name: "",
        policy_rule: { attribute_name: "", attribute_value: "", resource: "", action: [] },
        is_active: true,
      };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PolicyFormData>({
    mode: "onBlur",
    resolver: zodResolver(policySchema),
    delayError: 300,
    defaultValues,
  });

  const watchedPolicy = watch();
  const watchedAttributeName = watch("policy_rule.attribute_name");

  // Update attribute values dropdown when attribute changes
  useEffect(() => {
    if (watchedAttributeName) {
      const attr = attributes.find((a) => a.name === watchedAttributeName);
      if (attr?.type === "enum" && attr.enum_values) {
        setAttributeValues(attr.enum_values);
      } else {
        setAttributeValues([]);
      }
    } else {
      setAttributeValues([]);
    }
  }, [watchedAttributeName, attributes]);

  // Initialize JSON input when initialData changes
  useEffect(() => {
    if (initialData) {
      setJsonInput(JSON.stringify(initialData.policy_rule, null, 2));
    } else {
      setJsonInput(JSON.stringify({ attribute_name: "", attribute_value: "", resource: "", action: [] }, null, 2));
    }
  }, [initialData]);

  // Update JSON input when form data changes
  useEffect(() => {
    if (activeTab === "form") {
      setJsonInput(JSON.stringify(watchedPolicy.policy_rule, null, 2));
      setJsonError("");
    }
  }, [watchedPolicy.policy_rule, activeTab]);

  const handleJsonChange = useCallback(
    (value: string) => {
      setJsonInput(value);
      try {
        const parsed = JSON.parse(value);
        const validated = policyRuleSchema.safeParse(parsed);
        if (validated.success) {
          setValue("policy_rule", validated.data);
          setJsonError("");
        } else {
          setJsonError(validated.error.errors[0]?.message || "Invalid JSON format");
        }
      } catch {
        setJsonError("Invalid JSON syntax");
      }
    },
    [setValue]
  );

  const addAction = useCallback(() => {
    const currentActions = watchedPolicy.policy_rule?.action || [];
    setValue("policy_rule.action", [...currentActions, ""]);
  }, [setValue, watchedPolicy.policy_rule]);

  const removeAction = useCallback(
    (index: number) => {
      const currentActions = watchedPolicy.policy_rule?.action || [];
      setValue(
        "policy_rule.action",
        currentActions.filter((_, i) => i !== index)
      );
    },
    [setValue, watchedPolicy.policy_rule]
  );

  const updateAction = useCallback(
    (index: number, value: string) => {
      const currentActions = watchedPolicy.policy_rule?.action || [];
      const newActions = [...currentActions];
      newActions[index] = value;
      setValue("policy_rule.action", newActions);
    },
    [setValue, watchedPolicy.policy_rule]
  );

  const onSubmit = async (data: PolicyFormData) => {
    try {
      if (initialData) {
        await updatePolicy(initialData.id_policy, data);
        addToast("Policy updated successfully", "success");
      } else {
        await createPolicy(data);
        addToast("Policy created successfully", "success");
      }
      await fetchPolicies();
      onSuccess();
    } catch (error) {
      addToast((error as Error).message, "error");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? "Edit Policy" : "New Policy"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("form")}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeTab === "form"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Type className="w-4 h-4" />
          Form
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("json")}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
            activeTab === "json"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Code className="w-4 h-4" />
          JSON Editor
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {activeTab === "form" ? (
          <>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Policy Name *
              </label>
              <input
                {...register("name")}
                id="name"
                placeholder="e.g., hr_employee_records"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Use lowercase with underscores (e.g., api_admin_full_access)
              </p>
            </div>

            {/* Attribute Name */}
            <div>
              <label htmlFor="attribute_name" className="block text-sm font-medium text-gray-700 mb-1">
                Attribute *
              </label>
              <select
                {...register("policy_rule.attribute_name")}
                id="attribute_name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an attribute</option>
                {attributes.map((attr) => (
                  <option key={attr.id_attribute} value={attr.name}>
                    {attr.name} ({attr.type})
                  </option>
                ))}
              </select>
              {errors.policy_rule?.attribute_name && (
                <p className="mt-1 text-sm text-red-600">{errors.policy_rule?.attribute_name?.message || "Attribute is required"}</p>
              )}
            </div>

            {/* Attribute Value */}
            <div>
              <label htmlFor="attribute_value" className="block text-sm font-medium text-gray-700 mb-1">
                Attribute Value *
              </label>
              {attributeValues.length > 0 ? (
                <select
                  {...register("policy_rule.attribute_value")}
                  id="attribute_value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a value</option>
                  {attributeValues.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...register("policy_rule.attribute_value")}
                  id="attribute_value"
                  placeholder="e.g., admin, HR, 5, true"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              {errors.policy_rule?.attribute_value && (
                <p className="mt-1 text-sm text-red-600">{errors.policy_rule?.attribute_value?.message || "Attribute value is required"}</p>
              )}
              {attributeValues.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Allowed values: {attributeValues.join(", ")}
                </p>
              )}
            </div>

            {/* Resource */}
            <div>
              <label htmlFor="resource" className="block text-sm font-medium text-gray-700 mb-1">
                Resource *
              </label>
              <select
                {...register("policy_rule.resource")}
                id="resource"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a resource</option>
                <option value="*">Wildcard (*) - All Resources</option>
                {resources.map((res) => (
                  <option key={res.id_resource} value={res.name}>
                    {res.name}
                  </option>
                ))}
              </select>
              {errors.policy_rule?.resource && (
                <p className="mt-1 text-sm text-red-600">{errors.policy_rule.resource.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Use * for wildcard to match all resources
              </p>
            </div>

            {/* Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actions *</label>
              <div className="space-y-2">
                {(watchedPolicy.policy_rule?.action || []).map((action, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={action}
                      onChange={(e) => updateAction(index, e.target.value)}
                      placeholder="e.g., read, write, delete, *"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {(watchedPolicy.policy_rule?.action?.length || 0) > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAction(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAction}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Action
                </button>
              </div>
              {errors.policy_rule?.action && (
                <p className="mt-1 text-sm text-red-600">{errors.policy_rule.action.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Use * for all actions. Common: read, write, delete, execute
              </p>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                {...register("is_active")}
                id="is_active"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
          </>
        ) : (
          <>
            {/* JSON Editor */}
            <div>
              <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 mb-1">
                Policy Rule (JSON) *
              </label>
              <textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                rows={10}
                className={`w-full px-3 py-2 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 ${
                  jsonError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder='{"attribute_name": "role", "attribute_value": "admin", "resource": "*", "action": ["*"]}'
              />
              {jsonError && <p className="mt-1 text-sm text-red-600">{jsonError}</p>}
              {!jsonError && watchedPolicy.policy_rule && (
                <p className="mt-1 text-xs text-gray-500">
                  Valid JSON with {watchedPolicy.policy_rule.action?.length || 0} action(s)
                </p>
              )}
            </div>

            {/* Name (still needed in JSON mode) */}
            <div>
              <label htmlFor="name-json" className="block text-sm font-medium text-gray-700 mb-1">
                Policy Name *
              </label>
              <input
                {...register("name")}
                id="name-json"
                placeholder="e.g., hr_employee_records"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                {...register("is_active")}
                id="is_active-json"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="is_active-json" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !!jsonError}
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

PolicyForm.displayName = "PolicyForm";
