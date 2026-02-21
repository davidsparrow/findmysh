import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { initDatabase } from './database/db';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    async function prepare() {
      console.log('[Layout] prepare() start, platform:', Platform.OS);
      try {
        if (Platform.OS !== 'web') {
          console.log('[Layout] initializing SQLite database...');
          await initDatabase();
          console.log('[Layout] database initialized');
        } else {
          console.log('[Layout] skipping SQLite init on web');
        }
      } catch (error) {
        console.error('[Layout] Failed to initialize database:', error);
      } finally {
        console.log('[Layout] hiding splash screen');
        await SplashScreen.hideAsync();
        console.log('[Layout] splash screen hidden');
      }
    }

    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FAFAFA' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="indexing" />
        <Stack.Screen name="search" />
        <Stack.Screen name="settings" />
      </Stack>
    </GestureHandlerRootView>
  );
}
