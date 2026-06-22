import { memo, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APITabs } from "../api/APITabs";
import { grpcAPISchema, type GrpcAPIFormData } from "../../schemas/grpcSchema";
import type { GrpcAPI } from "../../types/api";
import { Plus, X } from "lucide-react";
import { useFieldArray } from "react-hook-form";

interface GRPCFormProps {
  initialData?: GrpcAPI | null;
  onSubmit: (data: GrpcAPIFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const GRPC_TYPES = [
  "double",
  "float",
  "int32",
  "int64",
  "uint32",
  "uint64",
  "sint32",
  "sint64",
  "fixed32",
  "fixed64",
  "sfixed32",
  "sfixed64",
  "bool",
  "string",
  "bytes",
];
const GRPC_LABELS = ["optional", "repeated", "required"];

const MessageFields = ({
  control,
  register,
  name,
}: {
  control: any;
  register: any;
  name: string;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-muted-foreground">Fields</label>
        <button
          type="button"
          onClick={() => append({ name: "", type: "string", label: "optional", description: "" })}
          className="text-primary hover:text-primary text-sm flex items-center gap-1"
        >
          <Plus size={16} /> Add Field
        </button>
      </div>
      <div className="space-y-2">
        {fields.length === 0 ? (
          <div className="text-sm text-muted-foreground italic p-2 bg-muted rounded">
            No fields added yet
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="flex gap-2 items-start p-3 border border-border rounded-lg bg-card"
            >
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-6 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
              <div className="flex-1 grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <input
                    {...register(`${name}.${index}.name`)}
                    type="text"
                    placeholder="field_name"
                    className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="col-span-3">
                  <select
                    {...register(`${name}.${index}.type`)}
                    className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {GRPC_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <select
                    {...register(`${name}.${index}.label`)}
                    className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {GRPC_LABELS.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    {...register(`${name}.${index}.description`)}
                    type="text"
                    placeholder="Description"
                    className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const GRPCForm = memo<GRPCFormProps>(
  ({ initialData, onSubmit, isSubmitting = false, onCancel }) => {
    const {
      register,
      handleSubmit,
      control,
      reset,
      formState: { errors },
    } = useForm<GrpcAPIFormData>({
      mode: "onBlur",
      resolver: zodResolver(grpcAPISchema),
      delayError: 300,
      defaultValues: {
        request_message: [],
        response_message: [],
        examples: [],
      },
    });

    useEffect(() => {
      if (initialData) {
        reset({
          service_name: initialData.service_name,
          method_name: initialData.method_name,
          description: initialData.description,
          request_message: initialData.request_message || [],
          response_message: initialData.response_message || [],
          proto_definition: initialData.proto_definition || "",
          examples: initialData.examples || [],
        });
      }
    }, [initialData, reset]);

    const {
      fields: exampleFields,
      append: appendExample,
      remove: removeExample,
    } = useFieldArray({
      control,
      name: "examples",
    });

    const addExample = () => {
      appendExample({ language: "javascript", description: "", code: "" });
    };

    const tabs = useMemo(
      () => [
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="service_name"
                    className="block text-sm font-medium text-muted-foreground mb-1"
                  >
                    Service Name *
                  </label>
                  <input
                    {...register("service_name")}
                    id="service_name"
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    placeholder="UserService"
                  />
                  {errors.service_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.service_name.message}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="method_name"
                    className="block text-sm font-medium text-muted-foreground mb-1"
                  >
                    Method Name *
                  </label>
                  <input
                    {...register("method_name")}
                    id="method_name"
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    placeholder="GetUser"
                  />
                  {errors.method_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.method_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-muted-foreground mb-1"
                >
                  Description
                </label>
                <textarea
                  {...register("description")}
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe what this method does..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          ),
        },
        {
          id: "request",
          label: "Request Message",
          content: <MessageFields control={control} register={register} name="request_message" />,
        },
        {
          id: "response",
          label: "Response Message",
          content: <MessageFields control={control} register={register} name="response_message" />,
        },
        {
          id: "proto",
          label: "Proto Definition",
          content: (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Proto Definition
              </label>
              <textarea
                {...register("proto_definition")}
                rows={16}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm bg-muted"
                placeholder='syntax = "proto3";&#10;&#10;service UserService {&#10;  rpc GetUser GetUserRequest) returns (GetUserResponse);&#10;}'
              />
            </div>
          ),
        },
        {
          id: "examples",
          label: "Examples",
          content: (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-muted-foreground">Code Examples</label>
                <button
                  type="button"
                  onClick={addExample}
                  className="text-primary hover:text-primary text-sm flex items-center gap-1"
                >
                  <Plus size={16} /> Add Example
                </button>
              </div>
              <div className="space-y-3">
                {exampleFields.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic p-2 bg-muted rounded">
                    No examples added yet
                  </div>
                ) : (
                  exampleFields.map((field, index) => (
                    <div key={field.id} className="border border-border rounded-lg bg-card p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-2">
                          <select
                            {...register(`examples.${index}.language`)}
                            className="px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="go">Go</option>
                            <option value="java">Java</option>
                            <option value="csharp">C#</option>
                            <option value="typescript">TypeScript</option>
                          </select>
                          <input
                            {...register(`examples.${index}.description`)}
                            type="text"
                            placeholder="Description (optional)"
                            className="px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExample(index)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <textarea
                        {...register(`examples.${index}.code`)}
                        rows={10}
                        className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring font-mono bg-muted"
                        placeholder="// Example code here"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ),
        },
      ],
      [register, control, errors, exampleFields]
    );

    const handleFormSubmit = useCallback(
      async (data: GrpcAPIFormData) => {
        await onSubmit(data);
      },
      [onSubmit]
    );

    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <APITabs tabs={tabs} defaultTab="overview" />

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Saving..." : "Save API"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    );
  }
);

GRPCForm.displayName = "GRPCForm";
