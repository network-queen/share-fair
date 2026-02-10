import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling and unwrapping ApiResponse
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Unwrap ApiResponse wrapper
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          response.data = response.data.data;
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableConfig | undefined;

        // Attempt token refresh on 401, but not for auth endpoints or already-retried requests
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/')
        ) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await this.axiosInstance.post('/auth/refresh', { refreshToken });
              const newAccessToken = refreshResponse.data?.accessToken;

              if (newAccessToken) {
                localStorage.setItem('accessToken', newAccessToken);
                this.axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return this.axiosInstance(originalRequest);
              }
            } catch {
              // Refresh failed — fall through to clear tokens
            }
          }

          // No refresh token or refresh failed
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          delete this.axiosInstance.defaults.headers.Authorization;
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: any) {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.axiosInstance.delete<T>(url, config);
  }

  setAuthToken(token: string) {
    localStorage.setItem('accessToken', token);
    this.axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    localStorage.removeItem('accessToken');
    delete this.axiosInstance.defaults.headers.Authorization;
  }
}

export default new ApiService();
