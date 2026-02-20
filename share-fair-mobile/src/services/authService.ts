import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import api from './api';
import { secureGet, secureSet, secureDel } from '../utils/storage';
import type { User } from '../types';

WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://localhost/api/v1';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface OAuthCallbackParams {
  code: string;
  provider: 'google' | 'github';
  redirectUri: string;
}

class AuthService {
  // OAuth Login via expo-web-browser (opens system browser)
  async initiateOAuthLogin(provider: 'google' | 'github'): Promise<LoginResponse | null> {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'sharefair' });

    // Build the authorization URL pointing to our backend
    const authUrl = `${API_BASE_URL}/auth/oauth/${provider}?redirect_uri=${encodeURIComponent(redirectUri)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== 'success') {
      return null;
    }

    // Parse code from callback URL: sharefair://auth/callback?code=...&provider=...
    const url = new URL(result.url);
    const code = url.searchParams.get('code');

    if (!code) {
      throw new Error('No authorization code received');
    }

    return this.handleOAuthCallback({ code, provider, redirectUri });
  }

  // Exchange code for tokens
  async handleOAuthCallback(params: OAuthCallbackParams): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/oauth/callback', {
      code: params.code,
      provider: params.provider,
      redirectUri: params.redirectUri,
    });
    const data = response.data;
    if (data.accessToken) {
      await api.setAuthToken(data.accessToken);
      await secureSet('refreshToken', data.refreshToken);
    }
    return data;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await secureGet('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await api.post<LoginResponse>('/auth/refresh', { refreshToken });
      const data = response.data;
      if (data.accessToken) {
        await api.setAuthToken(data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch {
      await this.logout();
      return null;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }

  // Logout
  async logout(): Promise<void> {
    await api.clearAuthToken();
    await secureDel('refreshToken');
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await secureGet('accessToken');
    return !!token;
  }
}

export default new AuthService();
