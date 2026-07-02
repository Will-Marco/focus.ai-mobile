import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AiOrb, CheckIcon, PlayIcon, RadialGlow, Text } from '@shared/ui';
import { usePulse } from '@shared/lib/animation/usePulse';
import { useStatsSummary } from '@entities/stats';
import { buildMetrics, DAILY_LIMIT, useCoachStore, type WeeklyKind } from '@features/ai-coach';

// Animated.Text'ga Unistyles style BERMA (crash) — plain const.
const CARET = { color: '#F2C879' } as const;

// Haftalik karta turi → ikonka + ranglar (dizaynning 4 karta uslubi).
const KIND_STYLE: Record<WeeklyKind, { d: string; iconBg: string; iconCol: string; tagCol: string }> = {
  time: { d: 'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z', iconBg: 'rgba(242,162,76,0.16)', iconCol: '#F2A24C', tagCol: '#F2C879' },
  attention: { d: 'M12 9v4M12 17h.01M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z', iconBg: 'rgba(236,92,125,0.14)', iconCol: '#EC5C7D', tagCol: '#EC8AA0' },
  growth: { d: 'M3 17l6-6 4 4 7-7M21 8v5h-5', iconBg: 'rgba(95,208,197,0.14)', iconCol: '#5FD0C5', tagCol: '#7FD6CC' },
  tip: { d: 'M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z', iconBg: 'rgba(154,140,240,0.14)', iconCol: '#9A8CF0', tagCol: '#B3A7F0' },
};

