import React from 'react';
import { Pressable, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { ProgressRing, Text, PlayIcon, PauseIcon } from '@shared/ui';
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
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === timer.session?.habitId));
  if (!timer.session) return null;

  const left = remainingMs(timer.elapsed, timer.session.targetMin);
  const state = timer.running ? t('dashboard.running') : t('dashboard.paused');

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <LinearGradient
        colors={[...theme.colors.bannerBg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.ringWrap}>
          <View style={styles.ringFill}>
            <ProgressRing
              size={48}
              strokeWidth={5}
              progress={timer.progress}
              color={theme.colors.brand}
              trackOpacity={0.1}
            />
          </View>
          <Text variant="mono" style={styles.pct}>
            {Math.round(timer.progress * 100)}%
          </Text>
        </View>

        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.name}>
            {habit?.name ?? ''} · {state}
          </Text>
          <Text variant="mono" style={styles.time}>
            {formatClock(left)} {t('dashboard.left')}
          </Text>
        </View>

        <View style={styles.play}>
          {timer.running ? (
            <PauseIcon size={15} color={theme.colors.textStrong} />
          ) : (
            <PlayIcon size={15} color={theme.colors.textStrong} />
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.bannerBorder,
  },
  ringWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  ringFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  pct: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 11, color: theme.colors.textStrong },
  info: { flex: 1, minWidth: 0 },
  name: { fontFamily: theme.fontFamily.bold, fontSize: 15, color: theme.colors.textStrong },
  time: { fontSize: 13, color: theme.colors.gold, marginTop: 2 },
  play: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: `rgba(${theme.colors.trackRgb},0.1)`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: theme.colors.textStrong, fontSize: 13 },
}));
