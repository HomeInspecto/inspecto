import { create } from 'zustand';
import { authService } from '@/services/auth';

interface AuthState {
  user: any | null;
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokenExpiringSoon: false,

  signup: async (email: string, password: string, full_name?: string, phone?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.signup({ email, password, full_name, phone });
      set({
        user: response.user,
        isAuthenticated: !!response.access_token || !!response.session?.access_token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Signup failed',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      set({
        user: response.user,
        isAuthenticated: !!response.access_token || !!response.session?.access_token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
        isAuthenticated: false,
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
      set({
        isAuthenticated: isAuth,
        user,
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
        isLoading: false,
      });
    }
  },

  refreshToken: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.refreshToken();
      if (response) {
        set({
          user: response.user,
          isAuthenticated: true,
          tokenExpiringSoon: false,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Token refresh failed',
        isLoading: false,
        isAuthenticated: false,
        user: null,
        tokenExpiringSoon: false,
      });
      throw error;
    }
  },

  checkTokenExpiration: async () => {
    try {
      const { isExpired, isExpiringSoon } = await authService.checkTokenExpiration();
      
      if (isExpired) {
        // Token is expired, try to refresh
        try {
          await useAuthStore.getState().refreshToken();
        } catch {
          // Refresh failed, user needs to login again
          set({
            isAuthenticated: false,
            user: null,
            tokenExpiringSoon: false,
          });
        }
      } else {
        set({ tokenExpiringSoon: isExpiringSoon });
      }
    } catch (err) {
      console.error('Error checking token expiration:', err);
    }
  },

  setTokenExpiringSoon: (expiring: boolean) => set({ tokenExpiringSoon: expiring }),

  clearError: () => set({ error: null }),
}));

