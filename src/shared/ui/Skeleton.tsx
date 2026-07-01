import React from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { usePulse } from '@shared/lib/animation/usePulse';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  /** Plain (Unistyles EMAS) qo'shimcha style — Animated.View'ga uzatiladi. */
  style?: object;
}

// Pulsatsiyalanuvchi placeholder (>300ms yuklanishда — bo'sh ekran o'rniga).
// ⚠️ Animated.View'ga Unistyles style BERILMAYDI (xotira: reanimated-unistyles-conflict)
// — rang useUnistyles'дан plain qiymat sifatida olinadi.
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const { theme } = useUnistyles();
  const pulse = usePulse(0.4, 0.85, 900);
  const anim = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: theme.colors.surfaceStrong }, style, anim]}
    />
  );
}

// Guruh kartasi skeleti (Team ro'yxati).
export function GroupCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={140} height={16} radius={6} />
      <View style={styles.cardFooter}>
        <Skeleton width={70} height={12} radius={6} />
      </View>
    </View>
  );
}

// A'zo qatori skeleti (Team detail).
export function MemberRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={40} height={40} radius={20} />
      <View style={styles.rowText}>
        <Skeleton width={120} height={14} radius={6} />
        <Skeleton width={80} height={11} radius={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 14,
  },
  cardFooter: { flexDirection: 'row' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 13 },
  rowText: { flex: 1, gap: 6 },
}));
