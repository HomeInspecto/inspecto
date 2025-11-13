import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/**
 * Create an authenticated fetch function
 * This helper can be used to make API requests with Auth0 tokens
 */
export const createAuthenticatedFetch = (getAccessToken: () => Promise<string | null>) => {
  return async (url: string, options: RequestInit = {}) => {
    const token = await getAccessToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired, the AuthContext should handle this
        throw new Error('Unauthorized - Please login again');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  };
};

/**
 * Hook to get an authenticated fetch function
 * Usage:
 * const authenticatedFetch = useAuthenticatedFetch();
 * const data = await authenticatedFetch('/api/inspections');
 */
export const useAuthenticatedFetch = () => {
  const { getAccessToken } = useAuth();
  return createAuthenticatedFetch(getAccessToken);
};

