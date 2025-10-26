import { Stack } from 'expo-router';

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={isDevelopment}>
        <Stack.Screen name="storybook" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
