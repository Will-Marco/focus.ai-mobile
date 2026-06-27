import React, { useMemo } from 'react';
import { Canvas, Path, Skia, LinearGradient, vec, BlurMask } from '@shopify/react-native-skia';
import { useUnistyles } from 'react-native-unistyles';

export interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  /** 0..1 */
  progress?: number;
  /** berilsa — solid rang (habit mini-ring); aks holda Ember gradient (embGrad). */
  color?: string;
  /** track (orqa halqa) opacity — dizayn: katta .07, mini .08. */
  trackOpacity?: number;
  /** gradient ringda drop-shadow glow (katta sessiya ring uchun). */
  glow?: boolean;
}

/**
 * Skia dumaloq progress ring (EMBER). To'liq oval path + `start`/`end` trim bilan
 * progress arc chiziladi. 12 soatdan (rotate -90) soat strelkasi yo'nalishida to'ladi.
 */
export function ProgressRing({
  size = 300,
  strokeWidth = 16,
  progress = 0,
  color,
  trackOpacity = 0.08,
  glow = false,
}: ProgressRingProps) {
  const { theme } = useUnistyles();
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const p = Math.max(0, Math.min(1, progress));
  const gradient = [...theme.colors.gradientRing];

  // Path AYNAN tepadan (-90°) soat strelkasi yo'nalishida quriladi (addArc).
  // Shunday qilib trim (start/end) ham tepadan boshlanadi — rotate kerak emas.
  const ring = useMemo(() => {
    const path = Skia.Path.Make();
    path.addArc(Skia.XYWHRect(cx - r, cy - r, r * 2, r * 2), -90, 360);
    return path;
  }, [cx, cy, r]);

  return (
    <Canvas style={{ width: size, height: size }}>
      <Path
        path={ring}
        style="stroke"
        strokeWidth={strokeWidth}
        color={`rgba(255,255,255,${trackOpacity})`}
      />
      {/* drop-shadow glow qatlam (dizayn: 0 0 14px rgba(242,160,76,.6)) */}
      {glow && !color ? (
        <Path
          path={ring}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          start={0}
          end={p}
          opacity={0.6}
        >
          <LinearGradient start={vec(0, 0)} end={vec(size, size)} colors={gradient} />
          <BlurMask blur={7} style="normal" />
        </Path>
      ) : null}
      <Path
        path={ring}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
        start={0}
        end={p}
        color={color}
      >
        {color ? null : <LinearGradient start={vec(0, 0)} end={vec(size, size)} colors={gradient} />}
      </Path>
    </Canvas>
  );
}
