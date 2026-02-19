import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { parseSearchQuery } from '../services/openai';
import { runSearch, SearchResultItem } from '../services/searchService';
import { useAppStore } from '../stores/appStore';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'results';
  content: string;
  results?: SearchResultItem[];
  counts?: { photos: number; files: number };
}

export default function ChatMode() {
  const { setSearchMode } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || isSearching) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsSearching(true);

    try {
      const parsed = await parseSearchQuery(inputText);

      const searchResults = await runSearch({
        queryText: parsed.semanticQuery,
        sourceType: parsed.filters.sourceType || 'both',
        dateOp: parsed.filters.dateOp || 'none',
        fromDate: parsed.filters.fromDate,
        toDate: parsed.filters.toDate,
        associationLevel: parsed.filters.associationLevel ?? 1,
        viewMode: 'list',
      });

      const resultsMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'results',
        content: `Found ${searchResults.results.length} results`,
        results: searchResults.results,
        counts: searchResults.counts,
      };

      setMessages(prev => [...prev, resultsMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while searching.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultsPillPress = (message: Message) => {
    setSearchMode('manual');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === 'user') {
      return (
        <View style={styles.userMessageContainer}>
          <View style={styles.userMessageBubble}>
            <Text style={styles.userMessageText}>{item.content}</Text>
          </View>
        </View>
      );
    }

    if (item.role === 'results') {
      return (
        <View style={styles.assistantMessageContainer}>
          <TouchableOpacity
            style={styles.resultsPill}
            onPress={() => handleResultsPillPress(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.resultsPillText}>Results · {item.results?.length || 0}</Text>
            {item.counts && (
              <Text style={styles.resultsPillSubtext}>
                {item.counts.photos} Photos · {item.counts.files} Files
              </Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.assistantMessageContainer}>
        <View style={styles.assistantMessageBubble}>
          <Text style={styles.assistantMessageText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ask me to find your photos or files</Text>
            <Text style={styles.emptySubtext}>
              Try: "Find the receipt from last June"
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Search your files..."
          placeholderTextColor="#999999"
          multiline
          maxLength={500}
          editable={!isSearching}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isSearching) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSearching}
          activeOpacity={0.7}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.sendButtonText}>→</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userMessageBubble: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  userMessageText: {
    color: '#ffffff',
    fontSize: 16,
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assistantMessageBubble: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  assistantMessageText: {
    color: '#000000',
    fontSize: 16,
  },
  resultsPill: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  resultsPillText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsPillSubtext: {
    color: '#cccccc',
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },
});
