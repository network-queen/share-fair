import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  getCurrentUser,
  setUser,
  logout,
  setAuthError,
  clearError,
} from '../authSlice';
import type { User } from '../../../types';

vi.mock('../../../services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

import authService from '../../../services/authService';

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  neighborhood: 'Brooklyn',
  trustScore: 85,
  carbonSaved: 12.5,
  createdAt: '2025-01-15T10:00:00Z',
  verificationStatus: 'EMAIL_VERIFIED',
};

function createStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const store = createStore();
      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('reducers', () => {
    it('setUser sets user and isAuthenticated to true', () => {
      const store = createStore();

      store.dispatch(setUser(mockUser));
      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('setUser with null sets isAuthenticated to false', () => {
      const store = createStore();

      store.dispatch(setUser(mockUser));
      store.dispatch(setUser(null));
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('logout clears user and calls authService.logout', () => {
      const store = createStore();

      store.dispatch(setUser(mockUser));
      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(authService.logout).toHaveBeenCalled();
    });

    it('setAuthError sets the error message', () => {
      const store = createStore();

      store.dispatch(setAuthError('OAuth failed'));
      expect(store.getState().auth.error).toBe('OAuth failed');
    });

    it('clearError sets error to null', () => {
      const store = createStore();

      store.dispatch(setAuthError('some error'));
      store.dispatch(clearError());
      expect(store.getState().auth.error).toBeNull();
    });
  });

  describe('getCurrentUser thunk', () => {
    it('sets isLoading to true when pending', () => {
      const store = createStore();
      vi.mocked(authService.getCurrentUser).mockReturnValueOnce(new Promise(() => {}));

      store.dispatch(getCurrentUser());
      expect(store.getState().auth.isLoading).toBe(true);
      expect(store.getState().auth.error).toBeNull();
    });

    it('sets user and isAuthenticated on fulfilled', async () => {
      const store = createStore();
      vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(mockUser);

      await store.dispatch(getCurrentUser());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('sets error and isAuthenticated=false on rejected', async () => {
      const store = createStore();
      vi.mocked(authService.getCurrentUser).mockRejectedValueOnce(new Error('Unauthorized'));

      await store.dispatch(getCurrentUser());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Unauthorized');
      expect(state.isAuthenticated).toBe(false);
    });

    it('handles non-Error rejection with generic message', async () => {
      const store = createStore();
      vi.mocked(authService.getCurrentUser).mockRejectedValueOnce(42);

      await store.dispatch(getCurrentUser());
      expect(store.getState().auth.error).toBe('An unexpected error occurred');
    });
  });
});
