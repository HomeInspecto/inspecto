import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const AUTH_TOKEN_KEY = '@auth_token';
const AUTH_REFRESH_TOKEN_KEY = '@auth_refresh_token';
const AUTH_USER_KEY = '@auth_user';
const TOKEN_EXPIRY_WARNING_TIME = 5 * 1000; // 5 minutes in milliseconds

/**
 * Decode JWT token to get expiration time
 */
function decodeJWT(token: string): { exp?: number; [key: string]: any } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired or about to expire
 */
export function isTokenExpiringSoon(token: string | null, warningTimeMs: number = TOKEN_EXPIRY_WARNING_TIME): boolean {
  if (!token) return false;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return false;
  
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const timeUntilExpiry = expirationTime - currentTime;
  
  return timeUntilExpiry > 0 && timeUntilExpiry <= warningTimeMs;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  return Date.now() >= expirationTime;
}

/**
 * Get time until token expires in milliseconds
 */
export function getTimeUntilExpiry(token: string | null): number | null {
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;
  
  const expirationTime = decoded.exp * 1000;
  const timeUntilExpiry = expirationTime - Date.now();
  return timeUntilExpiry > 0 ? timeUntilExpiry : 0;
}

/**
 * Get the absolute expiration timestamp (ms) from a token
 */
export function getTokenExpiryTimestamp(token: string | null): number | null {
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;
  
  return decoded.exp * 1000;
}

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
    console.log("login data", data);
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    console.log("response", response);

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

    console.log('Storing auth tokens:', {
      hasAccessToken: !!token,
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length || 0,
    });

    if (token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      console.log('Access token stored');
    }
    if (refreshToken) {
      await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
      console.log('Refresh token stored:', refreshToken.substring(0, 10) + '...');
      
      // Verify it was stored correctly
      const storedRefreshToken = await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
      if (storedRefreshToken !== refreshToken) {
        console.error('Refresh token storage mismatch!', {
          expected: refreshToken.substring(0, 10),
          stored: storedRefreshToken?.substring(0, 10),
        });
      } else {
        console.log('Refresh token verified in storage');
      }
    }
    if (response.user) {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }
  },

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    const token = await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
    if (token) {
      console.log('Retrieved refresh token from storage:', token.substring(0, 10) + '...');
    } else {
      console.warn('No refresh token found in storage');
    }
    return token;
  },

  async getUser(): Promise<any | null> {
    const userStr = await AsyncStorage.getItem(AUTH_USER_KEY);
    console.log("userStr", userStr);
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

  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(): Promise<AuthResponse | null> {
    const currentRefreshToken = await this.getRefreshToken();
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('Starting token refresh with token:', currentRefreshToken.substring(0, 10) + '...');

    try {
      const response = await api.post<AuthResponse>('/api/auth/refresh', {
        refresh_token: currentRefreshToken,
      });

      console.log('Refresh API response received:', {
        hasAccessToken: !!response.access_token,
        hasSessionAccessToken: !!response.session?.access_token,
        hasRefreshToken: !!response.refresh_token,
        hasSessionRefreshToken: !!response.session?.refresh_token,
        refreshTokenValue: response.refresh_token || response.session?.refresh_token || 'MISSING',
      });

      // Extract tokens - prioritize top-level, fallback to session
      const newAccessToken = response.access_token || response.session?.access_token;
      const newRefreshToken = response.refresh_token || response.session?.refresh_token;

      if (!newAccessToken || !newRefreshToken) {
        console.error('Refresh response missing required tokens:', {
          hasAccessToken: !!newAccessToken,
          hasRefreshToken: !!newRefreshToken,
          responseKeys: Object.keys(response),
        });
        throw new Error('Invalid refresh response: missing tokens');
      }

      // Store the new tokens IMMEDIATELY (critical - old refresh token is now invalid)
      // Use the extracted values directly to ensure we store the correct tokens
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, newAccessToken);
      await AsyncStorage.setItem(AUTH_REFRESH_TOKEN_KEY, newRefreshToken);
      
      if (response.user) {
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
      }

      // Verify the new refresh token was stored
      const storedRefreshToken = await AsyncStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
      if (storedRefreshToken !== newRefreshToken) {
        console.error('CRITICAL: New refresh token was not stored correctly!', {
          expected: newRefreshToken.substring(0, 10),
          stored: storedRefreshToken?.substring(0, 10),
        });
        throw new Error('Failed to store new refresh token');
      }

      console.log('Token refresh successful - new tokens stored and verified');
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, clear auth and force re-login
      await this.clearAuth();
      throw error;
    }
  },

  /**
   * Check token expiration and return status
   */
  async checkTokenExpiration(): Promise<{
    isExpired: boolean;
    isExpiringSoon: boolean;
    timeUntilExpiry: number | null;
  }> {
    const token = await this.getAccessToken();
    return {
      isExpired: isTokenExpired(token),
      isExpiringSoon: isTokenExpiringSoon(token),
      timeUntilExpiry: getTimeUntilExpiry(token),
    };
  },
};
