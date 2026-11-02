// Root of the app: theme, shared store, and the stack that holds the tabs plus
// detail screens (piece, offer sheet, chat, instant viewer).
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';

import { AppStoreProvider } from '@/store/app-store';
import { dark, light } from '@/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? dark : light;
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={{ ...base, colors: { ...base.colors, background: c.bg[1], text: c.text, primary: c.accent } }}>
        <AppStoreProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 220, contentStyle: { backgroundColor: c.bg[1] } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="piece/[id]" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="offer/[id]" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.86], sheetGrabberVisible: true, sheetCornerRadius: 28, animation: 'slide_from_bottom', contentStyle: { backgroundColor: c.bg[0] } }} />
            <Stack.Screen name="instant/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
            <Stack.Screen name="japan/[id]" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.7], sheetGrabberVisible: true, sheetCornerRadius: 28, animation: 'slide_from_bottom', contentStyle: { backgroundColor: c.bg[0] } }} />
          </Stack>
        </AppStoreProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
