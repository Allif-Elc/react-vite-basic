export interface JwtPayload {
	user_id: number;
	email: string;
	exp: number;
	iat: number;
	nbf: number;
}

export interface User {
	id: number;
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
		const parts = token.split('.');
		if (parts.length !== 3) {
			return null;
		}

		// Base64url decode the payload (second part)
		const payload = parts[1];
		const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
		const decoded = atob(padded);
		return JSON.parse(decoded) as JwtPayload;
	} catch {
		return null;
	}
}

/**
 * Extract user info from JWT token
 * @param token - JWT token string
 * @returns User object with id and email, or null if invalid
 */
export function getUserFromToken(token: string): User | null {
	const payload = decodeJWT(token);
	if (!payload) {
		return null;
	}

	return {
		id: payload.user_id,
		email: payload.email,
	};
}
