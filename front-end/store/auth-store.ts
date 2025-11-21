import { create } from 'zustand';
import { authService, getTokenExpiryTimestamp } from '@/services/auth';

interface AuthState {
  user: any | null;
  accessTokenValue: string | null;
  refreshTokenValue: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiringSoon: boolean;
  signup: (email: string, password: string, full_name?: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkTokenExpiration: () => Promise<void>;
  clearError: () => void;
  setTokenExpiringSoon: (expiring: boolean) => void;
}

// Module-level variable to prevent concurrent refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessTokenValue: null,
  refreshTokenValue: null,
  expiresAt: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokenExpiringSoon: false,

  signup: async (email: string, password: string, full_name?: string, phone?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.signup({ email, password, full_name, phone });
      const accessToken = response.access_token || response.session?.access_token || null;
      const refreshToken = response.refresh_token || response.session?.refresh_token || null;
      const expiresAt = getTokenExpiryTimestamp(accessToken);
      set({
        user: response.user,
        accessTokenValue: accessToken,
        refreshTokenValue: refreshToken,
        expiresAt,
        isAuthenticated: !!response.access_token || !!response.session?.access_token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Signup failed',
        isLoading: false,
        isAuthenticated: false,
        accessTokenValue: null,
        refreshTokenValue: null,
        expiresAt: null,
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    console.log("login", email, password);
    set({ isLoading: true, error: null });
    console.log("login try");
    try {
      const response = await authService.login({ email, password });
      console.log("response from auth service", response);
      const accessToken = response.access_token || response.session?.access_token || null;
      const refreshToken = response.refresh_token || response.session?.refresh_token || null;
      const expiresAt = getTokenExpiryTimestamp(accessToken);
      set({
        user: response.user,
        accessTokenValue: accessToken,
        refreshTokenValue: refreshToken,
        expiresAt,
        isAuthenticated: !!response.access_token || !!response.session?.access_token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
        isAuthenticated: false,
        accessTokenValue: null,
        refreshTokenValue: null,
        expiresAt: null,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        accessTokenValue: null,
        refreshTokenValue: null,
        expiresAt: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Logout failed',
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const isAuth = await authService.isAuthenticated();
      const user = await authService.getUser();
      const accessToken = await authService.getAccessToken();
      const refreshToken = await authService.getRefreshToken();
      const expiresAt = getTokenExpiryTimestamp(accessToken);
      set({
        isAuthenticated: isAuth,
        user,
        accessTokenValue: accessToken,
        refreshTokenValue: refreshToken,
        expiresAt,
        isLoading: false,
      });
      // Check token expiration after auth check
      if (isAuth) {
        await useAuthStore.getState().checkTokenExpiration();
      }
    } catch {
      set({
        isAuthenticated: false,
        user: null,
        accessTokenValue: null,
        refreshTokenValue: null,
        expiresAt: null,
        isLoading: false,
      });
    }
  },

  refreshToken: async () => {
    // If already refreshing, wait for the existing promise
    if (isRefreshing && refreshPromise) {
      console.log('Refresh already in progress, waiting...');
      return refreshPromise;
    }

    // Start new refresh attempt
    isRefreshing = true;
    refreshPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.refreshToken();
        console.log("response from auth refresh", response);
        
        if (response) {
          // Store the new tokens and user data in AsyncStorage (already done in authService.refreshToken)
          // Update the auth store state with the new response
          const accessToken = response.access_token || response.session?.access_token || null;
          const refreshToken = response.refresh_token || response.session?.refresh_token || null;
          const expiresAt = getTokenExpiryTimestamp(accessToken);
          set({
            user: response.user,
            accessTokenValue: accessToken,
            refreshTokenValue: refreshToken,
            expiresAt,
            isAuthenticated: !!response.access_token || !!response.session?.access_token,
            tokenExpiringSoon: false,
            isLoading: false,
          });
          // Re-check token expiration to restart monitoring with new token
          await useAuthStore.getState().checkTokenExpiration();
        } else {
          throw new Error('No response from refresh token');
        }
      } catch (error: any) {
        console.error('Token refresh failed in store:', error);
        set({
          error: error.message || 'Token refresh failed',
          isLoading: false,
          isAuthenticated: false,
          user: null,
          accessTokenValue: null,
          refreshTokenValue: null,
          expiresAt: null,
          tokenExpiringSoon: false,
        });
        throw error;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  checkTokenExpiration: async () => {
    try {
      const { isExpired, isExpiringSoon } = await authService.checkTokenExpiration();
      
      // Set tokenExpiringSoon state so the alert hook can show the alert
      // Don't auto-refresh - let the user decide via the alert
      if (isExpired || isExpiringSoon) {
        set({ tokenExpiringSoon: true });
      } else {
        set({ tokenExpiringSoon: false });
      }
    } catch (err) {
      console.error('Error checking token expiration:', err);
    }
  },

  setTokenExpiringSoon: (expiring: boolean) => set({ tokenExpiringSoon: expiring }),

  clearError: () => set({ error: null }),
}));

