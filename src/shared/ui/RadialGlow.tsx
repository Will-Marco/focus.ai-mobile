import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Canvas, Circle, RadialGradient, vec, BlurMask } from '@shopify/react-native-skia';

export interface RadialGlowProps {
  size: number;
  /** markaz rangi (#RRGGBB) — chetga shaffof tarqaladi. */
  color: string;
  /** rang qaysi nisbatда shaffof bo'ladi (dizayn: 0.60–0.66). */
  spread?: number;
  /** Skia blur (dizayn: 26–40). */
  blur?: number;
  /** umumiy shaffoflik (dizayn: .14–.5). */
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

function toTransparent(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0)`;
}

/**
 * Dekorativ Skia blur glow doirasi (Onboarding/Auth iliq yorug'lik dog'lari).
 * `radial-gradient(circle, color, transparent N%)` + blur ning RN ekvivalenti.
 * Joylashuvni ota element `style` (absolute) orqali beradi.
 */
export function RadialGlow({
  size,
  color,
  spread = 0.64,
  blur = 34,
  opacity = 0.18,
  style,
}: RadialGlowProps) {
  return (
    <View pointerEvents="none" style={[{ width: size, height: size, opacity }, style]}>
      <Canvas style={{ width: size, height: size }}>
        <Circle cx={size / 2} cy={size / 2} r={size / 2}>
          <RadialGradient
            c={vec(size / 2, size / 2)}
            r={(size / 2) * spread}
            colors={[color, toTransparent(color)]}
          />
          <BlurMask blur={blur} style="normal" />
        </Circle>
      </Canvas>
    </View>
  );
}
