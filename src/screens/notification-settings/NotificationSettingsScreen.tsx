import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { Screen, ScreenHeader, Text } from '@shared/ui';
import type { RootScreenProps } from '@shared/config/navigation';

// Animated.View'ga Unistyles style BERMA — plain const.
const TOGGLE_FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 100 } as const;
const KNOB = { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' } as const;

// ⚠️ Mock holat (UI build) — Notifee jadval/ruxsat M7da real ulanadi.
type ToggleKey = 'reminder' | 'achieve' | 'streak' | 'team' | 'weekly';
interface RowDef {
  key: ToggleKey;
  title: string;
  sub: string;
  d: string;
  iconBg: string;
  iconCol: string;
}
const ROWS: RowDef[] = [
  { key: 'reminder', title: 'Odat eslatmalari', sub: 'Har kuni 21:00', d: 'M12 6v6l4 2M12 3a9 9 0 100 18 9 9 0 000-18z', iconBg: 'rgba(242,162,76,0.16)', iconCol: '#F2A24C' },
  { key: 'achieve', title: '100% yutuq nishonlash', sub: 'Maqsadga yetganda', d: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM5 4v3a3 3 0 003 3M19 4v3a3 3 0 01-3 3', iconBg: 'rgba(242,200,121,0.16)', iconCol: '#F2C879' },
  { key: 'streak', title: 'Streak xavfi', sub: "Kunlik · sessiya bo'lmasa", d: 'M12 2c1 3-1 4.5-2 6.5s.5 4 2.5 4 3-2.5 1.5-5.5c2.5 1.5 4 4.5 4 7.5a6 6 0 11-12 0', iconBg: 'rgba(242,96,62,0.14)', iconCol: '#F2603E' },
  { key: 'team', title: 'Jamoa faoliyati', sub: "A'zolar sessiya yakunlaganda", d: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 19c0-3 3-5 6-5s6 2 6 5', iconBg: 'rgba(95,208,197,0.14)', iconCol: '#5FD0C5' },
  { key: 'weekly', title: 'Haftalik AI tahlil', sub: 'Yakshanba 20:00', d: 'M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9z', iconBg: 'rgba(154,140,240,0.14)', iconCol: '#9A8CF0' },
];
const STARTS = ['21:00', '22:00', '23:00'];
const ENDS = ['06:00', '07:00', '08:00'];

export function NotificationSettingsScreen({ navigation }: RootScreenProps<'NotificationSettings'>) {
  const { t } = useTranslation();
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    reminder: true,
    achieve: true,
    streak: true,
    team: false,
    weekly: true,
  });
  const [quietOn, setQuietOn] = useState(true);
  const [startI, setStartI] = useState(1);
  const [endI, setEndI] = useState(1);

  const flip = (k: ToggleKey) => setToggles((s) => ({ ...s, [k]: !s[k] }));

  return (
    <Screen edges={['top']}>
      <ScreenHeader title={t('notif.settingsTitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.section}>{t('notif.settings')}</Text>
          <View style={styles.card}>
            {ROWS.map((r, i) => (
              <Pressable
                key={r.key}
                accessibilityRole="switch"
                accessibilityState={{ checked: toggles[r.key] }}
                onPress={() => flip(r.key)}
                style={[styles.row, i === ROWS.length - 1 && styles.rowLast]}
              >
                <View style={[styles.rowIcon, { backgroundColor: r.iconBg }]}>
                  <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={r.iconCol} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <Path d={r.d} />
                  </Svg>
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.rowTitle}>{r.title}</Text>
                  <Text style={styles.rowSub}>{r.sub}</Text>
                </View>
                <Toggle value={toggles[r.key]} onChange={() => flip(r.key)} />
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.section}>{t('notif.quietSection')}</Text>
          <View style={styles.quietCard}>
            <Pressable accessibilityRole="switch" accessibilityState={{ checked: quietOn }} onPress={() => setQuietOn((q) => !q)} style={styles.quietRow}>
              <View style={[styles.rowIcon, styles.quietIcon]}>
                <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#9A8CF0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M20 13.5A8 8 0 1110.5 4 6.5 6.5 0 0020 13.5z" />
                </Svg>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.rowTitle}>{t('notif.quietTitle')}</Text>
                <Text style={styles.rowSub}>{t('notif.quietSub')}</Text>
              </View>
              <Toggle value={quietOn} onChange={() => setQuietOn((q) => !q)} />
            </Pressable>

            {quietOn ? (
              <View style={styles.timeRow}>
                <Pressable accessibilityRole="button" onPress={() => setStartI((i) => (i + 1) % STARTS.length)} style={styles.timeBox}>
                  <Text style={styles.timeLabel}>{t('notif.start')}</Text>
                  <Text variant="mono" style={styles.timeValue}>
                    {STARTS[startI]}
                  </Text>
                </Pressable>
                <Text style={styles.timeArrow}>→</Text>
                <Pressable accessibilityRole="button" onPress={() => setEndI((i) => (i + 1) % ENDS.length)} style={styles.timeBox}>
                  <Text style={styles.timeLabel}>{t('notif.end')}</Text>
                  <Text variant="mono" style={styles.timeValue}>
                    {ENDS[endI]}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { theme } = useUnistyles();
  const v = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(value ? 1 : 0, { duration: 220 });
  }, [value, v]);
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: v.value * 20 }] }));
  const fillStyle = useAnimatedStyle(() => ({ opacity: v.value }));
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={() => onChange(!value)} style={styles.track}>
      <Animated.View style={[TOGGLE_FILL, fillStyle]} pointerEvents="none">
        <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fillInner} />
      </Animated.View>
      <Animated.View style={[KNOB, knobStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  flex1: { flex: 1, minWidth: 0 },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 22 },
  section: { fontSize: 12, letterSpacing: 0.7, color: theme.colors.textMuted, fontFamily: theme.fontFamily.bold, marginBottom: 12 },

  card: { borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontFamily: theme.fontFamily.semibold, color: theme.colors.textStrong },
  rowSub: { fontSize: 12, color: theme.colors.textDim, marginTop: 1 },

  quietCard: { padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  quietRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  quietIcon: { backgroundColor: 'rgba(154,140,240,0.16)' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  timeBox: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.25)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  timeLabel: { fontSize: 11, color: theme.colors.textDim },
  timeValue: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 20, color: theme.colors.textStrong, marginTop: 3 },
  timeArrow: { color: theme.colors.textMuted, fontSize: 18 },

  track: { width: 48, height: 28, borderRadius: 14, paddingHorizontal: 3, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  fillInner: { flex: 1, borderRadius: 14 },
}));
