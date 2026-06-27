import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { ProgressRing, RadialBackground, RadialGlow, Text } from '@shared/ui';
import { formatClock } from '@shared/lib/time/formatClock';
import { usePulse } from '@shared/lib/animation/usePulse';

// Animated uchun plain style (Unistyles emas — crash).
const COLON_BIG = { fontFamily: 'GeistMono-SemiBold', fontSize: 150, color: '#F2A24C', lineHeight: 138 } as const;
const AWAY_RING_OUTER = {
  position: 'absolute',
  width: 200,
  height: 200,
  borderRadius: 100,
  borderWidth: 1,
  borderColor: 'rgba(242,162,76,0.22)',
} as const;
const AWAY_DOT = {
  width: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: '#F2A24C',
  shadowColor: '#F2A24C',
  shadowOpacity: 0.5,
  shadowRadius: 13,
  shadowOffset: { width: 0, height: 0 },
  elevation: 8,
} as const;

export interface FocusClockProps {
  habitName: string;
  progress: number;
  elapsedMs: number;
  remainingMs: number;
  targetMin: number;
}

/** Landscape "Focus Clock" — stol soati estetikasi, glanceable. */
export function FocusClockView({ habitName, progress, elapsedMs, remainingMs, targetMin }: FocusClockProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const colon = usePulse(1, 0.2, 600);
  const colonStyle = useAnimatedStyle(() => ({ opacity: colon.value }));
  const [mm, ss] = formatClock(remainingMs).split(':');
  const pct = Math.round(progress * 100);

  return (
    <View style={styles.root}>
      <RadialBackground colors={[...theme.colors.sessionBg]} positions={[0, 0.64, 1]} center={{ x: 0.22, y: 0.5 }} radiusScale={1.4} />
      <RadialGlow size={360} color={theme.colors.brand} blur={40} opacity={0.16} spread={0.64} style={styles.fcGlow} />

      <View style={styles.fcRow}>
        <View style={styles.fcLeft}>
          <View style={styles.fcLabelRow}>
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={theme.colors.gold} strokeWidth={2.2}>
              <Circle cx="12" cy="12" r="9" />
              <Path d="M12 7v5l3 2" />
            </Svg>
            <Text style={styles.fcLabel}>{t('session.focusClock')}</Text>
          </View>

          <View style={styles.fcHabitRow}>
            <View style={styles.fcMiniRing}>
              <ProgressRing size={52} strokeWidth={5} progress={progress} color={theme.colors.brand} trackOpacity={0.1} />
              <View style={styles.fcMiniCenter} pointerEvents="none">
                <Text variant="mono" style={styles.fcMiniPct}>
                  {pct}%
                </Text>
              </View>
            </View>
            <View>
              <Text style={styles.fcHabitName}>{habitName}</Text>
              <Text style={styles.fcHabitSub}>
                {targetMin} {t('session.fromMinutes')}
              </Text>
            </View>
          </View>

          <View style={styles.dndChip}>
            <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={theme.colors.gold} strokeWidth={2}>
              <Path d="M3 3l18 18M12 4a8 8 0 018 8M16.5 7.5A5 5 0 0117 12" />
              <Circle cx="12" cy="18" r="1.2" fill={theme.colors.gold} stroke="none" />
            </Svg>
            <Text style={styles.dndTxt}>{t('session.dnd')}</Text>
          </View>

          <View style={styles.screenOnRow}>
            <View style={styles.tealDot} />
            <Text style={styles.screenOnTxt}>{t('session.screenOn')}</Text>
          </View>
        </View>

        <View style={styles.fcRight}>
          <Text style={styles.fcRemaining}>{t('session.remaining')}</Text>
          <View style={styles.fcClockRow}>
            <Text style={styles.fcClock}>{mm}</Text>
            <Animated.Text style={[COLON_BIG, colonStyle]}>:</Animated.Text>
            <Text style={styles.fcClock}>{ss}</Text>
          </View>
          <View style={styles.fcBarTrack}>
            <View style={[styles.fcBarFill, { width: 300 * Math.max(0, Math.min(1, progress)) }]} />
          </View>
          <Text style={styles.fcSub}>
            {formatClock(elapsedMs)} {t('session.passed')} · {t('session.sessionShort')} {pct}%
          </Text>
        </View>
      </View>
    </View>
  );
}

export interface AwayProps {
  elapsedMs: number;
  onExit: () => void;
}

