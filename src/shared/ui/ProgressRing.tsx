import React, { useMemo } from 'react';
import {
  Canvas,
  Path,
  Skia,
  LinearGradient,
  vec,
  BlurMask,
} from '@shopify/react-native-skia';
import { useUnistyles } from 'react-native-unistyles';

export interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  /** 0..1 */
  progress?: number;
}

/**
 * Skia dumaloq progress ring (EMBER) — gradient stroke + glow.
 * M1 da statik; M2 da useClock + useDerivedValue bilan UI-thread animatsiya qo'shiladi.
 */
export function ProgressRing({
  size = 300,
  strokeWidth = 16,
  progress = 0,
}: ProgressRingProps) {
  const { theme } = useUnistyles();
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const p = Math.max(0, Math.min(1, progress));

  const track = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(cx, cy, r);
    return path;
  }, [cx, cy, r]);

  const arc = useMemo(() => {
    const path = Skia.Path.Make();
    const oval = Skia.XYWHRect(cx - r, cy - r, r * 2, r * 2);
    path.addArc(oval, -90, 360 * p);
    return path;
  }, [cx, cy, r, p]);

  const colors = [...theme.colors.gradientRing];

  return (
    <Canvas style={{ width: size, height: size }}>
      <Path
        path={track}
        style="stroke"
        strokeWidth={strokeWidth}
        color={theme.colors.border}
      />
      <Path
        path={arc}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
        opacity={0.55}
      >
        <LinearGradient
          start={vec(0, 0)}
          end={vec(size, size)}
          colors={colors}
        />
        <BlurMask blur={12} style="normal" />
      </Path>
      <Path
        path={arc}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
      >
        <LinearGradient
          start={vec(0, 0)}
          end={vec(size, size)}
          colors={colors}
        />
      </Path>
    </Canvas>
  );
}
