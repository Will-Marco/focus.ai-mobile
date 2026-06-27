import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { ProgressRing, Text, PlayIcon } from '@shared/ui';
import { habitColorHex } from '@shared/theme';
import { formatSpent } from '@shared/lib/time/formatSpent';
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
  const targetH = habit.targetMinutes / 60;

  const typeLabel =
    habit.type === 'cumulative'
      ? t('addHabit.typeCumulative')
      : t(`addHabit.period${habit.period![0].toUpperCase()}${habit.period!.slice(1)}`);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.ringWrap}>
        <View style={styles.ringFill}>
          <ProgressRing size={52} strokeWidth={5} progress={progress} color={accent} />
        </View>
        <Text variant="mono" style={styles.pct}>
          {pct}%
        </Text>
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {habit.name}
        </Text>
        <Text numberOfLines={1} style={styles.sub}>
          {typeLabel} · {targetH % 1 === 0 ? targetH : targetH.toFixed(1)} {t('addHabit.hoursUnit')} ·{' '}
          {formatSpent(elapsedMs)}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('session.start')}
        onPress={onStart}
        style={styles.play}
      >
        <PlayIcon size={13} color={theme.colors.gold} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 14,
  },
  ringWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  ringFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  pct: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 12, color: theme.colors.textStrong },
  info: { flex: 1, minWidth: 0 },
  name: { fontFamily: theme.fontFamily.bold, fontSize: 16, color: theme.colors.textStrong },
  sub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  play: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
