import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Animated wrapper'ga plain style (Unistyles emas — Reanimated bilan konflikt).
const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 100 } as const;
const KNOB = { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' } as const;

export interface SwitchProps {
  value: boolean;
  onChange: (next: boolean) => void;
  accessibilityLabel?: string;
}

/** Brend gradientli toggle — yoqilganda gradient to'ldiriladi, knob siljiydi. */
export function Switch({ value, onChange, accessibilityLabel }: SwitchProps) {
  const { theme } = useUnistyles();
  const v = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(value ? 1 : 0, { duration: 220 });
  }, [value, v]);
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: v.value * 20 }] }));
  const fillStyle = useAnimatedStyle(() => ({ opacity: v.value }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onChange(!value)}
      style={styles.track}
    >
      <Animated.View style={[FILL, fillStyle]} pointerEvents="none">
        <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fillInner} />
      </Animated.View>
      <Animated.View style={[KNOB, knobStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 3,
    justifyContent: 'center',
    backgroundColor: `rgba(${theme.colors.trackRgb},0.12)`,
  },
  fillInner: { flex: 1, borderRadius: 14 },
}));
