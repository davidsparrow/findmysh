import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { runSearch, SearchResultItem, AssociationLevel } from '../services/searchService';

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

  const renderItem = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity style={styles.resultItem} activeOpacity={0.7}>
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.resultType}>
            {item.sourceType === 'photo' ? '📷' : '📄'}
          </Text>
        </View>

        {item.snippet && (
          <Text style={styles.resultSnippet} numberOfLines={2}>
            {item.snippet}
          </Text>
        )}

        <Text style={styles.resultDate}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search..."
          placeholderTextColor="#999999"
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
          <ActivityIndicator size="large" color="#000000" />
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
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Start typing to search</Text>
              </View>
            )
          }
        />
      )}
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
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  filtersContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  associationSlider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginRight: 12,
  },
  sliderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  sliderButtonActive: {
    backgroundColor: '#000000',
  },
  sliderButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  sliderButtonTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  resultType: {
    fontSize: 20,
    marginLeft: 8,
  },
  resultSnippet: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  resultDate: {
    fontSize: 12,
    color: '#999999',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});
