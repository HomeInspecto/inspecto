import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/views/button/button';
import Text from '@/components/views/text/text';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleLogin = async () => {
    try {
      setError(null);
      await login();
      // Navigate to home after successful login
      router.replace('/');
    } catch (err: any) {
      if (err.error !== 'a0.session.user_cancelled') {
        setError(err.message || 'Failed to login. Please try again.');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text variant="largeTitle" weight="bold" style={[styles.title, { color: textColor }]}>
          Welcome to Inspecto
        </Text>
        <Text variant="body" style={[styles.subtitle, { color: textColor }]}>
          Please sign in to continue
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text variant="callout" style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            text={isLoading ? 'Signing in...' : 'Sign In'}
            onPress={handleLogin}
            disabled={isLoading}
            color="primary"
            accessibilityLabel="Sign in with Auth0"
          />
        </View>

        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={Colors.light.tint} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    width: '100%',
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  loaderContainer: {
    marginTop: 16,
  },
});

