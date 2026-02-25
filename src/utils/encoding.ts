import { logger } from "./logger";

/**
 * Safely decode a base64 string and parse as JSON
 * @param base64String - Base64 encoded JSON string, or already decoded data
 * @returns Parsed data or null if invalid
 */
export function decodeBase64JSON<T>(base64String: T | string | null | undefined): T | null {
  if (!base64String) return null;

  // If already an object/array, return as-is
  if (typeof base64String !== "string") return base64String as T;

  try {
    // Handle base64url format (replace - with +, _ with /)
    const base64 = base64String.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as T;
  } catch {
    logger.error("[encoding] Failed to decode base64 JSON", { length: base64String.length });
    return null;
  }
}
