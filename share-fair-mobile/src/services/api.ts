import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { secureGet, secureSet, secureDel } from '../utils/storage';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://localhost/api/v1';

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

    // Request interceptor — inject auth token from SecureStore
    this.axiosInstance.interceptors.request.use(async (config) => {
      const token = await secureGet('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor — unwrap ApiResponse, handle 401 with token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          response.data = response.data.data;
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableConfig | undefined;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/')
        ) {
          originalRequest._retry = true;

          const refreshToken = await secureGet('refreshToken');
          if (refreshToken) {
            try {
              const refreshResponse = await this.axiosInstance.post('/auth/refresh', {
                refreshToken,
              });
              const newAccessToken = refreshResponse.data?.accessToken;

              if (newAccessToken) {
                await secureSet('accessToken', newAccessToken);
                this.axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return this.axiosInstance(originalRequest);
              }
            } catch {
              // Refresh failed — fall through to clear tokens
            }
          }

          await secureDel('accessToken');
          await secureDel('refreshToken');
          delete this.axiosInstance.defaults.headers.Authorization;
        }

        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, config?: object) {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T>(url: string, data?: unknown, config?: object) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  put<T>(url: string, data?: unknown, config?: object) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: unknown, config?: object) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: object) {
    return this.axiosInstance.delete<T>(url, config);
  }

  async setAuthToken(token: string) {
    await secureSet('accessToken', token);
    this.axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
  }

  async clearAuthToken() {
    await secureDel('accessToken');
    delete this.axiosInstance.defaults.headers.Authorization;
  }
}

export default new ApiService();
