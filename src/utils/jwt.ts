export interface JwtPayload {
  user_id: number;
  email: string;
  exp: number;
  iat: number;
  nbf: number;
}

export interface User {
  id_user: number;
  email: string;
  name?: string;
}

/**
 * Decode JWT payload without verification (client-side only)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Base64url decode the payload (second part)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extract user info from JWT token
 * @param token - JWT token string
 * @returns User object with id_user and email, or null if invalid
 */
import { logger } from "./logger";

export function getUserFromToken(token: string): User | null {
  try {
    const payload = decodeJWT(token);
    if (!payload) {
      logger.error("[JWT] Failed to decode token");
      return null;
    }

    // Handle both user_id and id_user from JWT
    const userId = (payload as any).user_id || (payload as any).id_user;

    if (!userId || !payload.email) {
      logger.error("[JWT] Missing required fields", { userId });
      return null;
    }

    const user = {
      id_user: userId,
      email: payload.email,
    };
    return user;
  } catch (error) {
    logger.error("[JWT] Failed to decode token", error);
    return null;
  }
}
