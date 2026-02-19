import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { initDatabase } from './database/db';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="indexing" />
        <Stack.Screen name="search" />
      </Stack>
    </>
  );
}
