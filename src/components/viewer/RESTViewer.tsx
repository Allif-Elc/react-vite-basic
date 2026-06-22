import { memo } from "react";
import { MethodBadge } from "../api/MethodBadge";
import { CodeBlock } from "./CodeBlock";
import type { RestAPI } from "../../types/api";

interface RESTViewerProps {
  api: RestAPI;
}

export const RESTViewer = memo<RESTViewerProps>(({ api }) => {
  const headers = Array.isArray(api.headers) ? api.headers : [];
  const pathParams = Array.isArray(api.path_params) ? api.path_params : [];
  const queryParams = Array.isArray(api.query_params) ? api.query_params : [];
  const responses = api.responses || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b">
        <MethodBadge method={api.method} size="md" />
        <h1 className="text-2xl font-bold text-foreground">{api.name}</h1>
      </div>

      {/* Description */}
      {api.description && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Description
          </h2>
          <p className="text-muted-foreground">{api.description}</p>
        </div>
      )}

      {/* Endpoint */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Endpoint</h2>
        <code className="px-3 py-2 bg-muted rounded-lg text-sm font-mono text-foreground">
          {api.endpoint}
        </code>
      </div>

      {/* Headers */}
      {headers.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Headers
          </h2>
          <div className="bg-muted rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Example</th>
                </tr>
              </thead>
              <tbody>
                {headers.map((header, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2 font-mono">{header.name}</td>
                    <td className="px-4 py-2">
                      {header.required ? (
                        <span className="text-red-600">Required</span>
                      ) : (
                        <span className="text-muted-foreground">Optional</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{header.description || "-"}</td>
                    <td className="px-4 py-2 font-mono text-muted-foreground">{header.example || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Path Parameters */}
      {pathParams.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Path Parameters
          </h2>
          <div className="bg-muted rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Required</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {pathParams.map((param, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2 font-mono">{param.name}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {param.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {param.required ? (
                        <span className="text-red-600">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{param.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Query Parameters */}
      {queryParams.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Query Parameters
          </h2>
          <div className="bg-muted rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Required</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {queryParams.map((param, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2 font-mono">{param.name}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                        {param.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {param.required ? (
                        <span className="text-red-600">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{param.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Body */}
      {api.request_body && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Request Body
          </h2>
          <CodeBlock
            code={JSON.stringify(api.request_body, null, 2)}
            language="json"
            title="JSON Schema"
          />
        </div>
      )}

      {/* Responses */}
      {Object.keys(responses).length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Responses
          </h2>
          <div className="space-y-4">
            {Object.entries(responses).map(([statusCode, response]: [string, any]) => (
              <div key={statusCode} className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-muted border-b">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      parseInt(statusCode) < 300
                        ? "bg-green-100 text-green-700"
                        : parseInt(statusCode) < 400
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {statusCode}
                  </span>
                  <span className="text-muted-foreground">{response?.description || ""}</span>
                </div>
                {response?.body && (
                  <CodeBlock
                    code={
                      typeof response.body === "string"
                        ? response.body
                        : JSON.stringify(response.body, null, 2)
                    }
                    language="json"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

RESTViewer.displayName = "RESTViewer";
