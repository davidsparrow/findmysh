import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from './utils/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStartIndexing = () => {
    router.push('/indexing');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>findmysh</Text>
          <View style={styles.logoUnderline} />
        </View>

        <Text style={styles.subtitle}>Your files stay on your device.</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStartIndexing}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Start Indexing</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Privacy-first • On-device AI • Semantic Search</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 56,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: -2,
  },
  logoUnderline: {
    width: 60,
    height: 4,
    backgroundColor: theme.button.primary,
    borderRadius: 2,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    color: theme.text.secondary,
    marginBottom: 64,
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: theme.button.primary,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 16,
    minWidth: 240,
    alignItems: 'center',
    shadowColor: theme.button.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: theme.button.primaryText,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    paddingBottom: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: theme.text.secondary,
    textAlign: 'center',
  },
});
