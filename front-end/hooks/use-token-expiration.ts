import { useEffect, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { authService, isTokenExpired } from '@/services/auth';

// Check more frequently to catch token expiration (especially when testing with short expiry times)
const CHECK_INTERVAL = 5 * 1000; //TODO Check every 5 minutes (was 5 seconds)
const EXPIRED_CHECK_INTERVAL = 1 * 1000; //TODO Check every minute for expired tokens (was 1 second)

/**
 * Hook to monitor token expiration and show alerts
 */
export function useTokenExpiration() {
  const { tokenExpiringSoon, refreshToken, logout, checkTokenExpiration, isAuthenticated } = useAuthStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiredCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiringSoonAlertShownRef = useRef(false); // Track if "expiring soon" alert was shown
  const expiredAlertShownRef = useRef(false); // Track if "expired" alert was shown
  const refreshInProgressRef = useRef(false); // Track if a manual refresh is in progress

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear intervals if user is not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (expiredCheckIntervalRef.current) {
        clearInterval(expiredCheckIntervalRef.current);
        expiredCheckIntervalRef.current = null;
      }
      expiringSoonAlertShownRef.current = false;
      expiredAlertShownRef.current = false;
      return;
    }

    // Initial check immediately
    checkTokenExpiration();

    // Check token expiration directly every second to catch expiration immediately
    const checkExpiredDirectly = async () => {
      if (refreshInProgressRef.current) {
        // Skip expired checks while refresh is in progress to avoid false logout alerts
        return;
      }
      const token = await authService.getAccessToken();
      if (token) {
        const expired = isTokenExpired(token);
        if (expired && !expiredAlertShownRef.current) {
          // Token just expired - show alert immediately
          // Reset the expiring soon flag so expired alert can show
          expiringSoonAlertShownRef.current = false;
          expiredAlertShownRef.current = true;
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please logout and login again to continue.',
            [
              {
                text: 'Logout',
                onPress: async () => {
                  try {
                    // Do the same thing as profile logout
                    await logout();
                    router.replace('/');
                    expiredAlertShownRef.current = false;
                  } catch (error: any) {
                    expiredAlertShownRef.current = false;
                    Alert.alert(
                      'Logout Failed',
                      error.message || 'Failed to logout. Please try again.',
                      [
                        {
                          text: 'OK',
                          onPress: () => {
                            expiredAlertShownRef.current = false;
                          },
                        },
                      ]
                    );
                  }
                },
                style: 'default',
              },
            ],
            { cancelable: false }
          );
        }
      }
    };

    // Check immediately
    checkExpiredDirectly();

    // Set up frequent checking for expired tokens (every second)
    expiredCheckIntervalRef.current = setInterval(() => {
      checkExpiredDirectly();
    }, EXPIRED_CHECK_INTERVAL);

    // Set up periodic checking for expiring soon tokens
    intervalRef.current = setInterval(() => {
      checkTokenExpiration();
    }, CHECK_INTERVAL);

    // Check when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Check immediately when app becomes active
        checkTokenExpiration();
        checkExpiredDirectly();
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (expiredCheckIntervalRef.current) {
        clearInterval(expiredCheckIntervalRef.current);
      }
      subscription.remove();
    };
  }, [isAuthenticated, checkTokenExpiration, logout]);

  useEffect(() => {
    // Show alert when token is expiring soon (but not expired)
    // Expired tokens are handled by the direct check interval above
    if (tokenExpiringSoon && !expiringSoonAlertShownRef.current) {
      // Check if token is actually expired or just expiring soon
      authService.getAccessToken().then((token) => {
        const expired = isTokenExpired(token);
        
        // Only show "expiring soon" alert if token is not yet expired
        // Expired tokens are handled by the direct check
        if (!expired) {
          expiringSoonAlertShownRef.current = true;
          
          // Token is expiring soon - offer to refresh
          Alert.alert(
            'Session Expiring Soon',
            'Your session will expire in less than 5 minutes. Click "Refresh Token" to extend your session.',
            [
              {
                text: 'Refresh Token',
                onPress: async () => {
                  try {
                    refreshInProgressRef.current = true;
                    await refreshToken();
                    // Reset both alert flags to restart monitoring with new token
                    expiringSoonAlertShownRef.current = false;
                    expiredAlertShownRef.current = false;
                    // Re-check token expiration to restart the timer with new token
                    checkTokenExpiration();
                    Alert.alert('Success', 'Your session has been refreshed successfully.');
                  } catch (error: any) {
                    expiringSoonAlertShownRef.current = false;
                    Alert.alert(
                      'Refresh Failed',
                      error.message || 'Failed to refresh token. Please login again.',
                      [
                        {
                          text: 'OK',
                          onPress: () => {
                            // User will need to login again
                          },
                        },
                      ]
                    );
                  } finally {
                    refreshInProgressRef.current = false;
                  }
                },
                style: 'default',
              },
              {
                text: 'Later',
                style: 'cancel',
                onPress: () => {
                  // Reset alert flag after 2 minutes so user can see it again
                  // But don't block the expired alert - it uses a separate flag
                  setTimeout(() => {
                    expiringSoonAlertShownRef.current = false;
                  }, 2 * 60 * 1000);
                },
              },
            ],
            { cancelable: false }
          );
        }
      });
    } else if (!tokenExpiringSoon) {
      // Reset alert flag when token is no longer expiring soon
      expiringSoonAlertShownRef.current = false;
    }
  }, [tokenExpiringSoon, refreshToken, checkTokenExpiration]);
}

