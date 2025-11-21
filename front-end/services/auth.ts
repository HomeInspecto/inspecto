import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const AUTH_TOKEN_KEY = '@auth_token';
const AUTH_REFRESH_TOKEN_KEY = '@auth_refresh_token';
const AUTH_USER_KEY = '@auth_user';

export interface SignupRequest {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    created_at: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
  };
  access_token?: string;
  refresh_token?: string;
  message?: string;
}

export const authService = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/signup', data);

    if (response.session?.access_token) {
      await this.storeAuth(response);
    }

    return response;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data);

    if (response.access_token) {
      await this.storeAuth(response);
    }

    return response;
  },

  async logout(): Promise<void> {
    const token = await this.getAccessToken();

    if (token) {
      try {
        await api.post(
          '/api/auth/logout',
          {},
          {
            Authorization: `Bearer ${token}`,
          }
        );
      } catch (error) {
        // Continue with clearing local storage even if API call fails
        console.error('Logout API call failed:', error);
      }
    }

    await this.clearAuth();
  },

  async storeAuth(response: AuthResponse): Promise<void> {
    const token = response.access_token || response.session?.access_token;
    const refreshToken = response.refresh_token || response.session?.refresh_token;

    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    if (refreshToken) {
      await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
    }
    if (response.user) {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }
  },

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
  },

  async getUser(): Promise<any | null> {
    const userStr = await AsyncStorage.getItem(AUTH_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY, AUTH_USER_KEY]);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  },

  async authHeaders() {
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  },
};
