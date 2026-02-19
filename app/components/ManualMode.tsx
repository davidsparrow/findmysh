import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runSearch, SearchResultItem, AssociationLevel } from '../services/searchService';
import { markItemDeleted, getDatabase } from '../database/db';
import * as FileSystem from 'expo-file-system';
import { theme } from '../utils/colors';

const SWIPE_THRESHOLD = -80;

export default function ManualMode() {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [associationLevel, setAssociationLevel] = useState<AssociationLevel>(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleSearch = async (text: string) => {
    setSearchText(text);

    if (!text.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const searchResults = await runSearch({
        queryText: text,
        sourceType: 'both',
        dateOp: 'none',
        associationLevel,
        viewMode,
      });

      setResults(searchResults.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemove = useCallback(async (item: SearchResultItem) => {
    try {
      if (item.sourceType === 'file' && item.openRef.localPath) {
        const fileInfo = await FileSystem.getInfoAsync(item.openRef.localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(item.openRef.localPath);
        }
      }

      await markItemDeleted(item.itemId);

      setResults(prev => prev.filter(r => r.itemId !== item.itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item');
    }
  }, []);

  const renderItem = ({ item }: { item: SearchResultItem }) => (
    <SwipeableItem item={item} onRemove={() => handleRemove(item)} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search..."
          placeholderTextColor={theme.text.secondary}
        />
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.associationSlider}>
          <Text style={styles.filterLabel}>Match:</Text>
          {(['Narrow', 'Medium', 'Wide', 'Deep'] as const).map((label, index) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.sliderButton,
                associationLevel === index && styles.sliderButtonActive,
              ]}
              onPress={() => setAssociationLevel(index as AssociationLevel)}
            >
              <Text
                style={[
                  styles.sliderButtonText,
                  associationLevel === index && styles.sliderButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.button.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={item => item.itemId}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            searchText ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔎</Text>
                <Text style={styles.emptyText}>Start typing to search</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

function SwipeableItem({
  item,
  onRemove,
}: {
  item: SearchResultItem;
  onRemove: () => void;
}) {
  const translateX = useSharedValue(0);
  const [isRemoving, setIsRemoving] = useState(false);

  const panGesture = Gesture.Pan()
    .onUpdate(e => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, SWIPE_THRESHOLD * 1.5);
      }
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(SWIPE_THRESHOLD);
        runOnJS(setIsRemoving)(true);
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleRemovePress = () => {
    translateX.value = withTiming(-400);
    setTimeout(onRemove, 300);
  };

  return (
    <View style={styles.swipeableContainer}>
      <View style={styles.deleteBackground}>
        {isRemoving && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleRemovePress}>
            <Text style={styles.deleteButtonText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.resultItem, animatedStyle]}>
          <View style={styles.resultContent}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.typeIcon}>
                <Text style={styles.typeIconText}>
                  {item.sourceType === 'photo' ? '📷' : '📄'}
                </Text>
              </View>
            </View>

            {item.snippet && (
              <Text style={styles.resultSnippet} numberOfLines={2}>
                {item.snippet}
              </Text>
            )}

            <View style={styles.resultFooter}>
              <Text style={styles.resultDate}>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : 'Unknown date'}
              </Text>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreBadgeText}>
                  {Math.round(item.score * 100)}% match
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.light,
    backgroundColor: theme.surface,
  },
  searchInput: {
    backgroundColor: theme.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border.light,
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.light,
    backgroundColor: theme.surface,
  },
  associationSlider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text.primary,
    marginRight: 12,
  },
  sliderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border.light,
  },
  sliderButtonActive: {
    backgroundColor: theme.button.primary,
    borderColor: theme.button.primary,
  },
  sliderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  sliderButtonTextActive: {
    color: theme.button.primaryText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    padding: 16,
  },
  swipeableContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: theme.status.error,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: theme.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  resultItem: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border.light,
    shadowColor: theme.primary.voidBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
    flex: 1,
  },
  typeIcon: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIconText: {
    fontSize: 16,
  },
  resultSnippet: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultDate: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  scoreBadge: {
    backgroundColor: theme.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.button.primary,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.button.primary,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.text.secondary,
  },
});
