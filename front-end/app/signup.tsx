import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Text from '@/components/views/text/text';
import TextInput from '@/components/views/text-input/text-input';
import Button from '@/components/views/button/button';
import { COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    clearError();
  }, []);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    try {
      await signup(email, password, fullName || undefined, phone || undefined);
      router.replace('/home');
    } catch (err) {
      // Error is already set in the store
    }
  };

  const isFormValid =
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword &&
    password.length >= 6;

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
              Create Account
            </Text>
            <Text variant="body" style={styles.subtitle}>
              Sign up to get started
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text variant="caption" weight="emphasized" style={styles.label}>
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
              <Text variant="caption" weight="emphasized" style={styles.label}>
                Full Name (Optional)
              </Text>
              <TextInput
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  clearError();
                }}
                placeholder="Enter your full name"
                leftIcon="person"
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="emphasized" style={styles.label}>
                Phone (Optional)
              </Text>
              <TextInput
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  clearError();
                }}
                placeholder="Enter your phone number"
                leftIcon="call"
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="emphasized" style={styles.label}>
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError();
                }}
                placeholder="Enter your password (min. 6 characters)"
                leftIcon="lock-closed"
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="emphasized" style={styles.label}>
                Confirm Password
              </Text>
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError();
                }}
                placeholder="Confirm your password"
                leftIcon="lock-closed"
                rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
            </View>

            {password && confirmPassword && password !== confirmPassword && (
              <View style={styles.errorContainer}>
                <Text variant="footnote" style={styles.errorText}>
                  Passwords do not match
                </Text>
              </View>
            )}

            {password && password.length < 6 && (
              <View style={styles.errorContainer}>
                <Text variant="footnote" style={styles.errorText}>
                  Password must be at least 6 characters
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text variant="footnote" style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            <View style={styles.buttonGroup}>
              <Button
                text="Sign Up"
                onPress={handleSignup}
                disabled={isLoading || !isFormValid}
                accessibilityLabel="Sign up"
              />

              <View style={styles.loginLink}>
                <Text variant="body" style={styles.loginText}>
                  Already have an account?{' '}
                </Text>
                <Text
                  variant="body"
                  weight="emphasized"
                  style={styles.loginLinkText}
                  onPress={() => router.push('/login')}
                >
                  Sign In
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
    gap: 20,
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
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.label.onDark.secondary,
  },
  loginLinkText: {
    color: COLORS.label.onDark.primary,
  },
});

