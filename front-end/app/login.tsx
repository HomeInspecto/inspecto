import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Text from '@/components/views/text/text';
import TextInput from '@/components/views/text-input/text-input';
import Button from '@/components/views/button/button';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    try {
      await login(email, password);
      router.replace('/home');
    } catch {
      // Error is already set in the store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="largeTitle" weight="emphasized" style={styles.title}>
              Welcome Back
            </Text>
            <Text variant="body" style={styles.subtitle}>
              Log in to continue
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text variant="caption1" weight="emphasized" style={styles.label}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError();
                }}
                placeholder="Enter your email"
                leftIcon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption1" weight="emphasized" style={styles.label}>
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError();
                }}
                placeholder="Enter your password"
                leftIcon="lock-closed"
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text variant="footnote" style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            <View style={styles.buttonGroup}>
              <Button
                text="Sign In"
                onPress={handleLogin}
                disabled={isLoading || !email || !password}
                accessibilityLabel="Sign in"
              />

              <View style={styles.signupLink}>
                <Text variant="body" style={styles.signupText}>
                  Don&apos;t have an account?{' '}
                </Text>
                <Text
                  variant="body"
                  weight="emphasized"
                  style={styles.signupLinkText}
                  onPress={() => router.push('/signup')}
                >
                  Sign Up
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    gap: 8,
  },
  title: {
    color: COLORS.label.onDark.primary,
  },
  subtitle: {
    color: COLORS.label.onDark.secondary,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: COLORS.label.onDark.primary,
    paddingLeft: 4,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
  },
  errorText: {
    color: COLORS.severity.critical,
  },
  buttonGroup: {
    gap: 16,
    marginTop: 8,
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: COLORS.label.onDark.secondary,
  },
  signupLinkText: {
    color: COLORS.label.onDark.primary,
  },
});

