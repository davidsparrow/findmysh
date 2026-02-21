import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { AssemblyLine } from './components/landing/AssemblyLine';
import { SystemLog } from './components/landing/SystemLog';
import { WaitlistForm } from './components/landing/WaitlistForm';

const C = {
  bg: '#0b1120',
  navBorder: '#1e2d3d',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  violet: '#A788FA',
  orange: '#F8923C',
};

function NavBar({ isDesktop }: { isDesktop: boolean }) {
  return (
    <View style={styles.nav}>
      <View style={styles.navLogo}>
        <View style={styles.logoMark}>
          <View style={styles.logoRing} />
          <View style={styles.logoRingInner} />
          <View style={styles.logoDot} />
        </View>
        <Text style={styles.logoText}>FindMySh</Text>
      </View>

      {isDesktop && (
        <View style={styles.navLinks}>
          {['Manifesto', 'Technology', 'Privacy'].map((item) => (
            <TouchableOpacity key={item}>
              <Text style={styles.navLinkText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.settingsBtn}>
        <Text style={styles.settingsIcon}>⚙</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function LandingPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <View style={styles.root}>
      <View style={styles.glowTopLeft} />
      <View style={styles.glowBottomRight} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <NavBar isDesktop={isDesktop} />

        <View style={[styles.main, { maxWidth: isDesktop ? 1160 : 560 }]}>
          <View style={styles.hero}>
            <Text style={[styles.heroTitle, { fontSize: isDesktop ? 58 : 38, lineHeight: isDesktop ? 68 : 46 }]}>
              Take back Search,{'\n'}
              <Text style={styles.heroAccent}>it misses you.</Text>
            </Text>
            <Text style={styles.heroSub}>
              Your data isn't a product. It's yours. Index your digital life
              {isDesktop ? '\n' : ' '}
              locally, privately, and securely.
            </Text>
          </View>

          <View style={[styles.grid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            <View style={[styles.leftPanel, isDesktop && styles.leftPanelDesktop]}>
              <AssemblyLine />
              <SystemLog />
            </View>

            <View style={[styles.rightPanel, isDesktop && styles.rightPanelDesktop]}>
              <WaitlistForm />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  glowTopLeft: {
    position: 'absolute',
    top: -140,
    left: -140,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: C.violet,
    opacity: 0.05,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: C.orange,
    opacity: 0.03,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.navBorder,
  },
  navLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: C.violet,
    opacity: 0.7,
  },
  logoRingInner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.violet,
    opacity: 0.5,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.violet,
  },
  logoText: {
    color: C.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 28,
  },
  navLinkText: {
    color: C.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  settingsBtn: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 18,
    color: C.textMuted,
  },
  main: {
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 52,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 52,
  },
  heroTitle: {
    fontWeight: '900',
    color: C.text,
    textAlign: 'center',
    letterSpacing: -2,
    marginBottom: 18,
  },
  heroAccent: {
    color: C.violet,
  },
  heroSub: {
    fontSize: 16,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 520,
  },
  grid: {
    gap: 40,
    alignItems: 'flex-start',
  },
  leftPanel: {
    width: '100%',
  },
  leftPanelDesktop: {
    flex: 55,
  },
  rightPanel: {
    width: '100%',
  },
  rightPanelDesktop: {
    flex: 45,
    paddingTop: 6,
  },
});
