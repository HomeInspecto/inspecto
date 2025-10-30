import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { useEffect } from 'react';

const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Ensure Material Icons font is loaded (fallback if +html.tsx doesn't work)
      const linkId = 'material-icons-font';
      if (!document.getElementById(linkId)) {
        // Preconnect for faster loading
        const preconnect1 = document.createElement('link');
        preconnect1.rel = 'preconnect';
        preconnect1.href = 'https://fonts.googleapis.com';
        document.head.appendChild(preconnect1);
        
        const preconnect2 = document.createElement('link');
        preconnect2.rel = 'preconnect';
        preconnect2.href = 'https://fonts.gstatic.com';
        preconnect2.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect2);
        
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Material+Icons';
        document.head.appendChild(link);
      }
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Protected guard={isDevelopment}>
            <Stack.Screen name="storybook" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
