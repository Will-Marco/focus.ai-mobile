import { useEffect } from 'react';
import {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

// Cheksiz ikki tomonlama pulse (breathe: scale 1↔1.02, glowPulse: opacity .35↔.7).
// durationMs — yarim sikl (to'liq nafas 2×). UI thread'da, re-render'siz.
export function usePulse(from: number, to: number, durationMs: number): SharedValue<number> {
  const value = useSharedValue(from);
  useEffect(() => {
    value.value = withRepeat(
      withTiming(to, { duration: durationMs, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [value, from, to, durationMs]);
  return value;
}
