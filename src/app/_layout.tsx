/**
 * Root Layout — Stack navigator with retro dark theme.
 *
 * Wraps the entire app in the PlayerProvider and sets up
 * a Stack navigator for the main screen and download modal.
 */
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { PlayerProvider } from '@/contexts/PlayerContext';
import { DownloadsProvider } from '@/contexts/DownloadsContext';
import { RetroColors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

const RetroTheme = {
  dark: true,
  colors: {
    primary: RetroColors.amber,
    background: RetroColors.background,
    card: RetroColors.surface,
    text: RetroColors.textPrimary,
    border: RetroColors.divider,
    notification: RetroColors.recRed,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};

export default function RootLayout() {
  // Hide splash screen once the layout is ready
  SplashScreen.hideAsync();

  return (
    <ThemeProvider value={RetroTheme}>
      <PlayerProvider>
        <DownloadsProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: RetroColors.background },
              animation: 'slide_from_bottom',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen
              name="download"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="downloads"
              options={{
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
          </Stack>
        </DownloadsProvider>
      </PlayerProvider>
    </ThemeProvider>
  );
}
