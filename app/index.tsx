import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getDatabase } from './database/db';
import { theme } from './utils/colors';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkInitialState();
  }, []);

  async function checkInitialState() {
    try {
      const db = getDatabase();

      const result = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM items WHERE status = 'indexed' AND user_deleted = 0`
      );

      const hasContent = (result?.count || 0) > 0;

      if (hasContent) {
        router.replace('/search');
      } else {
        router.replace('/welcome');
      }
    } catch (error) {
      console.error('Error checking initial state:', error);
      router.replace('/welcome');
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.button.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
