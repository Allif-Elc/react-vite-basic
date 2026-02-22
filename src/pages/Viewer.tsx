import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicAPIs } from '../services/apiService';
import { MethodBadge } from '../components/api/MethodBadge';
import { RESTViewer } from '../components/viewer/RESTViewer';
import { GraphQLViewer } from '../components/viewer/GraphQLViewer';
import { GRPCViewer } from '../components/viewer/GRPCViewer';

type APIType = 'rest' | 'graphql' | 'grpc';

export default function Viewer() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    project: any;
    rest: any[];
    graphql: any[];
    grpc: any[];
  } | null>(null);
  const [selectedType, setSelectedType] = useState<APIType>('rest');
  const [selectedAPI, setSelectedAPI] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      setError(null);
      fetchPublicAPIs(slug)
        .then(setData)
        .catch(() => setError('Failed to load documentation'))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const apiList = useMemo(() => {
    if (!data) return [];
    return data[selectedType] || [];
  }, [data, selectedType]);

  const handleAPISelect = useCallback((api: any) => {
    setSelectedAPI(api);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">{'\u274C'}</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Documentation Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="font-bold text-lg text-gray-900">{data.project?.name || 'API Documentation'}</h1>
          {data.project?.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{data.project.description}</p>
          )}
        </div>

        <div className="flex border-b border-gray-200">
          {(['rest', 'graphql', 'grpc'] as APIType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setSelectedAPI(null);
              }}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                selectedType === type
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {apiList.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No {selectedType} APIs
            </div>
          ) : (
            <div className="space-y-1">
              {apiList.map((api) => {
                const id = api.id_rest_api || api.id_graphql_api || api.id_grpc_api;
                const name = api.name || `${api.service_name}.${api.method_name}`;
                const sub = api.endpoint || api.return_type || api.method_name;
                const method = api.method || api.type || 'GET';

                return (
                  <button
                    key={id}
                    onClick={() => handleAPISelect(api)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedAPI?.id === id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MethodBadge method={method as any} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate text-sm">{name}</div>
                        <div className="text-xs text-gray-500 truncate font-mono">{sub}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {selectedAPI ? (
          <div className="max-w-4xl mx-auto p-8">
            {selectedType === 'rest' && <RESTViewer api={selectedAPI} />}
            {selectedType === 'graphql' && <GraphQLViewer api={selectedAPI} />}
            {selectedType === 'grpc' && <GRPCViewer api={selectedAPI} />}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">Select an API to view documentation</p>
              <p className="text-sm mt-1">Choose an API from the sidebar</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
