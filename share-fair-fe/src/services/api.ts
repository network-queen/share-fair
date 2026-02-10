import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

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
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic GET method
  get<T>(url: string, config?: any) {
    return this.axiosInstance.get<T>(url, config);
  }

  // Generic POST method
  post<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  // Generic PUT method
  put<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  // Generic PATCH method
  patch<T>(url: string, data?: any, config?: any) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  // Generic DELETE method
  delete<T>(url: string, config?: any) {
    return this.axiosInstance.delete<T>(url, config);
  }

  // Set auth token
  setAuthToken(token: string) {
    localStorage.setItem('accessToken', token);
    this.axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
  }

  // Clear auth token
  clearAuthToken() {
    localStorage.removeItem('accessToken');
    delete this.axiosInstance.defaults.headers.Authorization;
  }
}

export default new ApiService();
