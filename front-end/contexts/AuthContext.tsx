import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { auth0Config } from '@/config/auth0';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Complete the browser session to prevent memory leaks
WebBrowser.maybeCompleteAuthSession();

interface User {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getCallbackUrl: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'auth0_access_token';
const REFRESH_TOKEN_KEY = 'auth0_refresh_token';
const USER_KEY = 'auth0_user';

// Secure storage for tokens
const storeToken = async (token: string) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

const storeRefreshToken = async (token: string) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error storing refresh token:', error);
  }
};

const getStoredToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

const getStoredRefreshToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

const removeToken = async () => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

const storeUser = async (user: User) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user:', error);
  }
};

const getStoredUser = async (): Promise<User | null> => {
  try {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: auth0Config.clientId,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri: auth0Config.redirectUri,
      extraParams: {},
    },
    {
      authorizationEndpoint: auth0Config.authorizationEndpoint,
    }
  );

  const fetchUserInfo = useCallback(async (token: string) => {
    try {
      const response = await fetch(`https://${auth0Config.domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userInfo = await response.json();
        await storeUser(userInfo);
        setUser(userInfo);
        setAccessToken(token);
        setIsAuthenticated(true);
      }
    } catch {
      // Error fetching user info - will be handled by calling code
    }
  }, []);

  const tryRefreshToken = useCallback(async () => {
    try {
      const refreshToken = await getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Auth0 expects application/x-www-form-urlencoded format
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: auth0Config.clientId,
        refresh_token: refreshToken,
      });

      const response = await fetch(auth0Config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        await storeToken(data.access_token);
        if (data.refresh_token) {
          await storeRefreshToken(data.refresh_token);
        }
        await fetchUserInfo(data.access_token);
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch {
      console.log('Token refresh failed, clearing auth state');
      await removeToken();
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
    }
  }, [fetchUserInfo]);

  const handleAuthResponse = useCallback(async (code: string) => {
    try {
      setIsLoading(true);

      // Exchange authorization code for tokens
      // Auth0 expects application/x-www-form-urlencoded format
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: auth0Config.clientId,
        code,
        redirect_uri: auth0Config.redirectUri,
      });

      const tokenResponse = await fetch(auth0Config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange error:', errorText);
        throw new Error(`Failed to exchange authorization code: ${tokenResponse.status} ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      
      // Store tokens
      await storeToken(tokenData.access_token);
      if (tokenData.refresh_token) {
        await storeRefreshToken(tokenData.refresh_token);
      }

      // Fetch user info
      await fetchUserInfo(tokenData.access_token);
    } catch (error) {
      console.error('Error handling auth response:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserInfo]);

  const initializeAuth = useCallback(async () => {
    try {
      const token = await getStoredToken();
      const storedUser = await getStoredUser();

      if (token && storedUser) {
        // Verify token is still valid by decoding it (simple check)
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds
            
            if (Date.now() < expiry) {
              // Token is still valid
              setUser(storedUser);
              setAccessToken(token);
              setIsAuthenticated(true);
            } else {
              // Token expired, try to refresh
              await tryRefreshToken();
            }
          } else {
            throw new Error('Invalid token format');
          }
        } catch {
          // Token is invalid, try to refresh
          await tryRefreshToken();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tryRefreshToken]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (response && response.type === 'success') {
      const params = response.params;
      if ('code' in params) {
        handleAuthResponse(params.code as string);
      }
    } else if (response && response.type === 'error') {
      console.error('Auth error:', response.error);
      setIsLoading(false);
    }
  }, [response, handleAuthResponse]);

  const login = async () => {
    try {
      setIsLoading(true);
      
      // Log the callback URL for debugging
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.warn('📋 Auth0 Callback URL (Copy this!):');
      console.warn(auth0Config.redirectUri);
      console.warn('Add this to Auth0 Dashboard > Applications > Your App > Allowed Callback URLs');
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Prompt user to authenticate
      const result = await promptAsync();
      if (result.type === 'dismiss') {
        setIsLoading(false);
      }
      // If successful, the useEffect will handle the response
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage
      await removeToken();
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);

      // Optionally revoke tokens on Auth0 (if you have revocation endpoint configured)
      // This is optional and can be done in the background
    } catch {
      // Logout error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (accessToken) {
      return accessToken;
    }
    
    const token = await getStoredToken();
    if (token) {
      setAccessToken(token);
      return token;
    }
    
    return null;
  };

  const getCallbackUrl = (): string | null => {
    if (!auth0Config.domain) {
      return null;
    }
    
    return auth0Config.redirectUri;
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        user,
        accessToken,
        login,
        logout,
        getAccessToken,
        getCallbackUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
