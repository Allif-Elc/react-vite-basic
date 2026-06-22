export { formatCode, type FormatResult } from "./codeFormatter";

/**
 * Backward-compatible alias for `formatCode`.
 * @deprecated Use `formatCode` instead — it auto-detects content type.
 */
export async function formatJSON(jsonString: string) {
  const { formatCode } = await import("./codeFormatter");
  return formatCode(jsonString);
}
