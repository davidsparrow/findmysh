import { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import ChatMode from './components/ChatMode';
import ManualMode from './components/ManualMode';
import SearchToggle from './components/SearchToggle';
import { useAppStore, SearchMode } from './stores/appStore';

export default function SearchScreen() {
  const { searchMode, setSearchMode } = useAppStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SearchToggle mode={searchMode} onToggle={setSearchMode} />
      </View>

      <View style={styles.content}>
        {searchMode === 'chat' ? <ChatMode /> : <ManualMode />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
});
