import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTokenExpiration } from '@/hooks/use-token-expiration';

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

export default function RootLayout() {
  // Monitor token expiration globally
  useTokenExpiration();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Protected guard={isDevelopment}>
            <Stack.Screen name="storybook" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
