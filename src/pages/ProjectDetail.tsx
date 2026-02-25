import { useEffect, useMemo, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAPIStore } from "../stores/apiStore";
import { useToastStore } from "../stores/toastStore";
import { MethodBadge } from "../components/api/MethodBadge";
import { Plus } from "lucide-react";
import { useConfirm } from "../stores/confirmDialogStore";

type FilterType = "all" | "rest" | "graphql" | "grpc";

interface APIWithType {
  apiType: FilterType;
  displayName: string;
  displaySub: string;
  id: number;
  method?: string;
  deleteHandler: () => void;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const confirm = useConfirm();

  const {
    restAPIs,
    graphqlAPIs,
    grpcAPIs,
    loading,
    error,
    fetchAPIs,
    deleteRestAPI,
    deleteGraphQLAPI,
    deleteGrpcAPI,
    clearError,
  } = useAPIStore();

  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (id) {
      fetchAPIs(Number(id));
    }
  }, [id, fetchAPIs]);

  useEffect(() => {
    if (error) {
      addToast(error, "error");
      clearError();
    }
  }, [error, addToast, clearError]);

  const filteredAPIs = useMemo(() => {
    const createDeleteHandler = (apiType: FilterType, apiId: number) => async () => {
      const confirmed = await confirm({
        title: "Delete API",
        message: "Are you sure you want to delete this API? This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "danger",
      });

      if (!confirmed) return;

      try {
        if (apiType === "rest") await deleteRestAPI(apiId);
        else if (apiType === "graphql") await deleteGraphQLAPI(apiId);
        else await deleteGrpcAPI(apiId);
        addToast("API deleted successfully", "success");
      } catch {
        addToast("Failed to delete API", "error");
      }
    };

    const rest: APIWithType[] = restAPIs.map((api) => ({
      apiType: "rest",
      displayName: api.name,
      displaySub: api.endpoint,
      id: api.id_rest_api,
      method: api.method,
      deleteHandler: createDeleteHandler("rest", api.id_rest_api),
      originalAPI: api,
    }));

    const graphql: APIWithType[] = graphqlAPIs.map((api) => ({
      apiType: "graphql",
      displayName: api.name,
      displaySub: api.return_type,
      id: api.id_graphql_api,
      method: api.type,
      deleteHandler: createDeleteHandler("graphql", api.id_graphql_api),
      originalAPI: api,
    }));

    const grpc: APIWithType[] = grpcAPIs.map((api) => ({
      apiType: "grpc",
      displayName: `${api.service_name}.${api.method_name}`,
      displaySub: api.method_name,
      id: api.id_grpc_api,
      method: "GET",
      deleteHandler: createDeleteHandler("grpc", api.id_grpc_api),
      originalAPI: api,
    }));

    const all = [...rest, ...graphql, ...grpc];

    if (filter === "all") return all;
    return all.filter((api) => api.apiType === filter);
  }, [
    restAPIs,
    graphqlAPIs,
    grpcAPIs,
    filter,
    deleteRestAPI,
    deleteGraphQLAPI,
    deleteGrpcAPI,
    addToast,
  ]);

  const handleCreate = useCallback(
    (type: FilterType) => {
      navigate(`/projects/${id}/${type}/new`);
    },
    [id, navigate]
  );

  const handleEdit = useCallback(
    (api: APIWithType) => {
      if (api.apiType === "rest") {
        navigate(`/rest/${api.id}/edit`);
      } else if (api.apiType === "graphql") {
        navigate(`/graphql/${api.id}/edit`);
      } else {
        navigate(`/grpc/${api.id}/edit`);
      }
    },
    [navigate]
  );

  const getMethodForAPI = useCallback((api: APIWithType) => {
    return api.method || "GET";
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleCreate("rest")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> REST API
          </button>
          <button
            onClick={() => handleCreate("graphql")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={16} /> GraphQL
          </button>
          <button
            onClick={() => handleCreate("grpc")}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={16} /> gRPC
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "rest", "graphql", "grpc"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === f
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4">Loading APIs...</p>
        </div>
      ) : filteredAPIs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No APIs found. Create your first API!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAPIs.map((api) => (
            <div
              key={`${api.apiType}-${api.id}`}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEdit(api)}
            >
              <div className="flex items-center gap-4">
                <MethodBadge method={getMethodForAPI(api) as any} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{api.displayName}</h3>
                  <p className="text-sm text-gray-500 truncate font-mono">{api.displaySub}</p>
                </div>
                <span className="text-xs text-gray-400 capitalize px-2 py-1 bg-gray-100 rounded">
                  {api.apiType}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    api.deleteHandler();
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  aria-label="Delete API"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
