import { memo } from "react";
import { clsx } from "clsx";

interface MethodBadgeProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "query" | "mutation" | "subscription";
  size?: "sm" | "md";
}

const METHOD_COLORS = {
  GET: "bg-emerald-100 text-emerald-700 border-emerald-200",
  POST: "bg-blue-100 text-blue-700 border-blue-200",
  PUT: "bg-amber-100 text-amber-700 border-amber-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  PATCH: "bg-purple-100 text-purple-700 border-purple-200",
  query: "bg-emerald-100 text-emerald-700 border-emerald-200",
  mutation: "bg-blue-100 text-blue-700 border-blue-200",
  subscription: "bg-purple-100 text-purple-700 border-purple-200",
};

export const MethodBadge = memo<MethodBadgeProps>(({ method, size = "md" }) => {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs font-medium" : "px-3 py-1 text-sm font-medium";

  return (
    <span className={clsx("inline-block rounded border", sizeClasses, METHOD_COLORS[method])}>
      {method}
    </span>
  );
});

MethodBadge.displayName = "MethodBadge";
