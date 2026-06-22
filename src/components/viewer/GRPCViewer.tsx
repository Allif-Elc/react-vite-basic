import { memo } from "react";
import { CodeBlock } from "./CodeBlock";
import type { GrpcAPI } from "../../types/api";

interface GRPCViewerProps {
  api: GrpcAPI;
}

export const GRPCViewer = memo<GRPCViewerProps>(({ api }) => {
  const requestMessage = Array.isArray(api.request_message) ? api.request_message : [];
  const responseMessage = Array.isArray(api.response_message) ? api.response_message : [];
  const examples = Array.isArray(api.examples) ? api.examples : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b">
        <h1 className="text-2xl font-bold text-foreground">
          {api.service_name}.{api.method_name}
        </h1>
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

      {/* Request Message */}
      {requestMessage.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Request Message
          </h2>
          <div className="bg-muted rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Field</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Label</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {requestMessage.map((field, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2 font-mono">{field.name}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        {field.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {field.label && (
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            field.label === "required"
                              ? "bg-red-100 text-red-700"
                              : field.label === "repeated"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {field.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{field.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Response Message */}
      {responseMessage.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Response Message
          </h2>
          <div className="bg-muted rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Field</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Label</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {responseMessage.map((field, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2 font-mono">{field.name}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        {field.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {field.label && (
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            field.label === "required"
                              ? "bg-red-100 text-red-700"
                              : field.label === "repeated"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {field.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{field.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proto Definition */}
      {api.proto_definition && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Proto Definition
          </h2>
          <CodeBlock code={api.proto_definition} language="protobuf" title=".proto" />
        </div>
      )}

      {/* Examples */}
      {examples.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Code Examples
          </h2>
          <div className="space-y-4">
            {examples.map((example, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-muted border-b flex items-center justify-between">
                  <div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                      {example.language}
                    </span>
                    <span className="ml-3 font-medium text-foreground">
                      {example.description || "Example"}
                    </span>
                  </div>
                </div>
                <CodeBlock
                  code={example.code}
                  language={example.language.toLowerCase() || "javascript"}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

GRPCViewer.displayName = "GRPCViewer";
