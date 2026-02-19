import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { indexingController, IndexingProgress } from './services/IndexingController';

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
      }, 1000);
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

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <View style={styles.placeholderAnimation}>
          <Text style={styles.animationText}>⚙️</Text>
          <Text style={styles.animationLabel}>
            {progress.state === 'REQUESTING_PERMISSIONS' && 'Requesting permissions...'}
            {progress.state === 'ENUMERATING' && 'Counting items...'}
            {progress.state === 'PROCESSING_PHOTOS' && 'Processing photos...'}
            {progress.state === 'EXTRACTING_TEXT' && 'Extracting text...'}
            {progress.state === 'TAGGING' && 'Generating tags...'}
            {progress.state === 'EMBEDDING' && 'Creating embeddings...'}
            {progress.state === 'SAVING' && 'Saving to database...'}
            {progress.state === 'COMPLETE' && 'Complete!'}
            {progress.state === 'ERROR' && 'Error occurred'}
          </Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Indexing...</Text>
        <Text style={styles.counterText}>
          {progress.processedCount} / {progress.totalCount}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(0, Math.min(100, progress.progress * 100))}%` },
            ]}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderAnimation: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  animationText: {
    fontSize: 64,
    marginBottom: 16,
  },
  animationLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  statusContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  counterText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  cancelButton: {
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
  },
});