/** Face-down "Away" — ekran qorayadi, telefonsizlik bonusi. */
export function AwayView({ elapsedMs, onExit }: AwayProps) {
  const { t } = useTranslation();
  const ringPulse = usePulse(0.25, 0.5, 2000);
  const ringScale = usePulse(1, 1.04, 2000);
  const dotPulse = usePulse(0.5, 0.9, 1700);
  const dotScale = usePulse(1, 1.35, 1700);
  const ringStyle = useAnimatedStyle(() => ({ opacity: ringPulse.value, transform: [{ scale: ringScale.value }] }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: dotPulse.value, transform: [{ scale: dotScale.value }] }));

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="away" onPress={onExit} style={styles.awayRoot}>
      <RadialBackground colors={['#140d07', '#080503', '#050302']} positions={[0, 0.6, 1]} center={{ x: 0.5, y: 0.42 }} radiusScale={1.1} />
      <View style={styles.awayCenter}>
        <View style={styles.awayRings}>
          <Animated.View style={[AWAY_RING_OUTER, ringStyle]} pointerEvents="none" />
          <View style={styles.awayRingInner} pointerEvents="none" />
          <Animated.View style={[AWAY_DOT, dotStyle]} pointerEvents="none" />
        </View>

        <View style={styles.awayTextWrap}>
          <Text style={styles.awayTitle}>{t('session.awayTitle')}</Text>
          <Text variant="mono" style={styles.awayClock}>
            {formatClock(elapsedMs)}
          </Text>
        </View>

        <View style={styles.awayXpChip}>
          <Svg width={15} height={15} viewBox="0 0 24 24" fill="#F2C879">
            <Path d="M12 2l2.4 6.5H21l-5.3 4 2 6.5L12 15.5 6.3 19l2-6.5L3 8.5h6.6z" />
          </Svg>
          <Text style={styles.awayXpTxt}>{t('session.awayXp')}</Text>
        </View>
      </View>
      <Text style={styles.awayFooter}>{t('session.awayFooter')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1 },

  // FOCUS CLOCK
  fcGlow: { position: 'absolute', left: -120, top: -40 },
  fcRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 56, gap: 48 },
  fcLeft: { width: 240, gap: 20 },
  fcLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fcLabel: { fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: theme.colors.gold },
  fcHabitRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  fcMiniRing: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  fcMiniCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  fcMiniPct: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 12, color: theme.colors.textStrong },
  fcHabitName: { fontSize: 18, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong },
  fcHabitSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  dndChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: 'rgba(242,162,76,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(242,162,76,0.28)',
    alignSelf: 'flex-start',
  },
  dndTxt: { fontSize: 12, fontFamily: theme.fontFamily.semibold, color: theme.colors.goldSoft },
  screenOnRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  tealDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#5FD0C5',
    shadowColor: '#5FD0C5',
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  screenOnTxt: { fontSize: 12, color: theme.colors.textDim },

  fcRight: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fcRemaining: { fontSize: 12, letterSpacing: 4, color: theme.colors.gold, marginBottom: 6 },
  fcClockRow: { flexDirection: 'row', alignItems: 'center' },
  fcClock: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 150, lineHeight: 138, letterSpacing: -3, color: theme.colors.textStrong },
  fcBarTrack: { marginTop: 18, width: 300, height: 4, borderRadius: 3, backgroundColor: `rgba(${theme.colors.trackRgb},0.08)`, overflow: 'hidden' },
  fcBarFill: { height: 4, backgroundColor: theme.colors.brand },
  fcSub: { marginTop: 12, fontSize: 13, color: theme.colors.textMuted },

  // AWAY
  awayRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26 },
  awayCenter: { alignItems: 'center', justifyContent: 'center', gap: 26 },
  awayRings: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  awayRingInner: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(242,162,76,0.14)' },
  awayTextWrap: { alignItems: 'center', gap: 6 },
  awayTitle: { fontSize: 12, letterSpacing: 4.8, color: '#8a6f54' },
  awayClock: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 46, color: '#caa472', letterSpacing: -1 },
  awayXpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(242,162,76,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(242,162,76,0.2)',
  },
  awayXpTxt: { fontSize: 13, fontFamily: theme.fontFamily.semibold, color: '#caa472' },
  awayFooter: { position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontSize: 12, color: '#4a3c2e', paddingHorizontal: 40, lineHeight: 18 },
}));
