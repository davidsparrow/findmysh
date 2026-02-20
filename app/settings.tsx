import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getDatabase } from './database/db';
import { refreshIndex, RefreshProgress } from './services/refreshService';
import { theme } from './utils/colors';

interface Stats {
  totalPhotos: number;
  totalFiles: number;
  totalItems: number;
  lastRefresh: number | null;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalPhotos: 0,
    totalFiles: 0,
    totalItems: 0,
    lastRefresh: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState<RefreshProgress | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const db = getDatabase();

      const photosResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM items WHERE source_type = 'photo' AND status = 'indexed' AND user_deleted = 0`
      );

      const filesResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM items WHERE source_type = 'file' AND status = 'indexed' AND user_deleted = 0`
      );

      const totalResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM items WHERE status = 'indexed' AND user_deleted = 0`
      );

      const lastRefreshResult = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM app_metadata WHERE key = 'last_refresh_at'`
      );

      setStats({
        totalPhotos: photosResult?.count || 0,
        totalFiles: filesResult?.count || 0,
        totalItems: totalResult?.count || 0,
        lastRefresh: lastRefreshResult?.value ? parseInt(lastRefreshResult.value) : null,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    setRefreshProgress({ phase: 'checking_photos', processed: 0, total: 0 });

    try {
      const result = await refreshIndex(setRefreshProgress);

      Alert.alert(
        'Refresh Complete',
        `Removed ${result.photosRemoved} photos and ${result.filesRemoved} files that are no longer accessible.`
      );

      await loadStats();
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Error', 'Failed to refresh index');
    } finally {
      setIsRefreshing(false);
      setRefreshProgress(null);
    }
  }

  async function handleReIndex() {
    Alert.alert(
      'Re-index Library',
      'This will start a new indexing process for your photos and files.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            router.push('/indexing');
          },
        },
      ]
    );
  }

  async function handleClearAll() {
    Alert.alert(
      'Clear All Data',
      'This will remove all indexed photos and files from the app. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getDatabase();
              await db.runAsync(`DELETE FROM items`);
              await loadStats();
              router.replace('/welcome');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  }

  const getRefreshPhaseText = () => {
    if (!refreshProgress) return '';

    switch (refreshProgress.phase) {
      case 'checking_photos':
        return `Checking photos: ${refreshProgress.processed} / ${refreshProgress.total}`;
      case 'checking_files':
        return `Checking files: ${refreshProgress.processed} / ${refreshProgress.total}`;
      case 'purging':
        return 'Cleaning up...';
      case 'complete':
        return 'Complete!';
      default:
        return 'Processing...';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Library Statistics</Text>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Photos</Text>
              <Text style={styles.statValue}>{stats.totalPhotos}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Files</Text>
              <Text style={styles.statValue}>{stats.totalFiles}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Items</Text>
              <Text style={styles.statValue}>{stats.totalItems}</Text>
            </View>
            {stats.lastRefresh && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Last Refresh</Text>
                <Text style={styles.statValue}>
                  {new Date(stats.lastRefresh).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance</Text>

          <TouchableOpacity
            style={[styles.actionButton, isRefreshing && styles.actionButtonDisabled]}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <View style={styles.refreshingContainer}>
                <ActivityIndicator size="small" color={theme.button.primaryText} />
                <Text style={styles.actionButtonText}>{getRefreshPhaseText()}</Text>
              </View>
            ) : (
              <Text style={styles.actionButtonText}>Refresh Index</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Removes photos and files that are no longer accessible on your device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleReIndex}>
            <Text style={styles.actionButtonText}>Re-index Library</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Add more photos and files to your searchable library.
          </Text>

          <View style={{ height: 16 }} />

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearAll}>
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Permanently removes all indexed content. You'll need to re-index your library.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>findmysh v1.0.0</Text>
            <Text style={styles.infoSubtext}>Privacy-first semantic search</Text>
            <Text style={styles.infoSubtext}>All data stored locally on your device</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.light,
    backgroundColor: theme.surface,
  },
  backButton: {
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.button.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border.light,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.light,
  },
  statLabel: {
    fontSize: 16,
    color: theme.text.secondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
  },
  actionButton: {
    backgroundColor: theme.button.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: theme.button.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  refreshingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dangerButton: {
    backgroundColor: theme.status.error,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButtonText: {
    color: theme.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 13,
    color: theme.text.secondary,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border.light,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 4,
  },
});
