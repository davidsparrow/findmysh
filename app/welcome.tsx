import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 48,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
