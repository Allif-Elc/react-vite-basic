import { memo } from "react";
import { MethodBadge } from "../api/MethodBadge";
import { CodeBlock } from "./CodeBlock";
import type { GraphQLAPI } from "../../types/api";

interface GraphQLViewerProps {
  api: GraphQLAPI;
}

export const GraphQLViewer = memo<GraphQLViewerProps>(({ api }) => {
  const args = Array.isArray(api.arguments) ? api.arguments : [];
  const examples = Array.isArray(api.examples) ? api.examples : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b">
        <MethodBadge method={api.type} size="md" />
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

      {/* Return Type */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Return Type
        </h2>
        <code className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-mono">
          {api.return_type}
        </code>
      </div>

      {/* Arguments */}
      {args.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Arguments
          </h2>
          <div className="bg-muted rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Required</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Default</th>
                </tr>
              </thead>
              <tbody>
                {args.map((arg, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-2 font-mono">{arg.name}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {arg.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {arg.required ? (
                        <span className="text-red-600">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{arg.description || "-"}</td>
                    <td className="px-4 py-2 font-mono text-muted-foreground">
                      {arg.default_value !== undefined ? String(arg.default_value) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Examples */}
      {examples.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Examples
          </h2>
          <div className="space-y-4">
            {examples.map((example, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-muted border-b">
                  <h3 className="font-medium text-foreground">{String(example.name)}</h3>
                  {example.description && (
                    <p className="text-sm text-muted-foreground mt-1">{String(example.description)}</p>
                  )}
                </div>
                <div className="p-4">
                  <CodeBlock code={example.query} language="graphql" title="Query" />
                  {example.variables !== undefined && (
                    <div className="mt-4">
                      <CodeBlock
                        code={JSON.stringify(example.variables as Record<string, unknown>, null, 2)}
                        language="json"
                        title="Variables"
                      />
                    </div>
                  )}
                  {example.response !== undefined && (
                    <div className="mt-4">
                      <CodeBlock
                        code={JSON.stringify(example.response as Record<string, unknown>, null, 2)}
                        language="json"
                        title="Response"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

GraphQLViewer.displayName = "GraphQLViewer";
