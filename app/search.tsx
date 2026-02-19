import { View, StyleSheet, SafeAreaView } from 'react-native';
import ChatMode from './components/ChatMode';
import ManualMode from './components/ManualMode';
import SearchToggle from './components/SearchToggle';
import { useAppStore } from './stores/appStore';
import { theme } from './utils/colors';

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
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.light,
    backgroundColor: theme.surface,
  },
  content: {
    flex: 1,
  },
});
