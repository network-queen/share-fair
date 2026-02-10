import api from './api';
import type { User } from '../types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface OAuthCallbackParams {
  code: string;
  state: string;
  provider: 'google' | 'facebook' | 'github';
}

class AuthService {
  // OAuth Login - Redirect to provider
  initiateOAuthLogin(provider: 'google' | 'facebook' | 'github') {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const stateArray = new Uint8Array(24);
    crypto.getRandomValues(stateArray);
    const state = Array.from(stateArray, (b) => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(`oauth_state_${provider}`, state);

    const authUrls: Record<string, string> = {
      google: `${import.meta.env.VITE_API_BASE_URL}/auth/oauth/google?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
      facebook: `${import.meta.env.VITE_API_BASE_URL}/auth/oauth/facebook?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
      github: `${import.meta.env.VITE_API_BASE_URL}/auth/oauth/github?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
    };

    window.location.href = authUrls[provider];
  }

  // Handle OAuth callback
  async handleOAuthCallback(params: OAuthCallbackParams): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/oauth/callback', params);
    if (response.data.accessToken) {
      api.setAuthToken(response.data.accessToken);
    }
    return response.data;
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  // Logout
  logout(): void {
    api.clearAuthToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();
