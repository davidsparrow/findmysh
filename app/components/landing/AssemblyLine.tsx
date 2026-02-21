import { View, Text, StyleSheet } from 'react-native';

const C = {
  bg: '#0f172a',
  card: '#1e293b',
  cardDeep: '#151f2e',
  border: '#334155',
  borderMid: '#475569',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textFaint: '#475569',
  violet: '#A788FA',
  emerald: '#50D395',
  orange: '#F8923C',
  navy: '#0A2540',
};

function StorageBox() {
  return (
    <View style={styles.storageCol}>
      <View style={styles.storageBox}>
        <View style={styles.serverRow}>
          <View style={styles.serverDot} />
          <View style={styles.serverLines}>
            <View style={[styles.serverLine, { width: 20 }]} />
            <View style={[styles.serverLine, { width: 14 }]} />
          </View>
        </View>
        <View style={styles.serverRow}>
          <View style={[styles.serverDot, { backgroundColor: C.orange }]} />
          <View style={styles.serverLines}>
            <View style={[styles.serverLine, { width: 16 }]} />
            <View style={[styles.serverLine, { width: 20 }]} />
          </View>
        </View>
        <View style={styles.serverRow}>
          <View style={[styles.serverDot, { backgroundColor: C.violet }]} />
          <View style={styles.serverLines}>
            <View style={[styles.serverLine, { width: 22 }]} />
            <View style={[styles.serverLine, { width: 12 }]} />
          </View>
        </View>
        <View style={styles.statusDot} />
      </View>
      <Text style={styles.boxLabel}>STORAGE</Text>
    </View>
  );
}

function Belt() {
  return (
    <View style={styles.beltContainer}>
      <View style={styles.beltTrack} />
      <View style={styles.beltRollers}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.beltRoller} />
        ))}
      </View>
    </View>
  );
}

function ScannerColumn() {
  return (
    <View style={styles.scannerCol}>
      <View style={styles.monitor}>
        <View style={styles.monitorScreen}>
          <Text style={styles.monitorText}>findmysh</Text>
          <View style={styles.monitorCursor} />
        </View>
        <View style={styles.monitorStand} />
      </View>

      <View style={styles.cable} />

      <View style={styles.scannerWrapper}>
        <View style={styles.archTop}>
          <View style={styles.archIndicator} />
          <View style={[styles.archIndicator, { backgroundColor: C.orange }]} />
        </View>

        <View style={styles.scanZone}>
          <View style={styles.glowBeam} />
          <View style={styles.docCard}>
            <View style={styles.docGlow} />
            <View style={[styles.docLine, { width: '100%' }]} />
            <View style={[styles.docLine, { width: '85%' }]} />
            <View style={[styles.docLine, { width: '60%' }]} />
            <View style={[styles.docLine, { width: '90%' }]} />
            <View style={[styles.docLine, { width: '40%' }]} />
          </View>
          <View style={styles.sparkLeft} />
          <View style={[styles.sparkRight, { bottom: 10, right: 10 }]} />
        </View>

        <View style={styles.archBottom} />
      </View>
    </View>
  );
}

function IndexPhone() {
  return (
    <View style={styles.phoneCol}>
      <View style={styles.phone}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneScreen}>
          <View style={styles.phoneSearchIcon}>
            <View style={styles.phoneSearchCircle} />
            <View style={styles.phoneSearchHandle} />
          </View>
          <View style={styles.phoneScanLine} />
        </View>
      </View>
      <Text style={styles.boxLabel}>INDEX</Text>
    </View>
  );
}

export function AssemblyLine() {
  return (
    <View style={styles.root}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>AI ENHANCED SEARCH</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.assemblyRow}>
          <StorageBox />
          <Belt />
          <ScannerColumn />
          <Belt />
          <IndexPhone />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  badge: {
    alignSelf: 'center',
    marginBottom: -14,
    zIndex: 10,
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
  card: {
    backgroundColor: C.cardDeep,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  assemblyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  storageCol: {
    alignItems: 'center',
    gap: 8,
  },
  storageBox: {
    width: 72,
    height: 88,
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: C.borderMid,
    borderRadius: 10,
    padding: 8,
    justifyContent: 'space-evenly',
  },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 3,
    padding: 4,
    gap: 4,
  },
  serverDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.emerald,
  },
  serverLines: {
    flex: 1,
    gap: 2,
  },
  serverLine: {
    height: 2,
    backgroundColor: C.borderMid,
    borderRadius: 1,
  },
  statusDot: {
    position: 'absolute',
    bottom: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.emerald,
  },
  boxLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },

  beltContainer: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    marginHorizontal: 4,
    minWidth: 32,
  },
  beltTrack: {
    height: 3,
    backgroundColor: C.border,
    borderRadius: 2,
  },
  beltRollers: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  beltRoller: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.borderMid,
    marginTop: -2,
    borderWidth: 1,
    borderColor: C.border,
  },

  scannerCol: {
    alignItems: 'center',
  },
  monitor: {
    alignItems: 'center',
  },
  monitorScreen: {
    width: 90,
    height: 52,
    backgroundColor: C.navy,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  monitorText: {
    color: C.violet,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  monitorCursor: {
    width: 6,
    height: 2,
    backgroundColor: C.violet,
    borderRadius: 1,
    marginTop: 4,
    opacity: 0.7,
  },
  monitorStand: {
    width: 24,
    height: 5,
    backgroundColor: C.borderMid,
    borderRadius: 2,
    marginTop: 2,
  },
  cable: {
    width: 2,
    height: 14,
    backgroundColor: C.violet,
    opacity: 0.5,
    borderRadius: 1,
  },
  scannerWrapper: {
    alignItems: 'center',
  },
  archTop: {
    width: 136,
    height: 14,
    backgroundColor: C.navy,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: C.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 5,
  },
  archIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.emerald,
  },
  scanZone: {
    width: 136,
    height: 86,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glowBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: C.violet,
    opacity: 0.85,
    top: '42%',
  },
  docCard: {
    width: 42,
    height: 54,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.violet,
    borderRadius: 4,
    padding: 7,
    gap: 5,
    justifyContent: 'center',
    zIndex: 2,
  },
  docGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 4,
    backgroundColor: C.violet,
    opacity: 0.08,
  },
  docLine: {
    height: 2,
    backgroundColor: C.textMuted,
    borderRadius: 1,
    opacity: 0.6,
  },
  sparkLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.emerald,
    opacity: 0.8,
  },
  sparkRight: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.orange,
    opacity: 0.8,
  },
  archBottom: {
    width: 136,
    height: 6,
    backgroundColor: C.navy,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: C.border,
  },

  phoneCol: {
    alignItems: 'center',
    gap: 8,
  },
  phone: {
    width: 54,
    height: 88,
    backgroundColor: '#000',
    borderRadius: 14,
    borderWidth: 3,
    borderColor: C.borderMid,
    alignItems: 'center',
    paddingTop: 7,
    overflow: 'hidden',
  },
  phoneNotch: {
    width: 20,
    height: 3,
    backgroundColor: C.card,
    borderRadius: 2,
    marginBottom: 5,
  },
  phoneScreen: {
    width: 38,
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  phoneSearchIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneSearchCircle: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.violet,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  phoneSearchHandle: {
    width: 5,
    height: 2,
    backgroundColor: C.violet,
    borderRadius: 1,
    position: 'absolute',
    bottom: 0,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  phoneScanLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: C.violet,
    top: '55%',
    opacity: 0.6,
  },
});
