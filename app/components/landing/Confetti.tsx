import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const COLORS = ['#A788FA', '#50D395', '#F8923C', '#60A5FA', '#F472B6', '#FBBF24', '#34D399', '#FB923C'];

const PARTICLES = Array.from({ length: 36 }, (_, i) => ({
  color: COLORS[i % COLORS.length],
  size: 5 + (i % 5),
  xTarget: ((i % 2 === 0 ? 1 : -1) * (40 + (i * 19) % 180)),
  yTarget: -(90 + (i * 23) % 220),
  delay: (i * 18) % 280,
  spin: 180 + (i * 37) % 360,
  isSquare: i % 3 !== 0,
}));

export function Confetti({ active }: { active: boolean }) {
  const anims = useRef(
    PARTICLES.map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!active) return;

    anims.forEach((a) => {
      a.x.setValue(0);
      a.y.setValue(0);
      a.opacity.setValue(0);
      a.rotate.setValue(0);
      a.scale.setValue(0);
    });

    const animations = PARTICLES.map((p, i) => {
      const a = anims[i];
      return Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.spring(a.scale, {
            toValue: 1,
            friction: 6,
            tension: 200,
            useNativeDriver: true,
          }),
          Animated.timing(a.x, {
            toValue: p.xTarget,
            duration: 1100 + p.delay / 4,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(a.y, {
              toValue: p.yTarget,
              duration: 900 + p.delay / 4,
              useNativeDriver: true,
            }),
            Animated.timing(a.y, {
              toValue: p.yTarget + 40,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(a.opacity, { toValue: 1, duration: 60, useNativeDriver: true }),
            Animated.timing(a.opacity, { toValue: 0, duration: 500, delay: 550, useNativeDriver: true }),
          ]),
          Animated.timing(a.rotate, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.stagger(12, animations).start();
  }, [active]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {PARTICLES.map((p, i) => {
        const a = anims[i];
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              bottom: 0,
              alignSelf: 'center',
              width: p.size,
              height: p.size,
              borderRadius: p.isSquare ? 1 : p.size / 2,
              backgroundColor: p.color,
              transform: [
                { translateX: a.x },
                { translateY: a.y },
                { scale: a.scale },
                {
                  rotate: a.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', `${p.spin}deg`],
                  }),
                },
              ],
              opacity: a.opacity,
            }}
          />
        );
      })}
    </View>
  );
}
