import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userPolicySchema, type UserPolicyFormData } from "../../schemas/abacSchema";
import { useToastStore } from "../../stores/toastStore";
import { X, UserCog, Loader2 } from "lucide-react";
import api from "../../services/api";
import type { UserPolicyDetail, User, Policy } from "../../types/abac";
import { logger } from "../../utils/logger";

interface CreateUserPolicyFormProps {
  initialData?: UserPolicyDetail | null;
  onCancel: () => void;
  onSuccess: (policy: UserPolicyDetail) => void;
}

export function CreateUserPolicyForm({
  initialData,
  onCancel,
  onSuccess,
}: CreateUserPolicyFormProps) {
  const { addToast } = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserPolicyFormData>({
    mode: "onBlur",
    resolver: zodResolver(userPolicySchema),
    delayError: 300,
    defaultValues: initialData
      ? {
          id_user: initialData.id_user,
          id_policy: initialData.id_policy,
          priority: initialData.priority,
          expires_at: initialData.expires_at || "",
        }
      : {
          priority: 0,
          id_user: 0,
          id_policy: 0,
          expires_at: "",
        },
  });

  const watchedPriority = watch("priority") ?? 0;

  useEffect(() => {
    const fetchFormData = async () => {
      setIsLoadingData(true);
      try {
        const [usersRes, policiesRes] = await Promise.all([
          api.get("/api/v1/users"),
          api.get("/api/v1/permissions/policies"),
        ]);

        // Extract users: response.data.data.Data (capital D)
        const usersData = usersRes.data?.data?.Data;
        const usersArray = Array.isArray(usersData) ? usersData : [];

        // Extract policies: response.data.data
        const policiesData = policiesRes.data?.data;
        const policiesArray = Array.isArray(policiesData) ? policiesData : [];

        logger.debug("[CreateUserPolicyForm] Data loaded", {
          usersCount: usersArray.length,
          policiesCount: policiesArray.length,
        });
        setUsers(usersArray);
        setPolicies(policiesArray);

        if (usersArray.length === 0) {
          logger.warn("[CreateUserPolicyForm] No users found");
        }
        if (policiesArray.length === 0) {
          logger.warn("[CreateUserPolicyForm] No policies found");
        }
      } catch (error) {
        logger.error("[CreateUserPolicyForm] Error loading form data", error);
        const message = error instanceof Error ? error.message : "Failed to load form data";
        addToast(message, "error");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchFormData();
  }, [addToast]);

  const onSubmit = async (data: UserPolicyFormData) => {
    setIsLoading(true);
    try {
      const submitData = {
        ...data,
        expires_at: data.expires_at || undefined,
      };

      if (initialData) {
        const res = await api.put<{ data: UserPolicyDetail }>(
          `/api/v1/permissions/user-policies/${initialData.id_user_policy}`,
          submitData
        );
        addToast("User policy updated successfully", "success");
        onSuccess(res.data.data);
      } else {
        const res = await api.post<{ data: UserPolicyDetail }>(
          "/api/v1/permissions/user-policies",
          submitData
        );
        addToast("User policy created successfully", "success");
        onSuccess(res.data.data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save user policy";
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority > 0) return "text-green-600";
    if (priority < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  if (isLoadingData) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading form data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserCog className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {initialData ? "Edit User Policy" : "New User Policy"}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        <div>
          <label htmlFor="id_user" className="block text-sm font-medium text-muted-foreground mb-1">
            User *
          </label>
          <select
            {...register("id_user", { valueAsNumber: true })}
            id="id_user"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:cursor-not-allowed"
          >
            <option value={0}>Select a user</option>
            {users.map((user) => (
              <option key={user.id_user} value={user.id_user}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {errors.id_user && <p className="mt-1 text-sm text-red-600">{errors.id_user.message}</p>}
        </div>

        <div>
          <label htmlFor="id_policy" className="block text-sm font-medium text-muted-foreground mb-1">
            Policy *
          </label>
          <select
            {...register("id_policy", { valueAsNumber: true })}
            id="id_policy"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:cursor-not-allowed"
          >
            <option value={0}>Select a policy</option>
            {policies
              .filter((p) => p.is_active)
              .map((policy) => (
                <option key={policy.id_policy} value={policy.id_policy}>
                  {policy.name}
                </option>
              ))}
          </select>
          {errors.id_policy && (
            <p className="mt-1 text-sm text-red-600">{errors.id_policy.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="priority" className="block text-sm font-medium text-muted-foreground">
              Priority
            </label>
            <span className={`text-sm font-medium ${getPriorityColor(watchedPriority)}`}>
              {watchedPriority > 0 ? "+" : ""}
              {watchedPriority}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">-100</span>
            <input
              {...register("priority", { valueAsNumber: true })}
              id="priority"
              type="range"
              min="-100"
              max="100"
              step="5"
              disabled={isLoading}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:cursor-not-allowed"
            />
            <span className="text-xs text-muted-foreground">+100</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Higher priority policies are evaluated first. Role-based policies have priority 0.
          </p>
          {errors.priority && (
            <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="expires_at" className="block text-sm font-medium text-muted-foreground mb-1">
            Expiration Date
          </label>
          <input
            {...register("expires_at")}
            id="expires_at"
            type="datetime-local"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave empty for permanent access. Used for temporary access grants.
          </p>
          {errors.expires_at && (
            <p className="mt-1 text-sm text-red-600">{errors.expires_at.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {(isSubmitting || isLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting || isLoading ? "Saving..." : initialData ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
            className="px-6 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
