import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Canvas, Circle, SweepGradient, vec, BlurMask } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native-unistyles';
import { SparkleIcon } from './icons';

const BLUR = 7;

/** Yadro ichidagi uchta yulduzcha — o'lchami/joyi `inner` ga nisbatan (0..1),
 *  shuning uchun `size` o'zgarsa kompozitsiya proporsional qoladi.
 *  Katta yulduz markazdan biroz chap-pastda, ikkita kichigi o'ngda — AI sparkle naqshi. */
const SPARKS = [
  { x: 0.11, y: 0.23, scale: 0.6, opacity: 1 },
  { x: 0.48, y: 0.17, scale: 0.34, opacity: 0.9 },
  { x: 0.55, y: 0.55, scale: 0.26, opacity: 0.75 },
] as const;

export interface AiOrbProps {
  size?: number;
}

/** AI Murabbiy belgisi — aylanuvchi conic glow (Skia sweep) + gradient yadro + sparkle. */
export function AiOrb({ size = 40 }: AiOrbProps) {
  const inner = Math.round(size * 0.85);
  const glow = size + 8;
  // Canvas glow'dan kattaroq: BlurMask doira chetidan TASHQARIGA ham tarqaladi va
  // canvas aynan doira o'lchamida bo'lsa burchaklarni bo'yab yuboradi — aylanganda
  // bu romb bo'lib ko'rinardi (iOS). Blur radiusiga ikki tomonlama zapas.
  const canvas = glow + BLUR * 4;
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1, false);
  }, [spin]);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* eslint-disable-next-line react-native/no-inline-styles -- o'lcham dinamik + animatsion */}
      <Animated.View style={[{ position: 'absolute', width: canvas, height: canvas, opacity: 0.5 }, spinStyle]} pointerEvents="none">
        <Canvas style={{ width: canvas, height: canvas }}>
          <Circle cx={canvas / 2} cy={canvas / 2} r={glow / 2}>
            <SweepGradient c={vec(canvas / 2, canvas / 2)} colors={['#F7D98A', '#F2603E', '#F2A24C', '#F7D98A']} />
            <BlurMask blur={BLUR} style="normal" />
          </Circle>
        </Canvas>
      </Animated.View>
      <LinearGradient
        colors={['#F7D98A', '#F2603E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: inner, height: inner, borderRadius: inner / 2 }}
      >
        {SPARKS.map((s) => (
          // eslint-disable-next-line react-native/no-inline-styles -- joylashuv dinamik
          <View key={s.scale} style={{ position: 'absolute', left: s.x * inner, top: s.y * inner, opacity: s.opacity }}>
            <SparkleIcon size={Math.round(s.scale * inner)} color="#1f140b" />
          </View>
        ))}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  center: { alignItems: 'center', justifyContent: 'center' },
}));
