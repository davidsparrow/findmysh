import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchMode } from '../stores/appStore';

interface SearchToggleProps {
  mode: SearchMode;
  onToggle: (mode: SearchMode) => void;
}

export default function SearchToggle({ mode, onToggle }: SearchToggleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>findmysh</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, mode === 'chat' && styles.toggleButtonActive]}
          onPress={() => onToggle('chat')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, mode === 'chat' && styles.toggleTextActive]}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, mode === 'manual' && styles.toggleButtonActive]}
          onPress={() => onToggle('manual')}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleText, mode === 'manual' && styles.toggleTextActive]}>
            Manual
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  toggleTextActive: {
    color: '#000000',
  },
});
