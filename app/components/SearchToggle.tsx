import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SearchMode } from '../stores/appStore';
import { theme } from '../utils/colors';

interface SearchToggleProps {
  mode: SearchMode;
  onToggle: (mode: SearchMode) => void;
}

export default function SearchToggle({ mode, onToggle }: SearchToggleProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>findmysh</Text>
        <View style={styles.logoAccent} />
      </View>

      <View style={styles.rightSection}>
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

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push('/settings')}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsIcon}>⚙</Text>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text.primary,
    letterSpacing: -0.5,
  },
  logoAccent: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.button.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.border.light,
  },
  toggleButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: theme.button.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  toggleTextActive: {
    color: theme.button.primaryText,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.light,
  },
  settingsIcon: {
    fontSize: 18,
  },
});
