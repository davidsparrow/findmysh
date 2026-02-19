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
import * as DocumentPicker from 'expo-document-picker';
import { parseSearchQuery } from '../services/openai';
import { runSearch, SearchResultItem } from '../services/searchService';
import { indexingController } from '../services/IndexingController';
import { useAppStore } from '../stores/appStore';
import { theme } from '../utils/colors';

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

  const handleAddFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const fileUris = result.assets.map(asset => asset.uri);
        await indexingController.addFiles(fileUris);

        const successMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Added ${fileUris.length} file${fileUris.length > 1 ? 's' : ''} to your library.`,
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Error adding files:', error);
    }
  };

  const handleResultsPillPress = () => {
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
            onPress={handleResultsPillPress}
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
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Ask me to find your photos or files</Text>
            <Text style={styles.emptySubtext}>
              Try: "Find the receipt from last June"
            </Text>

            <TouchableOpacity style={styles.addFilesButton} onPress={handleAddFiles}>
              <Text style={styles.addFilesButtonText}>+ Add Files</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Search your files..."
          placeholderTextColor={theme.text.secondary}
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
            <ActivityIndicator size="small" color={theme.button.primaryText} />
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
    paddingTop: 80,
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
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  addFilesButton: {
    backgroundColor: theme.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.button.primary,
    borderStyle: 'dashed',
  },
  addFilesButtonText: {
    color: theme.button.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userMessageBubble: {
    backgroundColor: theme.button.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: '80%',
    shadowColor: theme.button.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessageText: {
    color: theme.button.primaryText,
    fontSize: 16,
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assistantMessageBubble: {
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: theme.border.light,
  },
  assistantMessageText: {
    color: theme.text.primary,
    fontSize: 16,
  },
  resultsPill: {
    backgroundColor: theme.button.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: theme.button.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resultsPillText: {
    color: theme.button.primaryText,
    fontSize: 18,
    fontWeight: '700',
  },
  resultsPillSubtext: {
    color: theme.button.primaryText,
    fontSize: 13,
    marginTop: 4,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border.light,
    alignItems: 'flex-end',
    backgroundColor: theme.surface,
  },
  input: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border.light,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.button.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.button.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: theme.neutral.zincMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: theme.button.primaryText,
    fontSize: 24,
    fontWeight: '600',
  },
});
