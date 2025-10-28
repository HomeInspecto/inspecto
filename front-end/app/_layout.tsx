import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={isDevelopment}>
          <Stack.Screen name="storybook" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </KeyboardProvider>
  );
}
