import { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Confetti } from './Confetti';

const C = {
  bg: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  borderFocus: '#A788FA',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textFaint: '#475569',
  violet: '#A788FA',
  orange: '#F8923C',
  emerald: '#50D395',
  error: '#f87171',
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const successScale = useRef(new Animated.Value(0.8)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  function animateSuccess() {
    setSuccess(true);
    setConfettiActive(true);
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => setConfettiActive(false), 2000);
  }

  async function handleSubmit() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/waitlist-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Apikey: SUPABASE_ANON_KEY ?? '',
        },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      animateSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PRIVATE BETA ACCESS</Text>
        </View>
      </View>

      <Text style={styles.heading}>Your search engine,{'\n'}running on your terms.</Text>
      <Text style={styles.subheading}>Search &amp; tag photos and files together</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email Address</Text>
        <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
          <Text style={styles.inputIcon}>✉</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor={C.textFaint}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!success}
          />
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.buttonArea}>
          <Confetti active={confettiActive} />

          {success ? (
            <Animated.View
              style={[
                styles.successBox,
                { transform: [{ scale: successScale }], opacity: successOpacity },
              ]}
            >
              <Text style={styles.successEmoji}>✓</Text>
              <View>
                <Text style={styles.successTitle}>You're on the list!</Text>
                <Text style={styles.successSub}>We'll reach out when your spot is ready.</Text>
              </View>
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Request Access  →'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footerMeta}>
          <Text style={styles.footerSmall}>
            Limited spots available. No credit card required.{' '}
            <Text style={styles.footerLink}>Terms</Text>.
          </Text>
          <Text style={styles.footerTag}>BUILT WITH SECURE TECHNOLOGIES</Text>
          <Text style={styles.footerCopy}>© 2023 FindMySh Inc. All rights reserved locally.</Text>
        </View>
      </View>

      <View style={styles.trustBadges}>
        <View style={styles.badge2}>
          <Text style={styles.badge2Icon}>⚙</Text>
          <Text style={styles.badge2Text}>RUST</Text>
        </View>
        <View style={styles.badge2}>
          <Text style={styles.badge2Icon}>🔒</Text>
          <Text style={styles.badge2Text}>AES-256</Text>
        </View>
        <View style={styles.badge2}>
          <Text style={styles.badge2Icon}>⊘</Text>
          <Text style={styles.badge2Text}>OFFLINE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: 420,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: C.orange,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.orange,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: C.text,
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 15,
    color: C.textMuted,
    marginBottom: 28,
    lineHeight: 22,
  },
  form: {
    gap: 0,
  },
  label: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1828',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 16,
  },
  inputWrapperFocused: {
    borderColor: C.violet,
  },
  inputIcon: {
    color: C.textFaint,
    fontSize: 14,
  },
  input: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    outlineStyle: 'none',
  } as any,
  errorText: {
    color: C.error,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
  buttonArea: {
    position: 'relative',
    marginBottom: 20,
  },
  button: {
    backgroundColor: C.violet,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  successBox: {
    backgroundColor: '#0d2818',
    borderWidth: 1,
    borderColor: C.emerald,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  successEmoji: {
    fontSize: 22,
    color: C.emerald,
    fontWeight: '700',
  },
  successTitle: {
    color: C.emerald,
    fontSize: 15,
    fontWeight: '700',
  },
  successSub: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  footerMeta: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 28,
  },
  footerSmall: {
    color: C.textFaint,
    fontSize: 12,
    textAlign: 'center',
  },
  footerLink: {
    color: '#60A5FA',
  },
  footerTag: {
    color: C.textFaint,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  footerCopy: {
    color: C.textFaint,
    fontSize: 11,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    opacity: 0.5,
  },
  badge2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badge2Icon: {
    color: C.textMuted,
    fontSize: 12,
  },
  badge2Text: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
