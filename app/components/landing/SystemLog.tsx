import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const C = {
  bg: '#050a12',
  border: '#1e2d3d',
  textFaint: '#475569',
  textMuted: '#64748b',
  violet: '#A788FA',
  emerald: '#50D395',
  orange: '#F8923C',
  blue: '#60A5FA',
  white: '#f1f5f9',
};

type LogColor = 'violet' | 'emerald' | 'orange' | 'blue' | 'white' | 'muted';

interface LogLine {
  time: string;
  text: string;
  color: LogColor;
}

const LOG_POOL: Array<{ text: string; color: LogColor }> = [
  { text: '[INFO] Daemon initialized', color: 'emerald' },
  { text: 'REQUESTING_PERMISSIONS...', color: 'blue' },
  { text: '[SCAN] Mounted volume: /User/Docs', color: 'violet' },
  { text: 'ENUMERATING file system...', color: 'white' },
  { text: '> Found 142 documents', color: 'muted' },
  { text: 'PROCESSING_FILES_INTAKE...', color: 'white' },
  { text: '> Parsing PDF structure', color: 'muted' },
  { text: 'EXTRACTING_TEXT (OCR_ENGINE_V2)', color: 'orange' },
  { text: 'TAGGING: detected 4 concepts', color: 'violet' },
  { text: 'EMBEDDING: vector dim=1536', color: 'blue' },
  { text: 'SAVING: /User/Docs/report.pdf', color: 'emerald' },
  { text: '[CACHE] Hit rate: 94.2%', color: 'emerald' },
  { text: 'PROCESSING_PHOTOS...', color: 'white' },
  { text: '> Analyzing EXIF metadata', color: 'muted' },
  { text: 'SCAN_COMPLETE: /Downloads', color: 'violet' },
  { text: 'NEXT_ITEM: 87 remaining', color: 'muted' },
  { text: 'INDEXING_BATCH_42...', color: 'white' },
  { text: '> Sleeping worker thread 500ms', color: 'muted' },
];

const COLOR_MAP: Record<LogColor, string> = {
  violet: C.violet,
  emerald: C.emerald,
  orange: C.orange,
  blue: C.blue,
  white: C.white,
  muted: C.textMuted,
};

function getTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const INITIAL_LINES: LogLine[] = LOG_POOL.slice(0, 5).map((l, i) => ({
  time: `10:42:0${i}`,
  text: l.text,
  color: l.color,
}));

export function SystemLog() {
  const [lines, setLines] = useState<LogLine[]>(INITIAL_LINES);
  const scrollRef = useRef<ScrollView>(null);
  const poolIndex = useRef(5);

  useEffect(() => {
    const interval = setInterval(() => {
      const entry = LOG_POOL[poolIndex.current % LOG_POOL.length];
      poolIndex.current += 1;
      setLines((prev) => {
        const next = [...prev, { time: getTime(), text: entry.text, color: entry.color }];
        return next.length > 10 ? next.slice(next.length - 10) : next;
      });
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [lines]);

  return (
    <View style={styles.terminal}>
      <View style={styles.terminalHeader}>
        <Text style={styles.terminalTitle}>SYSTEM LOG /// PID: 8842</Text>
        <View style={styles.trafficLights}>
          <View style={[styles.light, { backgroundColor: '#ef4444' }]} />
          <View style={[styles.light, { backgroundColor: '#f59e0b' }]} />
          <View style={[styles.light, { backgroundColor: '#22c55e' }]} />
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.logBody}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {lines.map((line, i) => (
          <View key={i} style={styles.logLine}>
            <Text style={styles.logTime}>{line.time}</Text>
            <Text style={[styles.logText, { color: COLOR_MAP[line.color] }]}>{line.text}</Text>
          </View>
        ))}
        <View style={styles.cursor} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  terminal: {
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginTop: 16,
    height: 130,
  },
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  terminalTitle: {
    color: C.textFaint,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  trafficLights: {
    flexDirection: 'row',
    gap: 5,
  },
  light: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logLine: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 3,
  },
  logTime: {
    color: C.textFaint,
    fontSize: 10,
    fontWeight: '500',
    minWidth: 54,
  },
  logText: {
    fontSize: 10,
    fontWeight: '500',
    flex: 1,
  },
  cursor: {
    width: 6,
    height: 10,
    backgroundColor: C.violet,
    opacity: 0.7,
    borderRadius: 1,
    marginTop: 2,
  },
});
