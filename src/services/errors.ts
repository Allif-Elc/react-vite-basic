/**
 * Custom API Error class that preserves HTTP status code
 * Used for proper error handling and 401 redirect logic
 */
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly isAuthError: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.isAuthError = statusCode === 401;
  }
}

/**
 * Check if error is an auth error (401)
 */
export const isAuthError = (error: unknown): error is APIError => {
  return error instanceof APIError && error.isAuthError;
};
