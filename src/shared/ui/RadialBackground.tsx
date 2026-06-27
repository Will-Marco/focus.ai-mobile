import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Rect, RadialGradient, vec } from '@shopify/react-native-skia';

export interface RadialBackgroundProps {
  /** markazdan tashqariga ranglar (dizayn: #3a2410 → #1f140b → #120c08). */
  colors: string[];
  positions?: number[];
  /** gradient markazi (ekran nisbatida, 0..1; manfiy ham mumkin). Default: sessiya (0.5, -0.06). */
  center?: { x: number; y: number };
  /** radius = width * radiusScale (dizayn: 120% → 1.2). */
  radiusScale?: number;
}

/**
 * Skia radial gradient fon (Faol sessiya + Onboarding ekranlari).
 * Dizayn: radial-gradient(120% 80% at 50% -6%) — markaz tepada,
 * iliq yorug'lik markazdan pastga tarqaladi. Onboarding: markaz (50%, 8%).
 */
export function RadialBackground({
  colors,
  positions,
  center = { x: 0.5, y: -0.06 },
  radiusScale = 1.2,
}: RadialBackgroundProps) {
  const { width, height } = useWindowDimensions();
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Rect x={0} y={0} width={width} height={height}>
        <RadialGradient
          c={vec(width * center.x, height * center.y)}
          r={width * radiusScale}
          colors={colors}
          positions={positions}
        />
      </Rect>
    </Canvas>
  );
}
