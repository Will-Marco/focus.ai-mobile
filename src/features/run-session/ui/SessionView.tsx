import React, { useEffect, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  ZoomIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Canvas, Circle, RadialGradient, vec, BlurMask } from '@shopify/react-native-skia';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, CheckIcon, PlayIcon, ProgressRing, RadialGlow, Text } from '@shared/ui';
import { formatClock } from '@shared/lib/time/formatClock';
import { usePulse } from '@shared/lib/animation/usePulse';
import { useHabitStore } from '@entities/habit';
import { remainingMs, useHabitProgress, useSessionStore } from '@entities/session';
import { useSessionTimer } from '../model/useSessionTimer';
import { DURATION_PRESETS, DEFAULT_SESSION_MIN } from '../config/presets';
import { AwayView, FocusClockView } from './FocusModes';

export interface SessionViewProps {
  habitId: string;
  sessionId?: string;
  onClose: () => void;
}

// Animated.View'ga Unistyles style BERMA (crash) — plain const inline.
const GLOW_HALO = { position: 'absolute', width: 300, height: 300, alignItems: 'center', justifyContent: 'center' } as const;
const GOLD_HALO = { position: 'absolute', width: 310, height: 310, alignItems: 'center', justifyContent: 'center' } as const;
const CHECK_WRAP = { marginBottom: 10 } as const;

// Tabriklash zarrachalari (dizayn floatP: 10px↗-90px, scale .5→.25, opacity 0→1→0).
const PARTICLES = [
  { size: 13, left: 96, top: 84, color: '#F7D98A', dur: 2800, delay: 100 },
  { size: 9, right: 100, top: 96, color: '#F2A24C', dur: 3100, delay: 500 },
  { size: 11, left: 128, top: 64, color: '#F2603E', dur: 3400, delay: 900 },
  { size: 8, right: 128, top: 72, color: '#F7D98A', dur: 2900, delay: 1300 },
] as const;

interface ParticleProps {
  size: number;
  left?: number;
  right?: number;
  top: number;
  color: string;
  dur: number;
  delay: number;
}

