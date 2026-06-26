import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { Button, ProgressRing, Text, PlayIcon } from '@shared/ui';
import { habitColorHex } from '@shared/theme';
import { formatClock } from '@shared/lib/time/formatClock';
import { useHabitStore } from '@entities/habit';
import { remainingMs, useSessionStore } from '@entities/session';
import { useSessionTimer } from '../model/useSessionTimer';
import { DURATION_PRESETS, DEFAULT_SESSION_MIN } from '../config/presets';

export interface SessionViewProps {
  habitId: string;
  sessionId?: string;
  onClose: () => void;
}

export function SessionView({ habitId, sessionId: initialId, onClose }: SessionViewProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const habit = useHabitStore((s) => s.habits.find((h) => h.id === habitId));
  const start = useSessionStore((s) => s.start);
  const pause = useSessionStore((s) => s.pause);
  const resume = useSessionStore((s) => s.resume);
  const finish = useSessionStore((s) => s.finish);

  const [sessionId, setSessionId] = useState(initialId);
  const [targetMin, setTargetMin] = useState(DEFAULT_SESSION_MIN);
  const [showRemaining, setShowRemaining] = useState(true);

  const timer = useSessionTimer(sessionId);
  const accent = habit ? habitColorHex(habit.color) : theme.colors.brand;

  // ---- SETUP fazasi: davomiylik tanlash ----
  if (!sessionId) {
    return (
      <View style={styles.center}>
        <Text variant="caption" style={styles.setupHabit}>
          {habit?.name ?? ''}
        </Text>
        <Text variant="title" style={styles.setupQuestion}>
          {t('session.setupQuestion')}
        </Text>
        <View style={styles.setupValue}>
          <Text variant="mono" style={styles.setupNumber}>
            {targetMin}
          </Text>
          <Text muted>{t('session.minutesShort')}</Text>
        </View>
        <View style={styles.presets}>
          {DURATION_PRESETS.map((m) => {
            const active = m === targetMin;
            return (
              <Pressable
                key={m}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setTargetMin(m)}
                style={[styles.preset, active && { borderColor: accent }]}
              >
                <Text style={[styles.presetTxt, active && { color: theme.colors.textStrong }]}>
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('session.start')}
          onPress={() => {
            const s = start({ habitId, targetMin });
            setSessionId(s.id);
          }}
          style={[styles.startBtn, { backgroundColor: accent }]}
        >
          <PlayIcon size={30} color={theme.colors.onBrand} />
        </Pressable>
      </View>
    );
  }

  // ---- ACTIVE fazasi ----
  const centerMs = showRemaining
    ? remainingMs(timer.elapsed, timer.session?.targetMin ?? targetMin)
    : timer.elapsed;
  const pct = Math.round(timer.progress * 100);

  const onFinish = async () => {
    await finish(sessionId);
    onClose();
  };

  return (
    <View style={styles.center}>
      {timer.complete ? (
        <Text variant="title" style={[styles.completeBanner, { color: theme.colors.gold }]}>
          {t('session.completed')}
        </Text>
      ) : (
        <Text variant="caption" style={styles.setupHabit}>
          {habit?.name ?? ''}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="toggle-time"
        onPress={() => setShowRemaining((v) => !v)}
        style={styles.ringWrap}
      >
        <ProgressRing size={300} strokeWidth={16} progress={timer.progress} />
        <View style={styles.ringCenter}>
          <Text variant="mono" style={styles.clock}>
            {formatClock(centerMs)}
          </Text>
          <Text variant="caption" style={styles.clockLabel}>
            {showRemaining ? t('session.remaining') : t('session.elapsed')}
          </Text>
        </View>
      </Pressable>

      <View style={styles.habitBar}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: accent }]} />
        </View>
        <Text variant="caption" style={styles.habitMeta}>
          {habit?.name} · {pct}%
        </Text>
      </View>

      <View style={styles.controls}>
        {timer.running ? (
          <Button
            variant="secondary"
            title={t('session.pause')}
            onPress={() => pause(sessionId)}
            style={styles.ctrl}
          />
        ) : (
          <Button
            variant="secondary"
            title={t('session.resume')}
            onPress={() => resume(sessionId)}
            style={styles.ctrl}
          />
        )}
        <Button title={timer.complete ? t('session.close') : t('session.finish')} onPress={onFinish} style={styles.ctrl} />
      </View>

      {timer.complete ? (
        <Text variant="caption" style={styles.overtime}>
          {t('session.overtimeNote')}
        </Text>
      ) : (
        <Text variant="caption" style={styles.overtime}>
          {t('session.awayHint')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing(4), padding: theme.spacing(5) },
  setupHabit: { textTransform: 'uppercase', letterSpacing: 1 },
  setupQuestion: { textAlign: 'center', fontSize: theme.fontSize.xl },
  setupValue: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing(2) },
  setupNumber: { fontSize: theme.fontSize.timerLg, color: theme.colors.textStrong },
  presets: { flexDirection: 'row', gap: theme.spacing(3) },
  preset: {
    width: 64,
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetTxt: { fontFamily: theme.fontFamily.monoMedium, color: theme.colors.textMuted, fontSize: theme.fontSize.lg },
  startBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
  completeBanner: { fontSize: theme.fontSize.xl },
  ringWrap: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  clock: { fontSize: theme.fontSize.timerLg, color: theme.colors.textStrong },
  clockLabel: { letterSpacing: 2 },
  habitBar: { width: '100%', gap: theme.spacing(2) },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: theme.colors.surfaceStrong, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  habitMeta: { textAlign: 'center' },
  controls: { flexDirection: 'row', gap: theme.spacing(3), width: '100%' },
  ctrl: { flex: 1 },
  overtime: { textAlign: 'center' },
}));
