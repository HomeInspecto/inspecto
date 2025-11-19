import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { COLORS } from '@/constants/colors';

/**
 * Index route - Entry point that checks authentication and redirects accordingly
 * - If authenticated: redirect to /home
 * - If not authenticated: redirect to /login
 */
export default function IndexScreen() {
  const navigationState = useRootNavigationState();
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, [checkAuth]);

  // If navigation isn't ready yet, render nothing (prevents premature navigation)
  if (!navigationState?.key) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.label.onDark.primary} />
      </View>
    );
  }

  // Still checking auth → show loader
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.label.onDark.primary} />
      </View>
    );
  }

  // Auth check finished → redirect
  return <Redirect href={isAuthenticated ? '/home' : '/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