function Particle({ size, left, right, top, color, dur, delay }: ParticleProps) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: dur, easing: Easing.out(Easing.ease) }), -1, false),
    );
  }, [p, dur, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.25, 1], [0, 1, 0]),
    transform: [{ translateY: 10 - 100 * p.value }, { scale: 0.5 - 0.25 * p.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        // eslint-disable-next-line react-native/no-inline-styles -- zarracha pozitsiyasi/rangi dinamik
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color, left, right, top },
        style,
      ]}
    />
  );
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
  const [overtime, setOvertime] = useState(false);
  const [away, setAway] = useState(false);

  // Focus Modes: landscape → Focus Clock (real, dimensions); face-down → Away
  // (hozircha tap-preview; M4'da nitro-sensors accelerometer bilan avtomatik).
  const { width, height } = useWindowDimensions();
  const landscape = width > height;

  const timer = useSessionTimer(sessionId);

  // Odat (umrlik/davriy) umumiy progressi — markazdagi thin bar (jonli sessiya qo'shiladi).
  const habitProg = useHabitProgress(
    {
      habitId,
      type: habit?.type ?? 'cumulative',
      period: habit?.period ?? null,
      targetMinutes: habit?.targetMinutes ?? 60,
    },
    0,
  );
  const targetH = (habit?.targetMinutes ?? 60) / 60;
  const odatMs = habitProg.elapsedMs + timer.elapsed;
  const odatProgress = Math.min(1, odatMs / ((habit?.targetMinutes ?? 60) * 60_000));
  const odatPct = Math.round(odatProgress * 100);

  // breathe (ring 1↔1.02, 5.5s) + glowPulse (halo, 3s) + tabriklash glow (2.4s)
  const breathe = usePulse(1, 1.02, 2750);
  const glow = usePulse(0.35, 0.7, 1500);
  const celebrate = usePulse(0.35, 0.6, 1200);
  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const celebrateStyle = useAnimatedStyle(() => ({ opacity: celebrate.value }));

  const header = (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('common.back')} onPress={onClose} style={styles.back}>
        <ChevronLeftIcon size={22} color={theme.colors.text} />
      </Pressable>
      <View style={styles.headerCenter}>
        <Text style={styles.activeLabel}>{t('session.activeLabel')}</Text>
        <Text style={styles.headerName} numberOfLines={1}>
          {habit?.name ?? ''}
        </Text>
      </View>
      <View style={styles.back} />
    </View>
  );

  const cornerGlows = (
    <>
      <RadialGlow size={320} color={theme.colors.brand} blur={30} opacity={0.18} spread={0.66} style={styles.glowLeft} />
      <RadialGlow size={260} color={theme.colors.brandCoral} blur={28} opacity={0.14} spread={0.66} style={styles.glowRight} />
    </>
  );

  // ---- SETUP fazasi ----
  if (!sessionId) {
    return (
      <View style={styles.root}>
        {cornerGlows}
        {header}
        <View style={styles.setup}>
          <View style={styles.setupCenter}>
            <Text style={styles.setupQuestion}>{t('session.setupQuestion')}</Text>
            <View style={styles.setupValue}>
              <Text variant="mono" style={styles.setupNumber}>
                {targetMin}
              </Text>
              <Text style={styles.setupUnit}> {t('session.minAbbr')}</Text>
            </View>
          </View>
          <View style={styles.chips}>
            {DURATION_PRESETS.map((m) => {
              const active = m === targetMin;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setTargetMin(m)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>
                    {m} {t('session.minAbbr')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.setupFooter}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('session.start')}
            onPress={() => {
              const s = start({ habitId, targetMin });
              setSessionId(s.id);
            }}
            style={styles.startWrap}
          >
            <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
              <PlayIcon size={20} color={theme.colors.onBrand} />
              <Text style={styles.startTxt}>{t('session.start')}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---- ACTIVE / COMPLETED fazasi ----
  const completed = timer.complete && !overtime;
  const tMin = timer.session?.targetMin ?? targetMin;
  const centerMs = completed ? timer.elapsed : showRemaining ? remainingMs(timer.elapsed, tMin) : timer.elapsed;

  const onFinish = async () => {
    await finish(sessionId);
    onClose();
  };

  // Focus Modes — alternativ ko'rinishlar (bir xil faol sessiya).
  if (away) {
    return <AwayView elapsedMs={timer.elapsed} onExit={() => setAway(false)} />;
  }
  if (landscape) {
    return (
      <FocusClockView
        habitName={habit?.name ?? ''}
        progress={timer.progress}
        elapsedMs={timer.elapsed}
        remainingMs={remainingMs(timer.elapsed, tMin)}
        targetMin={tMin}
      />
    );
  }

  return (
    <View style={styles.root}>
      {cornerGlows}
      {header}

      <View style={styles.ringZone}>
        {/* Glow halo (oddiy) yoki tabriklash glow */}
        {completed ? (
          <>
            <Animated.View style={[GOLD_HALO, celebrateStyle]} pointerEvents="none">
              <Canvas style={styles.goldCanvas}>
                <Circle cx={155} cy={155} r={155}>
                  <RadialGradient c={vec(155, 155)} r={96} colors={['#F2B45A', 'rgba(242,180,90,0)']} />
                  <BlurMask blur={34} style="normal" />
                </Circle>
              </Canvas>
            </Animated.View>
            {PARTICLES.map((p, i) => (
              <Particle key={i} {...p} />
            ))}
          </>
        ) : (
          <Animated.View style={[GLOW_HALO, glowStyle]} pointerEvents="none">
            <Canvas style={styles.glowCanvas}>
              <Circle cx={150} cy={150} r={150}>
                <RadialGradient c={vec(150, 150)} r={110} colors={['#F2A24C', 'rgba(242,162,76,0)']} />
                <BlurMask blur={28} style="normal" />
              </Circle>
            </Canvas>
          </Animated.View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="toggle-time"
          onPress={() => !completed && setShowRemaining((v) => !v)}
          style={styles.ringWrap}
        >
          <Animated.View style={breatheStyle}>
            <ProgressRing size={300} strokeWidth={16} progress={timer.progress} trackOpacity={0.07} glow />
          </Animated.View>
          <View style={styles.ringCenter} pointerEvents="none">
            {completed ? (
              <Animated.View entering={ZoomIn.duration(420)} style={CHECK_WRAP}>
                <LinearGradient colors={['#F7D98A', '#F2A24C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.checkInner}>
                  <CheckIcon size={24} color={theme.colors.onBrand} strokeWidth={3} />
                </LinearGradient>
              </Animated.View>
            ) : null}
            <Text style={styles.qoldiLabel}>
              {completed ? t('session.done') : showRemaining ? t('session.remaining') : t('session.elapsed')}
            </Text>
            <Text variant="mono" style={styles.clock}>
              {formatClock(centerMs)}
            </Text>
            <Text style={styles.subInfo}>
              {completed
                ? t('session.completed')
                : `${formatClock(timer.elapsed)} ${t('session.passed')} · ${tMin} ${t('session.fromMinutes')}`}
            </Text>
            <View style={styles.odatBarTrack}>
              <View style={[styles.odatBarFill, { width: 92 * odatProgress }]} />
            </View>
            <Text style={styles.odatTxt}>
              {t('session.habitLabel')} · {targetH % 1 === 0 ? targetH : targetH.toFixed(1)}{' '}
              {t('addHabit.hoursUnit')} · {odatPct}%
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.bottom}>
        <View style={styles.audioRow}>
          <View style={styles.audioChip}>
            <View style={styles.audioDot} />
            <Text style={styles.audioTxt}>{t('session.audioChip')}</Text>
          </View>
        </View>

        {completed ? (
          <>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={() => setOvertime(true)} style={styles.secondaryBtn}>
                <Text style={styles.secondaryTxt}>{t('session.resume')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onFinish} style={styles.primaryFlexWrap}>
                <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
                  <Text style={styles.primaryTxt}>{t('session.close')}</Text>
                </LinearGradient>
              </Pressable>
            </View>
            <Text style={styles.hint}>{t('session.overtimeNote')}</Text>
          </>
        ) : (
          <>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => (timer.running ? pause(sessionId) : resume(sessionId))}
                style={styles.primaryFlexWrap}
              >
                <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
                  <Text style={styles.primaryTxt}>{timer.running ? t('session.pause') : t('session.resume')}</Text>
                </LinearGradient>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onFinish} style={styles.finishBtn}>
                <Text style={styles.finishTxt}>{t('session.finish')}</Text>
              </Pressable>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('session.awayWord')} onPress={() => setAway(true)}>
              <Text style={styles.hint}>
                {t('session.awayPre')}
                <Text style={styles.awayWord}>{t('session.awayWord')}</Text>
                {t('session.awayPost')}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1 },
  glowLeft: { position: 'absolute', left: -70, top: 130 },
  glowRight: { position: 'absolute', right: -60, bottom: 150 },

  // HEADER
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 16 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center', gap: 2 },
  activeLabel: {
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: theme.colors.gold,
    fontFamily: theme.fontFamily.semibold,
  },
  headerName: { fontSize: 17, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong },

  // SETUP
  setup: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 30, paddingHorizontal: 30 },
  setupCenter: { alignItems: 'center' },
  setupQuestion: { fontSize: 15, color: theme.colors.text, marginBottom: 6 },
  setupValue: { flexDirection: 'row', alignItems: 'baseline' },
  setupNumber: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 64, color: theme.colors.textStrong, lineHeight: 66 },
  setupUnit: { fontSize: 22, color: theme.colors.textMuted },
  chips: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  chip: {
    flex: 1,
    height: 56,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { borderColor: theme.colors.brand, backgroundColor: 'rgba(242,162,76,0.12)' },
  chipTxt: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: theme.colors.textMuted },
  chipTxtActive: { color: theme.colors.textStrong },
  setupFooter: { paddingHorizontal: 22, paddingBottom: 30 },
  startWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: theme.colors.brandCoral,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  startBtn: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  startTxt: { fontSize: 17, fontFamily: theme.fontFamily.bold, color: theme.colors.onBrand },

  // ACTIVE
  ringZone: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glowCanvas: { width: 300, height: 300 },
  goldCanvas: { width: 310, height: 310 },
  ringWrap: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  checkInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F2B45A',
    shadowOpacity: 0.65,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  qoldiLabel: { fontSize: 11, letterSpacing: 2.2, color: theme.colors.gold },
  clock: { fontSize: 54, fontFamily: theme.fontFamily.monoSemibold, color: theme.colors.textStrong, marginTop: 2 },
  subInfo: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },
  odatBarTrack: { marginTop: 14, width: 92, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  odatBarFill: { height: 3, backgroundColor: theme.colors.brand },
  odatTxt: { marginTop: 8, fontSize: 12, color: theme.colors.text },

  // BOTTOM
  bottom: { paddingHorizontal: 22, paddingBottom: 28, gap: 14 },
  audioRow: { alignItems: 'center' },
  audioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  audioDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.brand,
    shadowColor: theme.colors.brand,
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  audioTxt: { fontSize: 13, color: theme.colors.text },

  actions: { flexDirection: 'row', gap: 12 },
  primaryFlexWrap: { flex: 1, borderRadius: 18, overflow: 'hidden' },
  primaryBtn: { height: 56, alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: theme.colors.onBrand },
  secondaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTxt: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  finishBtn: {
    width: 122,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishTxt: { fontSize: 15, fontFamily: theme.fontFamily.semibold, color: theme.colors.text },
  hint: { textAlign: 'center', fontSize: 12, color: theme.colors.textDim },
  awayWord: { color: theme.colors.gold },
}));
