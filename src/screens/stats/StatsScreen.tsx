import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { CheckIcon, FlameIcon, RadialGlow, Screen, Text } from '@shared/ui';
import { formatSpent } from '@shared/lib/time/formatSpent';
import { buildSeries, useStatsSummary, type BadgeId, type ChartPeriod } from '@entities/stats';

const DAY_LABELS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'] as const;

const PERIOD_LABELS: Record<ChartPeriod, string[]> = {
  week: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
  month: ['1-h', '2-h', '3-h', '4-h'],
  year: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
};

const heatColors = (trackRgb: string) => [
  `rgba(${trackRgb},0.06)`,
  'rgba(242,162,76,0.3)',
  'rgba(242,162,76,0.55)',
  'rgba(242,160,76,0.8)',
  '#F2603E',
];

// Badge ikonkalari (UI) — id dizayn tartibida `BADGE_IDS` bilan mos.
interface BadgeDef {
  id: BadgeId;
  name: string;
  d: string;
}
const BADGES: BadgeDef[] = [
  { id: 'first-step', name: 'Ilk qadam', d: 'M5 12l4.5 4.5L19 7' },
  { id: 'streak-7', name: '7 kun streak', d: 'M12 2c1 3-1 4.5-2 6.5s.5 4 2.5 4 3-2.5 1.5-5.5c2.5 1.5 4 4.5 4 7.5a6 6 0 11-12 0' },
  { id: 'focus-master', name: 'Fokus ustasi', d: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z' },
  { id: 'night-owl', name: "Tungi boyo'g'li", d: 'M20 13.5A8 8 0 1110.5 4 6.5 6.5 0 0020 13.5z' },
  { id: 'phone-free', name: 'Telefonsiz', d: 'M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z' },
  { id: 'team', name: 'Jamoaviy', d: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 19c0-3 3-5 6-5s6 2 6 5' },
  { id: 'marathon', name: 'Marafonchi', d: 'M13 2L4 14h7l-2 8 9-12h-7z' },
  { id: 'golden-ring', name: 'Oltin halqa', d: 'M12 3a9 9 0 100 18 9 9 0 000-18z' },
  { id: 'consistent', name: 'Doimiy', d: 'M12 8v4l3 2M12 3a9 9 0 100 18 9 9 0 000-18z' },
  { id: 'early-bird', name: 'Erta qush', d: 'M12 3v2M5.6 5.6l1.5 1.5M3 12h2M12 14a3 3 0 100-6 3 3 0 000 6z' },
  { id: 'deep-work', name: 'Chuqur ish', d: 'M4 6h16M4 12h16M4 18h10' },
  { id: 'dawn', name: 'Sahar', d: 'M3 18h18M12 3v6M8 7l4-4 4 4M5 13a7 7 0 0114 0' },
];

const BAR_MAX = 90;
const fmtVal = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}s` : `${m}d`);

export function StatsScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [period, setPeriod] = useState<ChartPeriod>('week');
  const summary = useStatsSummary();

  const series = useMemo(
    () => buildSeries(period, summary.sessions, summary.now),
    [period, summary.sessions, summary.now],
  );
  const labels = PERIOD_LABELS[period];
  const earnedCount = BADGES.filter((b) => summary.badges[b.id]).length;

  const maxMin = Math.max(1, ...series.mins);
  const gradient = [...theme.colors.gradientBrand];
  const HEAT_COLORS = heatColors(theme.colors.trackRgb);
  const heatmap = summary.heatmap.weeks;

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>{t('stats.subtitle')}</Text>
          <Text style={styles.title}>{t('stats.title')}</Text>
        </View>
        <View style={styles.streakPill}>
          <FlameIcon size={15} color={theme.colors.brandCoral} />
          <Text style={styles.streakPillTxt}>{summary.streak.current}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* STREAK + LEVEL */}
        <View style={styles.row}>
          <View style={styles.streakCard}>
            <RadialGlow size={90} color={theme.colors.brandCoral} spread={0.7} blur={14} opacity={0.3} style={styles.streakGlow} />
            <Text style={styles.cardLabel}>{t('stats.currentStreak')}</Text>
            <View style={styles.streakValueRow}>
              <Text variant="mono" style={styles.streakBig}>
                {summary.streak.current}
              </Text>
              <Text style={styles.streakUnit}>{t('stats.dayUnit')}</Text>
            </View>
            <Text style={styles.cardSub}>
              {t('stats.longest')} · {summary.streak.longest} {t('stats.dayUnit')}
            </Text>
          </View>

          <View style={styles.levelCard}>
            <View style={styles.levelTop}>
              <Text style={styles.cardLabel}>{t('stats.level')}</Text>
              <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.levelBadge}>
                <Text style={styles.levelBadgeTxt}>{summary.level.level}</Text>
              </LinearGradient>
            </View>
            <Text variant="mono" style={styles.xpTxt}>
              {summary.level.current}
              <Text style={styles.xpMax}> / {summary.level.span} XP</Text>
            </Text>
            <View style={styles.xpTrack}>
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                // eslint-disable-next-line react-native/no-inline-styles -- foiz dinamik
                style={{ width: `${Math.round((summary.level.current / summary.level.span) * 100)}%`, height: 6, borderRadius: 3 }}
              />
            </View>
          </View>
        </View>

        {/* 7 KUN */}
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>{t('stats.last7')}</Text>
          <View style={styles.weekRow}>
            {DAY_LABELS.map((label, i) => (
              <View key={label} style={styles.dayItem}>
                {summary.last7[i] ? (
                  <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dayDot}>
                    <CheckIcon size={15} color={theme.colors.onBrand} strokeWidth={3.2} />
                  </LinearGradient>
                ) : (
                  <View style={[styles.dayDot, styles.dayDotEmpty]} />
                )}
                <Text style={styles.dayLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CHART */}
        <View style={styles.card}>
          <View style={styles.chartHead}>
            <Text style={styles.cardTitle}>{t('stats.activity')}</Text>
            <View style={styles.toggle}>
              {(['week', 'month', 'year'] as ChartPeriod[]).map((p) => {
                const active = p === period;
                return active ? (
                  <LinearGradient key={p} colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.toggleItem}>
                    <Text style={styles.toggleTxtActive} onPress={() => setPeriod(p)}>
                      {t(`stats.${p}`)}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text key={p} style={styles.toggleTxt} onPress={() => setPeriod(p)}>
                    {t(`stats.${p}`)}
                  </Text>
                );
              })}
            </View>
          </View>

          <View style={styles.chartTotalRow}>
            <Text variant="mono" style={styles.chartTotal}>
              {formatSpent(series.totalMin * 60_000)}
            </Text>
            {series.comparePct !== null ? (
              <Text style={[styles.compare, series.up ? styles.compareUp : styles.compareDown]}>
                {series.up ? '↑' : '↓'} {series.up ? '+' : ''}
                {series.comparePct}% {t('stats.comparePrev')}
              </Text>
            ) : null}
          </View>

          <View style={styles.barsRow}>
            {labels.map((label, i) => (
              <View key={`${period}-${label}`} style={styles.barCol}>
                <Text variant="mono" style={styles.barVal}>
                  {fmtVal(series.mins[i])}
                </Text>
                <Bar
                  height={(series.mins[i] / maxMin) * BAR_MAX}
                  colors={series.mins[i] === maxMin && series.mins[i] > 0 ? [theme.colors.goldSoft, theme.colors.brandCoral] : gradient}
                />
                <Text style={styles.barLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* HEATMAP */}
        <View style={styles.card}>
          <View style={styles.cardHeadRow}>
            <Text style={styles.cardTitle}>{t('stats.lastYear')}</Text>
            <Text style={styles.cardSub}>
              {summary.heatmap.activeDays} {t('stats.dayUnit')} {t('stats.active')}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.heatRow}>
              {heatmap.map((col, ci) => (
                <View key={ci} style={styles.heatCol}>
                  {col.map((lvl, di) => (
                    <View key={di} style={[styles.heatCell, { backgroundColor: HEAT_COLORS[lvl] }]} />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.legend}>
            <Text style={styles.legendTxt}>{t('stats.less')}</Text>
            <View style={styles.legendSwatches}>
              {HEAT_COLORS.map((c) => (
                <View key={c} style={[styles.legendCell, { backgroundColor: c }]} />
              ))}
            </View>
            <Text style={styles.legendTxt}>{t('stats.more')}</Text>
          </View>
        </View>

        {/* BADGES */}
        <View>
          <View style={styles.cardHeadRow}>
            <Text style={styles.cardTitle}>{t('stats.badges')}</Text>
            <Text style={styles.badgeCount}>
              {earnedCount} / {BADGES.length}
            </Text>
          </View>
          <View style={styles.badgeGrid}>
            {BADGES.map((b) => {
              const earned = summary.badges[b.id];
              return (
              <View key={b.id} style={[styles.badgeCard, earned ? styles.badgeCardOn : styles.badgeCardOff]}>
                {earned ? (
                  <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badgeIcon}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={theme.colors.onBrand} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d={b.d} />
                    </Svg>
                  </LinearGradient>
                ) : (
                  <View style={[styles.badgeIcon, styles.badgeIconOff]}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#6a563f" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d={b.d} />
                    </Svg>
                  </View>
                )}
                <Text style={[styles.badgeName, earned ? styles.badgeNameOn : styles.badgeNameOff]}>{b.name}</Text>
              </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Bar({ height, colors }: { height: number; colors: string[] }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withTiming(height, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [h, height]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return (
    // eslint-disable-next-line react-native/no-inline-styles -- balandlik animatsion/dinamik
    <Animated.View style={[{ width: '100%', maxWidth: 26, borderRadius: 6, overflow: 'hidden' }, style]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.barFill} />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  subtitle: { fontSize: 13, color: theme.colors.textMuted },
  title: { fontSize: 26, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong, lineHeight: 29 },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(242,162,76,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(242,162,76,0.28)',
  },
  streakPillTxt: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 14, color: theme.colors.goldSoft },

  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 16 },
  row: { flexDirection: 'row', gap: 12 },

  streakCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(242,96,62,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(242,120,62,0.24)',
    overflow: 'hidden',
  },
  streakGlow: { position: 'absolute', right: -20, top: -20 },
  cardLabel: { fontSize: 12, color: theme.colors.textMuted, fontFamily: theme.fontFamily.semibold },
  streakValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 4 },
  streakBig: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 34, color: theme.colors.textStrong },
  streakUnit: { fontSize: 14, color: theme.colors.goldSoft },
  cardSub: { fontSize: 12, color: theme.colors.textDim, marginTop: 4 },

  levelCard: { flex: 1, padding: 16, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  levelTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelBadge: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  levelBadgeTxt: { fontFamily: theme.fontFamily.extrabold, fontSize: 14, color: theme.colors.onBrand },
  xpTxt: { fontFamily: theme.fontFamily.mono, fontSize: 15, color: theme.colors.textStrong, marginTop: 8 },
  xpMax: { color: theme.colors.textDim, fontSize: 12 },
  xpTrack: { marginTop: 8, height: 6, borderRadius: 3, backgroundColor: `rgba(${theme.colors.trackRgb},0.08)`, overflow: 'hidden' },
  xpFill: { width: '82%', height: 6, borderRadius: 3 },

  panel: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.border },
  panelLabel: { fontSize: 12, color: theme.colors.textMuted, fontFamily: theme.fontFamily.bold, letterSpacing: 0.5, marginBottom: 12 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 7 },
  dayDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayDotEmpty: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong },
  dayLabel: { fontSize: 11, color: theme.colors.textDim },

  card: { padding: 16, borderRadius: 20, backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.border },
  cardTitle: { fontSize: 15, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  cardHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },

  chartHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: { flexDirection: 'row', gap: 4, padding: 3, borderRadius: theme.radius.pill, backgroundColor: theme.colors.inset },
  toggleItem: { borderRadius: theme.radius.pill },
  toggleTxt: { paddingVertical: 6, paddingHorizontal: 13, fontSize: 12, fontFamily: theme.fontFamily.bold, color: theme.colors.textMuted },
  toggleTxtActive: { paddingVertical: 6, paddingHorizontal: 13, fontSize: 12, fontFamily: theme.fontFamily.bold, color: theme.colors.onBrand },
  chartTotalRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 6, marginBottom: 16 },
  chartTotal: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 24, color: theme.colors.textStrong },
  compare: { fontSize: 12, fontFamily: theme.fontFamily.bold },
  compareUp: { color: '#5FD0C5' },
  compareDown: { color: theme.colors.danger },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, minHeight: 130 },
  barCol: { flex: 1, alignItems: 'center', gap: 8, justifyContent: 'flex-end' },
  barVal: { fontFamily: theme.fontFamily.mono, fontSize: 9, color: theme.colors.textDim },
  barFill: { flex: 1, borderRadius: 6 },
  barLabel: { fontSize: 10, color: theme.colors.textDim },

  heatRow: { flexDirection: 'row', gap: 3 },
  heatCol: { flexDirection: 'column', gap: 3 },
  heatCell: { width: 11, height: 11, borderRadius: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 12 },
  legendTxt: { fontSize: 11, color: theme.colors.textDim },
  legendSwatches: { flexDirection: 'row', gap: 3 },
  legendCell: { width: 11, height: 11, borderRadius: 2 },

  badgeCount: { fontSize: 12, color: theme.colors.goldSoft },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: { width: '31%', paddingVertical: 14, paddingHorizontal: 8, borderRadius: 18, alignItems: 'center', gap: 8 },
  badgeCardOn: { backgroundColor: 'rgba(242,162,76,0.10)', borderWidth: 1, borderColor: 'rgba(242,162,76,0.28)' },
  badgeCardOff: { backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.border },
  badgeIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  badgeIconOff: { backgroundColor: theme.colors.surfaceStrong },
  badgeName: { fontSize: 11, fontFamily: theme.fontFamily.semibold, textAlign: 'center', lineHeight: 14 },
  badgeNameOn: { color: theme.colors.text },
  badgeNameOff: { color: theme.colors.textDim },
}));
