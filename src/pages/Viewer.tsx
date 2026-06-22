import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicAPIs } from "../services/apiService";
import { MethodBadge } from "../components/api/MethodBadge";
import { RESTViewer } from "../components/viewer/RESTViewer";
import { GraphQLViewer } from "../components/viewer/GraphQLViewer";
import { GRPCViewer } from "../components/viewer/GRPCViewer";

type APIType = "rest" | "graphql" | "grpc";

type PaginationState = {
  page: number;
  hasMore: boolean;
  total: number;
};

export default function Viewer() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    project: any;
    rest: { data: any[]; page: number; limit: number; total: number };
    graphql: { data: any[]; page: number; limit: number; total: number };
    grpc: { data: any[]; page: number; limit: number; total: number };
  } | null>(null);
  const [selectedType, setSelectedType] = useState<APIType>("rest");
  const [selectedAPI, setSelectedAPI] = useState<any>(null);
  const [pagination, setPagination] = useState<{
    rest: PaginationState;
    graphql: PaginationState;
    grpc: PaginationState;
  }>({
    rest: { page: 1, hasMore: false, total: 0 },
    graphql: { page: 1, hasMore: false, total: 0 },
    grpc: { page: 1, hasMore: false, total: 0 },
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Helper function to normalize API IDs
  const getAPIId = useCallback((api: any): string => {
    return String(api.id_rest_api || api.id_graphql_api || api.id_grpc_api || "");
  }, []);

  // Helper function to auto-select first available API
  const autoSelectAPI = useCallback((responseData: any) => {
    if (responseData.rest?.data?.[0]) {
      setSelectedAPI(responseData.rest.data[0]);
      setSelectedType("rest");
    } else if (responseData.graphql?.data?.[0]) {
      setSelectedAPI(responseData.graphql.data[0]);
      setSelectedType("graphql");
    } else if (responseData.grpc?.data?.[0]) {
      setSelectedAPI(responseData.grpc.data[0]);
      setSelectedType("grpc");
    }
  }, []);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      setError(null);
      fetchPublicAPIs(slug)
        .then((responseData) => {
          setData(responseData);
          setPagination({
            rest: {
              page: 1,
              hasMore: responseData.rest.data.length < responseData.rest.total,
              total: responseData.rest.total,
            },
            graphql: {
              page: 1,
              hasMore: responseData.graphql.data.length < responseData.graphql.total,
              total: responseData.graphql.total,
            },
            grpc: {
              page: 1,
              hasMore: responseData.grpc.data.length < responseData.grpc.total,
              total: responseData.grpc.total,
            },
          });
          autoSelectAPI(responseData);
        })
        .catch(() => setError("Failed to load documentation"))
        .finally(() => setLoading(false));
    }
  }, [slug, autoSelectAPI]);

  const apiList = useMemo(() => {
    if (!data) return [];
    return data[selectedType]?.data || [];
  }, [data, selectedType]);

  const handleAPISelect = useCallback((api: any) => {
    setSelectedAPI(api);
  }, []);

  const loadMoreAPIs = useCallback(async () => {
    if (!data || !slug || loadingMore) return;
    const currentPagination = pagination[selectedType];
    if (!currentPagination.hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPagination.page + 1;
      const response = await fetchPublicAPIs(slug, nextPage, 20);
      setData(prev => ({
        ...prev!,
        [selectedType]: {
          ...response[selectedType],
          data: [...prev![selectedType].data, ...response[selectedType].data],
        },
      }));
      setPagination(prev => ({
        ...prev!,
        [selectedType]: {
          page: nextPage,
          hasMore: response[selectedType].data.length < response[selectedType].total,
          total: response[selectedType].total,
        },
      }));
    } catch (error) {
      console.error("Failed to load more APIs:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [data, slug, selectedType, loadingMore, pagination]);

  const handleTabClick = useCallback((type: APIType) => {
    setSelectedType(type);
    if (data && data[type]?.data?.[0]) {
      const firstAPI = data[type].data[0];
      const currentAPIId = getAPIId(selectedAPI);
      const firstAPIId = getAPIId(firstAPI);

      // Only auto-select if switching to a different type or if current selection doesn't belong to new type
      if (type !== selectedType || currentAPIId !== firstAPIId) {
        setSelectedAPI(firstAPI);
      }
    } else if (data && data[type]?.data?.length === 0) {
      setSelectedAPI(null);
    }
  }, [data, selectedType, getAPIId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">{"\u274C"}</div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Documentation Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="font-bold text-lg text-foreground">
            {data.project?.name || "API Documentation"}
          </h1>
          {data.project?.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{data.project.description}</p>
          )}
        </div>

        <div className="flex border-b border-border">
          {(["rest", "graphql", "grpc"] as APIType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleTabClick(type)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                selectedType === type
                  ? "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {apiList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No {selectedType} APIs</div>
          ) : (
            <div className="space-y-1">
              {apiList.map((api) => {
                const id = getAPIId(api);
                const name = api.name || `${api.service_name}.${api.method_name}`;
                const sub = api.endpoint || api.return_type || api.method_name;
                const method = api.method || api.type || "GET";
                const isSelected = getAPIId(selectedAPI) === id;

                return (
                  <button
                    key={id}
                    onClick={() => handleAPISelect(api)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MethodBadge method={method as any} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate text-sm">{name}</div>
                        <div className="text-xs text-muted-foreground truncate font-mono">{sub}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {apiList.length > 0 && pagination[selectedType].hasMore && (
            <button
              onClick={loadMoreAPIs}
              disabled={loadingMore}
              className="w-full mt-2 py-2 px-4 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {selectedAPI ? (
          <div className="max-w-4xl mx-auto p-8">
            {selectedType === "rest" && <RESTViewer api={selectedAPI} />}
            {selectedType === "graphql" && <GraphQLViewer api={selectedAPI} />}
            {selectedType === "grpc" && <GRPCViewer api={selectedAPI} />}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg font-medium">Select an API to view documentation</p>
              <p className="text-sm mt-1">Choose an API from sidebar</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
