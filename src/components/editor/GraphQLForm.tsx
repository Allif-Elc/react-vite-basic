import { memo, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APITabs } from "../api/APITabs";
import { ParameterList } from "../api/ParameterList";
import { graphqlAPISchema, type GraphQLAPIFormData } from "../../schemas/graphqlSchema";
import type { GraphQLAPI } from "../../types/api";

interface GraphQLFormProps {
  initialData?: GraphQLAPI | null;
  onSubmit: (data: GraphQLAPIFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const GraphQLForm = memo<GraphQLFormProps>(
  ({ initialData, onSubmit, isSubmitting = false, onCancel }) => {
    const {
      register,
      handleSubmit,
      control,
      reset,
      formState: { errors },
    } = useForm<GraphQLAPIFormData>({
      mode: "onBlur",
      resolver: zodResolver(graphqlAPISchema),
      delayError: 300,
      defaultValues: {
        type: "query",
        arguments: [],
        examples: [],
      },
    });

    useEffect(() => {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description,
          type: initialData.type,
          return_type: initialData.return_type,
          arguments: initialData.arguments || [],
          examples: initialData.examples || [],
        });
      }
    }, [initialData, reset]);

    const tabs = useMemo(
      () => [
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                  Operation Name *
                </label>
                <input
                  {...register("name")}
                  id="name"
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="getUser"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
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
                  placeholder="Describe what this operation does..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label htmlFor="type" className="block text-sm font-medium text-muted-foreground mb-1">
                    Type *
                  </label>
                  <select
                    {...register("type")}
                    id="type"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="query">Query</option>
                    <option value="mutation">Mutation</option>
                    <option value="subscription">Subscription</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>
                <div className="col-span-8">
                  <label
                    htmlFor="return_type"
                    className="block text-sm font-medium text-muted-foreground mb-1"
                  >
                    Return Type *
                  </label>
                  <input
                    {...register("return_type")}
                    id="return_type"
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    placeholder="User"
                  />
                  {errors.return_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.return_type.message}</p>
                  )}
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "arguments",
          label: "Arguments",
          content: (
            <ParameterList
              form={{ register, control } as any}
              name="arguments"
              label="Arguments"
              placeholder="argument name"
              typeOptions={["String", "Int", "Float", "Boolean", "ID", "[Type]", "Type!"]}
            />
          ),
        },
      ],
      [register, control, errors]
    );

    const handleFormSubmit = useCallback(
      async (data: GraphQLAPIFormData) => {
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

GraphQLForm.displayName = "GraphQLForm";
