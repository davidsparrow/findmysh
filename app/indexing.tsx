import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { indexingController, IndexingProgress } from './services/IndexingController';
import { theme } from './utils/colors';

export default function IndexingScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState<IndexingProgress>({
    state: 'IDLE',
    progress: 0,
    processedCount: 0,
    totalCount: 0,
    currentItemType: null,
  });

  useEffect(() => {
    const unsubscribe = indexingController.subscribe(setProgress);

    startIndexing();

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (progress.state === 'COMPLETE') {
      setTimeout(() => {
        router.replace('/search');
      }, 1500);
    }
  }, [progress.state]);

  async function startIndexing() {
    try {
      await indexingController.startIndexing({ includePhotos: true, includeFiles: false });
    } catch (error) {
      console.error('Indexing error:', error);
    }
  }

  const handleCancel = () => {
    indexingController.cancel();
    router.back();
  };

  const getStateMessage = () => {
    switch (progress.state) {
      case 'REQUESTING_PERMISSIONS':
        return 'Requesting permissions...';
      case 'ENUMERATING':
        return 'Counting items...';
      case 'PROCESSING_PHOTOS':
        return 'Processing photos...';
      case 'EXTRACTING_TEXT':
        return 'Extracting text...';
      case 'TAGGING':
        return 'Generating tags...';
      case 'EMBEDDING':
        return 'Creating embeddings...';
      case 'SAVING':
        return 'Saving to database...';
      case 'COMPLETE':
        return 'Complete!';
      case 'ERROR':
        return 'Error occurred';
      default:
        return 'Indexing...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <View style={styles.placeholderAnimation}>
          <View style={styles.iconContainer}>
            <Text style={styles.animationIcon}>
              {progress.state === 'COMPLETE' ? '✓' : '⚙'}
            </Text>
          </View>

          <Text style={styles.animationLabel}>{getStateMessage()}</Text>

          {progress.state === 'COMPLETE' && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeBadgeText}>Ready to search</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {progress.state === 'COMPLETE' ? 'Indexing Complete' : 'Indexing...'}
        </Text>

        {progress.totalCount > 0 && (
          <>
            <Text style={styles.counterText}>
              {progress.processedCount} / {progress.totalCount}
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(0, Math.min(100, progress.progress * 100))}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round(progress.progress * 100)}%
              </Text>
            </View>
          </>
        )}
      </View>

      {progress.state !== 'COMPLETE' && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderAnimation: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: theme.button.primary,
    shadowColor: theme.button.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  animationIcon: {
    fontSize: 56,
  },
  animationLabel: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  completeBadge: {
    marginTop: 16,
    backgroundColor: theme.status.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completeBadgeText: {
    color: theme.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 12,
  },
  counterText: {
    fontSize: 18,
    color: theme.text.secondary,
    marginBottom: 20,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.border.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.button.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text.secondary,
    minWidth: 45,
    textAlign: 'right',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.text.secondary,
    fontWeight: '600',
  },
});
