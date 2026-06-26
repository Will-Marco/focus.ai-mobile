import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { ProgressRing, Text, HabitIcon, PlayIcon } from '@shared/ui';
import { habitColorHex } from '@shared/theme';
import { useHabitProgress } from '@entities/session';
import type { Habit } from '@entities/habit';

export interface HabitCardProps {
  habit: Habit;
  refreshKey: number;
  onPress: () => void;
  onStart: () => void;
}

export function HabitCard({ habit, refreshKey, onPress, onStart }: HabitCardProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { progress, elapsedMs } = useHabitProgress(
    {
      habitId: habit.id,
      type: habit.type,
      period: habit.period,
      targetMinutes: habit.targetMinutes,
    },
    refreshKey,
  );
  const accent = habitColorHex(habit.color);
  const pct = Math.round(progress * 100);
  const spentMin = Math.floor(elapsedMs / 60_000);
  const targetH = habit.targetMinutes / 60;

  const typeLabel =
    habit.type === 'cumulative'
      ? t('addHabit.typeCumulative')
      : t(`addHabit.period${habit.period![0].toUpperCase()}${habit.period!.slice(1)}`);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.ringWrap}>
        <ProgressRing size={52} strokeWidth={5} progress={progress} />
        <View style={styles.ringCenter}>
          <HabitIcon name={habit.icon} size={20} color={accent} />
        </View>
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {habit.name}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {typeLabel} · {targetH % 1 === 0 ? targetH : targetH.toFixed(1)} {t('addHabit.hoursUnit')} ·{' '}
          {spentMin} daq · {pct}%
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('session.start')}
        onPress={onStart}
        style={[styles.play, { backgroundColor: accent }]}
      >
        <PlayIcon size={18} color={theme.colors.onBrand} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(3),
  },
  ringWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute' },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: theme.fontFamily.semibold, fontSize: theme.fontSize.md, color: theme.colors.textStrong },
  play: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
