import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { logger } from "../utils/logger";
import { APIError } from "./errors";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    logger.api(config.method?.toUpperCase() || "GET", config.url!, config.data);

    const token = localStorage.getItem("auth-storage");
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch {
        // Ignore parse errors
      }
    }

    return config;
  },
  (error: AxiosError) => {
    logger.error("Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.apiResponse(
      response.config.method?.toUpperCase() || "GET",
      response.config.url || "",
      response.data
    );
    return response;
  },
  (error: AxiosError) => {
    const statusCode = error.response?.status || 0;
    logger.apiError(
      error.config?.method?.toUpperCase() || "GET",
      error.config?.url || "",
      error.response?.data || error.message
    );

    // Handle 401 Unauthorized - redirect to unauthorized page
    // Prevent infinite loops by checking current path
    if (statusCode === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/unauthorized" && currentPath !== "/login") {
        window.location.href = "/unauthorized";
      }
      // Throw custom APIError for proper handling in stores/components
      throw new APIError("Unauthorized", 401);
    }

    return Promise.reject(error);
  }
);

export default api;
