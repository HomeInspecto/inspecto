import { useEffect, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@/store/auth-store';

const CHECK_INTERVAL = 60 * 1000; // Check every minute
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry

/**
 * Hook to monitor token expiration and show alerts
 */
export function useTokenExpiration() {
  const { tokenExpiringSoon, refreshToken, checkTokenExpiration, isAuthenticated } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertShownRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval if user is not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      alertShownRef.current = false;
      return;
    }

    // Initial check
    checkTokenExpiration();

    // Set up periodic checking
    intervalRef.current = setInterval(() => {
      checkTokenExpiration();
    }, CHECK_INTERVAL);

    // Check when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkTokenExpiration();
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
    };
  }, [isAuthenticated, checkTokenExpiration]);

  useEffect(() => {
    // Show alert when token is expiring soon
    if (tokenExpiringSoon && !alertShownRef.current) {
      alertShownRef.current = true;
      
      Alert.alert(
        'Session Expiring Soon',
        'Your session will expire in less than 5 minutes. Click "Refresh Token" to extend your session.',
        [
          {
            text: 'Refresh Token',
            onPress: async () => {
              try {
                await refreshToken();
                alertShownRef.current = false;
                Alert.alert('Success', 'Your session has been refreshed successfully.');
              } catch (error: any) {
                Alert.alert(
                  'Refresh Failed',
                  error.message || 'Failed to refresh token. Please login again.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        alertShownRef.current = false;
                      },
                    },
                  ]
                );
              }
            },
            style: 'default',
          },
          {
            text: 'Later',
            style: 'cancel',
            onPress: () => {
              // Reset alert flag after 2 minutes so user can see it again
              setTimeout(() => {
                alertShownRef.current = false;
              }, 2 * 60 * 1000);
            },
          },
        ],
        { cancelable: false }
      );
    } else if (!tokenExpiringSoon) {
      // Reset alert flag when token is no longer expiring soon
      alertShownRef.current = false;
    }
  }, [tokenExpiringSoon, refreshToken]);
}

