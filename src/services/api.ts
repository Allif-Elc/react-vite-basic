import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003',
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    logger.api(config.method?.toUpperCase() || 'GET', config.url!, config.data);

    const token = localStorage.getItem('auth-storage');
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
    logger.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.apiResponse(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      response.data
    );
    return response;
  },
  (error: AxiosError) => {
    logger.apiError(
      error.config?.method?.toUpperCase() || 'GET',
      error.config?.url || '',
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default api;
