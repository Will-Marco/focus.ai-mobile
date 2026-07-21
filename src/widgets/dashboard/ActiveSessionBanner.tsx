import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { GradientBox, ProgressRing, Text, PlayIcon, PauseIcon, TrashIcon } from '@shared/ui';
import { formatClock } from '@shared/lib/time/formatClock';
import { useHabitStore } from '@entities/habit';
import { remainingMs, useSessionStore } from '@entities/session';
import { useSessionTimer } from '@features/run-session';

export interface ActiveSessionBannerProps {
  sessionId: string;
  onPress: () => void;
  /** true = "Yakunlash" bilan pauzaga qo'yilgan (parked, 2026-07-08) — xiraroq
   * ko'rinish + o'chirish (trash) tugmasi. Faol (parked bo'lmagan) bannerda yo'q. */
  dim?: boolean;
}

export function ActiveSessionBanner({ sessionId, onPress, dim = false }: ActiveSessionBannerProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const timer = useSessionTimer(sessionId);
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === timer.session?.habitId));
  const discard = useSessionStore((s) => s.discard);
  if (!timer.session) return null;

  const left = remainingMs(timer.elapsed, timer.session.targetMin);
  const state = dim ? t('dashboard.saved') : timer.running ? t('dashboard.running') : t('dashboard.paused');

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <GradientBox colors={theme.colors.bannerBg} style={[styles.banner, dim && styles.bannerDim]}>
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

        {dim ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('dashboard.discardSession')}
            onPress={() => discard(sessionId)}
            style={styles.trash}
            hitSlop={8}
          >
            <TrashIcon size={15} color={theme.colors.textDim} />
          </Pressable>
        ) : null}

        <View style={styles.play}>
          {timer.running ? (
            <PauseIcon size={15} color={theme.colors.textStrong} />
          ) : (
            <PlayIcon size={15} color={theme.colors.textStrong} />
          )}
        </View>
      </GradientBox>
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
  bannerDim: { opacity: 0.6 },
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
  trash: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: theme.colors.textStrong, fontSize: 13 },
}));
