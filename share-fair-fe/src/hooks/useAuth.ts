import { useAppDispatch, useAppSelector } from './redux';
import { setUser, logout, setAuthError, getCurrentUser } from '../store/slices/authSlice';
import authService from '../services/authService';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const login = async (provider: 'google' | 'facebook' | 'github') => {
    authService.initiateOAuthLogin(provider);
  };

  const handleOAuthCallback = async (code: string, provider: string) => {
    try {
      const response = await authService.handleOAuthCallback({
        code,
        provider: provider as 'google' | 'facebook' | 'github',
      });
      dispatch(setUser(response.user));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OAuth authentication failed';
      dispatch(setAuthError(message));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    authService.logout();
  };

  const initAuth = async () => {
    if (authService.isAuthenticated() && !auth.user) {
      dispatch(getCurrentUser());
    }
  };

  return {
    ...auth,
    login,
    handleOAuthCallback,
    logout: handleLogout,
    initAuth,
  };
};
