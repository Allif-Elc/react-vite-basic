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
        <h1 className="text-2xl font-bold text-gray-900">
          {api.service_name}.{api.method_name}
        </h1>
      </div>

      {/* Description */}
      {api.description && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
            Description
          </h2>
          <p className="text-gray-700">{api.description}</p>
        </div>
      )}

      {/* Request Message */}
      {requestMessage.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Request Message
          </h2>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Field</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Label</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {requestMessage.map((field, i) => (
                  <tr key={i} className="border-t border-gray-200">
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
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {field.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{field.description || "-"}</td>
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
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Response Message
          </h2>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Field</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Label</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {responseMessage.map((field, i) => (
                  <tr key={i} className="border-t border-gray-200">
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
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {field.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{field.description || "-"}</td>
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
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Proto Definition
          </h2>
          <CodeBlock code={api.proto_definition} language="protobuf" title=".proto" />
        </div>
      )}

      {/* Examples */}
      {examples.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Code Examples
          </h2>
          <div className="space-y-4">
            {examples.map((example, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                  <div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                      {example.language}
                    </span>
                    <span className="ml-3 font-medium text-gray-900">
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