export function AICoachScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const navigation = useNavigation();

  const summary = useStatsSummary();
  const metrics = useMemo(() => buildMetrics(summary, summary.now), [summary]);

  const insight = useCoachStore((s) => s.insight);
  const status = useCoachStore((s) => s.status);
  const source = useCoachStore((s) => s.source);
  const cachedAt = useCoachStore((s) => s.cachedAt);
  const offline = useCoachStore((s) => s.offline);
  const limitReached = useCoachStore((s) => s.limitReached);
  const remaining = useCoachStore((s) => s.remaining);
  const ensureToday = useCoachStore((s) => s.ensureToday);
  const refresh = useCoachStore((s) => s.refresh);

  const [typed, setTyped] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requested = useRef(false);

  // Statistika yuklangach bir marta bugungi insightni ta'minlaymiz (kesh yoki AI).
  useEffect(() => {
    if (summary.loaded && !requested.current) {
      requested.current = true;
      ensureToday(metrics);
    }
  }, [summary.loaded, metrics, ensureToday]);

  const message = insight?.daily.message ?? '';
  const typing = typed.length < message.length;
  const loadingFirst = status === 'loading' && !insight;

  // Typewriter — xabar o'zgarganda qaytadan yoziladi.
  useEffect(() => {
    setTyped('');
    if (!message) return;
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setTyped(message.slice(0, i));
      if (i >= message.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [message]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const onRegenerate = () => {
    if (limitReached) {
      showToast(t('aiCoach.limitToast'));
      return;
    }
    if (status === 'loading') return;
    refresh(metrics);
  };

  // CTA — tavsiyaga amal qilish: murabbiyni yopib Bosh ekranga qaytadi (sessiya shu yerdan boshlanadi).
  const onStart = () => navigation.goBack();

  const caret = usePulse(1, 0, 500);
  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value }));

  const footer = footerText({ t, status, source, offline, limitReached, remaining, cachedAt, now: summary.now });
  const cards = insight?.weekly ?? [];

  return (
    <Screen2>
      <View style={styles.header}>
        <AiOrb size={40} />
        <View style={styles.flex1}>
          <Text style={styles.subtitle}>{t('aiCoach.subtitle')}</Text>
          <Text style={styles.title}>{t('aiCoach.title')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* HERO — daily insight */}
        <View style={styles.hero}>
          <RadialGlow size={140} color={theme.colors.brandCoral} spread={0.7} blur={20} opacity={0.3} style={styles.heroGlow} />
          <View style={styles.heroLabelRow}>
            <Text style={styles.heroLabel}>{t('aiCoach.todayLabel')}</Text>
            {loadingFirst ? <Text style={styles.heroDate}>· {t('aiCoach.thinking')}</Text> : null}
          </View>
          <Text style={styles.heroText}>
            {loadingFirst ? t('aiCoach.thinking') : typed}
            {typing && !loadingFirst ? <Animated.Text style={[CARET, caretStyle]}>▏</Animated.Text> : null}
          </Text>
          {insight && !typing && !loadingFirst ? (
            <View style={styles.heroActions}>
              <Pressable accessibilityRole="button" onPress={onStart} style={styles.ctaWrap}>
                <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBtn}>
                  <PlayIcon size={16} color={theme.colors.onBrand} />
                  <Text style={styles.ctaTxt}>{insight.daily.cta}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* WEEKLY */}
        {cards.length > 0 ? (
          <View>
            <View style={styles.weeklyHead}>
              <Text style={styles.weeklyTitle}>{t('aiCoach.weekly')}</Text>
              <Text style={styles.weeklyRange}>{t('aiCoach.weekRange')}</Text>
            </View>
            <View style={styles.cards}>
              {cards.map((c, i) => {
                const ks = KIND_STYLE[c.kind] ?? KIND_STYLE.tip;
                return (
                  <Pressable key={`${c.kind}-${i}`} accessibilityRole="button" onPress={() => showToast(c.body)} style={styles.card}>
                    <View style={[styles.cardIcon, { backgroundColor: ks.iconBg }]}>
                      <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={ks.iconCol} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <Path d={ks.d} />
                      </Svg>
                    </View>
                    <View style={styles.flex1}>
                      <Text style={[styles.cardTag, { color: ks.tagCol }]}>{c.tag}</Text>
                      <Text style={styles.cardTitle}>{c.title}</Text>
                      <Text style={styles.cardBody}>{c.body}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Yangi tavsiya — header ikonka o'rniga aniq matnli boshqaruv */}
        <Pressable
          accessibilityRole="button"
          onPress={onRegenerate}
          disabled={limitReached || status === 'loading'}
          style={[styles.regenBtn, (limitReached || status === 'loading') && styles.regenDisabled]}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={limitReached ? theme.colors.textDim : theme.colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21 12a9 9 0 11-2.6-6.4M21 4v5h-5" />
          </Svg>
          <Text style={[styles.regenTxt, limitReached && styles.regenTxtOff]}>
            {limitReached
              ? t('aiCoach.limitDone')
              : source === 'live'
                ? t('aiCoach.regenerateCount', { n: remaining, max: DAILY_LIMIT })
                : t('aiCoach.regenerate')}
          </Text>
        </Pressable>

        {footer ? (
          <View style={styles.cachedRow}>
            <CheckIcon size={13} color={theme.colors.textDim} />
            <Text style={styles.cachedTxt}>{footer}</Text>
          </View>
        ) : null}
      </ScrollView>

      {toast ? (
        <View style={styles.toastWrap} pointerEvents="none">
          <Text style={styles.toast}>{toast}</Text>
        </View>
      ) : null}
    </Screen2>
  );
}

// Manba + holatga qarab pastki izoh (jonli / kesh / offline / limit).
function footerText(args: {
  t: (k: string, o?: Record<string, unknown>) => string;
  status: string;
  source: string | null;
  offline: boolean;
  limitReached: boolean;
  remaining: number;
  cachedAt: number | null;
  now: number;
}): string | null {
  const { t, status, source, limitReached, remaining, cachedAt, now } = args;
  if (status === 'loading' && !source) return null;
  if (limitReached) return t('aiCoach.limitReached');
  if (source === 'live') {
    return remaining > 0 ? `${t('aiCoach.sourceLive')} · ${t('aiCoach.remaining', { n: remaining })}` : t('aiCoach.sourceLive');
  }
  if (source === 'fallback') return t('aiCoach.sourceFallback');
  if (source === 'cache') return cacheAgo(t, cachedAt, now);
  return null;
}

function cacheAgo(t: (k: string, o?: Record<string, unknown>) => string, at: number | null, now: number): string {
  if (!at) return t('aiCoach.sourceFallback');
  const min = Math.max(0, Math.floor((now - at) / 60_000));
  if (min < 1) return t('aiCoach.sourceCacheNow');
  if (min < 60) return t('aiCoach.sourceCacheMin', { n: min });
  const h = Math.floor(min / 60);
  if (h < 24) return t('aiCoach.sourceCacheHour', { n: h });
  return t('aiCoach.sourceCacheDay', { n: Math.floor(h / 24) });
}

function Screen2({ children }: { children: React.ReactNode }) {
  const { theme } = useUnistyles();
  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.backgroundElevated]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.flex1}>
      <SafeAreaView style={styles.flex1} edges={['top']}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create((theme) => ({
  flex1: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  subtitle: { fontSize: 13, color: theme.colors.textMuted },
  title: { fontSize: 22, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong, lineHeight: 24 },

  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28, gap: 18 },

  hero: { padding: 20, borderRadius: 24, backgroundColor: 'rgba(242,162,76,0.12)', borderWidth: 1, borderColor: 'rgba(242,162,76,0.28)', overflow: 'hidden' },
  heroGlow: { position: 'absolute', right: -40, top: -40 },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  heroLabel: { fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: theme.colors.gold, fontFamily: theme.fontFamily.bold },
  heroDate: { fontSize: 11, color: theme.colors.textDim },
  heroText: { fontSize: 16, lineHeight: 25, color: theme.colors.text, fontFamily: theme.fontFamily.medium, minHeight: 120 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  ctaWrap: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  ctaBtn: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  ctaTxt: { fontSize: 14, fontFamily: theme.fontFamily.bold, color: theme.colors.onBrand },

  regenBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, borderRadius: 14, backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.border },
  regenDisabled: { opacity: 0.6 },
  regenTxt: { fontSize: 13, fontFamily: theme.fontFamily.semibold, color: theme.colors.gold },
  regenTxtOff: { color: theme.colors.textDim },

  weeklyHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  weeklyTitle: { fontSize: 15, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  weeklyRange: { fontSize: 12, color: theme.colors.textDim },
  cards: { gap: 11 },
  card: { flexDirection: 'row', gap: 14, padding: 15, borderRadius: 20, backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.border },
  cardIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardTag: { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: theme.fontFamily.bold },
  cardTitle: { fontSize: 15, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong, marginTop: 3, lineHeight: 19 },
  cardBody: { fontSize: 13, color: theme.colors.textMuted, marginTop: 3, lineHeight: 18 },

  cachedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingTop: 2 },
  cachedTxt: { fontSize: 11, color: theme.colors.textDim },

  toastWrap: { position: 'absolute', left: 0, right: 0, bottom: 40, alignItems: 'center' },
  toast: { maxWidth: 280, textAlign: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, backgroundColor: 'rgba(31,20,11,0.96)', borderWidth: 1, borderColor: 'rgba(242,162,76,0.35)', color: theme.colors.textStrong, fontSize: 13, fontFamily: theme.fontFamily.semibold, overflow: 'hidden' },
}));
