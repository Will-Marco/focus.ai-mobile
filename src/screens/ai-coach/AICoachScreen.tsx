import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { AiOrb, CheckIcon, PlayIcon, RadialGlow, Text } from '@shared/ui';
import { usePulse } from '@shared/lib/animation/usePulse';

// ⚠️ Mock kontent (UI build) — AI matn/tahlil M10 (Edge Function → bepul AI + kesh)da real ulanadi.
const MESSAGES = [
  "Salom Aziz! Kecha 2s 40d fokuslanding — bu haftaning eng kuchli kuni. Bugun \"Chuqur ish\"ni ertalab boshlasang, miyang eng tetik paytda ishlaydi. 45 daqiqalik sessiya bilan boshlaymizmi?",
  "12 kunlik streak — ajoyib! Lekin \"Mutolaa\" odatingga 3 kundan beri vaqt ajratmading. Bugun atigi 20 daqiqa ham seriyani tirik saqlaydi va kayfiyatni ko'taradi.",
  "Bu hafta o'tgan haftaga nisbatan +20% ko'proq fokuslanding. Eng samarali vaqting — ertalab 9:00–11:00. Eng muhim ishlaringni shu oraliqqa rejalashtir.",
];
const CTAS = ['45 daq sessiya', '20 daq Mutolaa', 'Reja tuzish'];

// Animated.Text'ga Unistyles style BERMA (crash) — plain const.
const CARET = { color: '#F2C879' } as const;

interface Card {
  tag: string;
  title: string;
  body: string;
  d: string;
  iconBg: string;
  iconCol: string;
  tagCol: string;
  toast: string;
}
const CARDS: Card[] = [
  { tag: 'Eng samarali vaqt', title: 'Ertalab 9:00 – 11:00', body: 'Sessiyalaringning 64%i shu oraliqda — diqqating eng yuqori.', d: 'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z', iconBg: 'rgba(242,162,76,0.16)', iconCol: '#F2A24C', tagCol: '#F2C879', toast: "Eng samarali vaqt: ertalab 9–11. Muhim ishlarni shu paytga qo'y." },
  { tag: "E'tibor talab", title: '"Mutolaa" 3 kun tanaffusda', body: "Kichik qadam — bugun 20 daqiqa o'qishni sinab ko'r.", d: 'M12 9v4M12 17h.01M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z', iconBg: 'rgba(236,92,125,0.14)', iconCol: '#EC5C7D', tagCol: '#EC8AA0', toast: '"Mutolaa" 3 kundan beri to\'xtagan — bugun boshlasang seriya saqlanadi.' },
  { tag: "O'sish", title: '+20% bu hafta', body: "Jami 11s 30d fokus — o'tgan haftadan ancha yaxshi.", d: 'M3 17l6-6 4 4 7-7M21 8v5h-5', iconBg: 'rgba(95,208,197,0.14)', iconCol: '#5FD0C5', tagCol: '#7FD6CC', toast: "Bu hafta +20% — sur'atni shu tarzda saqla!" },
  { tag: 'Tavsiya', title: 'Sport sessiyalarini qisqartir', body: '25 daqiqalik sessiyalar yakunlash ehtimolini oshiradi.', d: 'M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z', iconBg: 'rgba(154,140,240,0.14)', iconCol: '#9A8CF0', tagCol: '#B3A7F0', toast: "Sport uchun 25 daq sinab ko'r — kichik maqsad, ko'p g'alaba." },
];

export function AICoachScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [msgIdx, setMsgIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const full = MESSAGES[msgIdx];
  const typing = typed.length < full.length;

  useEffect(() => {
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setTyped(MESSAGES[msgIdx].slice(0, i));
      if (i >= MESSAGES[msgIdx].length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [msgIdx]);

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

  const caret = usePulse(1, 0, 500);
  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value }));

  return (
    <Screen2>
      <View style={styles.header}>
        <AiOrb size={40} />
        <View style={styles.flex1}>
          <Text style={styles.subtitle}>{t('aiCoach.subtitle')}</Text>
          <Text style={styles.title}>{t('aiCoach.title')}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => setMsgIdx((i) => (i + 1) % MESSAGES.length)} style={styles.refreshBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21 12a9 9 0 11-2.6-6.4M21 4v5h-5" />
          </Svg>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* HERO — daily insight */}
        <View style={styles.hero}>
          <RadialGlow size={140} color={theme.colors.brandCoral} spread={0.7} blur={20} opacity={0.3} style={styles.heroGlow} />
          <View style={styles.heroLabelRow}>
            <Text style={styles.heroLabel}>{t('aiCoach.todayLabel')}</Text>
            <Text style={styles.heroDate}>· {t('aiCoach.today')}</Text>
          </View>
          <Text style={styles.heroText}>
            {typed}
            {typing ? <Animated.Text style={[CARET, caretStyle]}>▏</Animated.Text> : null}
          </Text>
          {!typing ? (
            <View style={styles.heroActions}>
              <Pressable accessibilityRole="button" onPress={() => showToast(t('aiCoach.preparing'))} style={styles.ctaWrap}>
                <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBtn}>
                  <PlayIcon size={16} color={theme.colors.onBrand} />
                  <Text style={styles.ctaTxt}>{CTAS[msgIdx]}</Text>
                </LinearGradient>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => showToast(t('aiCoach.reminderSet'))} style={styles.laterBtn}>
                <Text style={styles.laterTxt}>{t('aiCoach.later')}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* WEEKLY */}
        <View>
          <View style={styles.weeklyHead}>
            <Text style={styles.weeklyTitle}>{t('aiCoach.weekly')}</Text>
            <Text style={styles.weeklyRange}>{t('aiCoach.weekRange')}</Text>
          </View>
          <View style={styles.cards}>
            {CARDS.map((c) => (
              <Pressable key={c.tag} accessibilityRole="button" onPress={() => showToast(c.toast)} style={styles.card}>
                <View style={[styles.cardIcon, { backgroundColor: c.iconBg }]}>
                  <Svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke={c.iconCol} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <Path d={c.d} />
                  </Svg>
                </View>
                <View style={styles.flex1}>
                  <Text style={[styles.cardTag, { color: c.tagCol }]}>{c.tag}</Text>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  <Text style={styles.cardBody}>{c.body}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.cachedRow}>
          <CheckIcon size={13} color={theme.colors.textDim} />
          <Text style={styles.cachedTxt}>{t('aiCoach.cached')}</Text>
        </View>
      </ScrollView>

      {toast ? (
        <View style={styles.toastWrap} pointerEvents="none">
          <Text style={styles.toast}>{toast}</Text>
        </View>
      ) : null}
    </Screen2>
  );
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
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surfaceStrong, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },

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
  laterBtn: { height: 48, paddingHorizontal: 18, borderRadius: 14, backgroundColor: theme.colors.surfaceStrong, borderWidth: 1, borderColor: theme.colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  laterTxt: { fontSize: 14, fontFamily: theme.fontFamily.semibold, color: theme.colors.text },

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
