import { useAppDispatch, useAppSelector } from './redux';
import { setUser, logout, setAuthError, getCurrentUser } from '../store/slices/authSlice';
import authService from '../services/authService';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Initiate OAuth — opens system browser, handles callback, returns user
  const login = async (provider: 'google' | 'github') => {
    try {
      const response = await authService.initiateOAuthLogin(provider);
      if (response) {
        dispatch(setUser(response.user));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'OAuth authentication failed';
      dispatch(setAuthError(message));
    }
  };

  const handleLogout = async () => {
    dispatch(logout());
    await authService.logout();
  };

  const initAuth = async () => {
    const authenticated = await authService.isAuthenticated();
    if (authenticated && !auth.user) {
      dispatch(getCurrentUser());
    }
  };

  return {
    ...auth,
    login,
    logout: handleLogout,
    initAuth,
  };
};
