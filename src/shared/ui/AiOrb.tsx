import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Canvas, Circle, SweepGradient, vec, BlurMask } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native-unistyles';
import { SparkleIcon } from './icons';

export interface AiOrbProps {
  size?: number;
}

/** AI Murabbiy belgisi — aylanuvchi conic glow (Skia sweep) + gradient yadro + sparkle. */
export function AiOrb({ size = 40 }: AiOrbProps) {
  const inner = Math.round(size * 0.85);
  const glow = size + 8;
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1, false);
  }, [spin]);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  return (
    <View style={[styles.center, { width: size, height: size }]}>
      {/* eslint-disable-next-line react-native/no-inline-styles -- o'lcham dinamik + animatsion */}
      <Animated.View style={[{ position: 'absolute', width: glow, height: glow, opacity: 0.5 }, spinStyle]} pointerEvents="none">
        <Canvas style={{ width: glow, height: glow }}>
          <Circle cx={glow / 2} cy={glow / 2} r={glow / 2}>
            <SweepGradient c={vec(glow / 2, glow / 2)} colors={['#F7D98A', '#F2603E', '#F2A24C', '#F7D98A']} />
            <BlurMask blur={7} style="normal" />
          </Circle>
        </Canvas>
      </Animated.View>
      <LinearGradient
        colors={['#F7D98A', '#F2603E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        // eslint-disable-next-line react-native/no-inline-styles -- o'lcham dinamik
        style={{ width: inner, height: inner, borderRadius: inner / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <SparkleIcon size={Math.round(inner * 0.5)} color="#1f140b" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  center: { alignItems: 'center', justifyContent: 'center' },
}));
