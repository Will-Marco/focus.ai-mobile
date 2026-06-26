import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { ProgressRing, Text, PlayIcon, PauseIcon } from '@shared/ui';
import { habitColorHex } from '@shared/theme';
import { formatClock } from '@shared/lib/time/formatClock';
import { useHabitStore } from '@entities/habit';
import { remainingMs } from '@entities/session';
import { useSessionTimer } from '@features/run-session';

export interface ActiveSessionBannerProps {
  sessionId: string;
  onPress: () => void;
}

export function ActiveSessionBanner({ sessionId, onPress }: ActiveSessionBannerProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const timer = useSessionTimer(sessionId);
  const habit = useHabitStore((s) =>
    s.habits.find((h) => h.id === timer.session?.habitId),
  );
  if (!timer.session) return null;

  const accent = habit ? habitColorHex(habit.color) : theme.colors.brand;
  const left = remainingMs(timer.elapsed, timer.session.targetMin);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.banner}>
      <View style={styles.ringWrap}>
        <ProgressRing size={48} strokeWidth={5} progress={timer.progress} />
        <View style={styles.ringCenter}>
          {timer.running ? (
            <PlayIcon size={14} color={accent} />
          ) : (
            <PauseIcon size={14} color={accent} />
          )}
        </View>
      </View>
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {habit?.name ?? ''}
        </Text>
        <Text variant="caption">
          {timer.running ? t('dashboard.activeNow') : t('session.pause')} · {formatClock(left)}
        </Text>
      </View>
      <Text variant="mono" style={[styles.pct, { color: accent }]}>
        {Math.round(timer.progress * 100)}%
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(3),
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.xl,
    padding: theme.spacing(3),
  },
  ringWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute' },
  info: { flex: 1, gap: 2 },
  name: { fontFamily: theme.fontFamily.semibold, fontSize: theme.fontSize.md, color: theme.colors.textStrong },
  pct: { fontSize: theme.fontSize.lg },
}));
