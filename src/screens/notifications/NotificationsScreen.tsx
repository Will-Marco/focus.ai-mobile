import React from 'react';
import { ScrollView, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AiOrb, Screen, ScreenHeader, Text } from '@shared/ui';
import type { RootScreenProps } from '@shared/config/navigation';

// ⚠️ Mock xabarlar (UI build) — kelgan push'lar M7 (Notifee) + sync'da real to'ldiriladi.
interface Msg {
  id: string;
  ai?: boolean;
  d?: string;
  color?: string;
  /** `notif.sample.<tKey>Title` / `…Body` kalitlari. */
  tKey: string;
  /** Vaqt yorlig'i: literal ("20:30") yoki `notif.sample` kaliti. */
  time: string;
  unread?: boolean;
}
// Namuna ro'yxat (M7 — real bildirishnoma tarixi hali yig'ilmaydi). Matnlar i18n'da:
// `notif.sample.*` — til almashganda bular ham tarjima bo'ladi.
const TODAY: Msg[] = [
  { id: '1', ai: true, tKey: 'goal', time: 'goalTime', unread: true },
  { id: '2', d: 'M12 2c1 3-1 4.5-2 6.5s.5 4 2.5 4 3-2.5 1.5-5.5c2.5 1.5 4 4.5 4 7.5a6 6 0 11-12 0', color: '#F2603E', tKey: 'streak', time: '20:30', unread: true },
];
const EARLIER: Msg[] = [
  { id: '3', d: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM5 4v3a3 3 0 003 3M19 4v3a3 3 0 01-3 3', color: '#F2C879', tKey: 'badge', time: 'yesterday' },
  { id: '4', d: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 19c0-3 3-5 6-5s6 2 6 5', color: '#5FD0C5', tKey: 'team', time: 'yesterday' },
  { id: '5', d: 'M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9z', color: '#9A8CF0', tKey: 'weekly', time: 'days2' },
  { id: '6', d: 'M12 6v6l4 2M12 3a9 9 0 100 18 9 9 0 000-18z', color: '#F2A24C', tKey: 'habit', time: 'days3' },
];

export function NotificationsScreen({ navigation }: RootScreenProps<'Notifications'>) {
  const { t } = useTranslation();

  return (
    <Screen edges={['top']}>
      <ScreenHeader title={t('notif.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>{t('notif.today')}</Text>
        <View style={styles.group}>
          {TODAY.map((m) => (
            <MsgCard key={m.id} msg={m} />
          ))}
        </View>

        <Text style={styles.section}>{t('notif.earlier')}</Text>
        <View style={styles.group}>
          {EARLIER.map((m) => (
            <MsgCard key={m.id} msg={m} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

/** Vaqt yorlig'i: `days<N>` → "N kun oldin", boshqa kalitlar `notif.sample` dan, literal ("20:30") o'zicha. */
function timeLabel(value: string, t: TFunction): string {
  const days = /^days(\d+)$/.exec(value);
  if (days) return t('notif.sample.daysAgo', { n: Number(days[1]) });
  if (value === 'yesterday' || value === 'goalTime') return t(`notif.sample.${value}`);
  return value;
}

function MsgCard({ msg }: { msg: Msg }) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  return (
    <View style={[styles.card, msg.unread && styles.cardUnread]}>
      {msg.ai ? (
        <AiOrb size={38} />
      ) : (
        <LinearGradient colors={[msg.color ?? theme.colors.brand, '#F2603E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
          <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={theme.colors.onBrand} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d={msg.d} />
          </Svg>
        </LinearGradient>
      )}
      <View style={styles.flex1}>
        <View style={styles.top}>
          <View style={styles.appRow}>
            {msg.unread ? <View style={styles.unreadDot} /> : null}
            <Text style={styles.app}>Focus AI</Text>
          </View>
          <Text style={styles.time}>{timeLabel(msg.time, t)}</Text>
        </View>
        <Text style={styles.title}>{t(`notif.sample.${msg.tKey}Title`)}</Text>
        <Text style={styles.body}>{t(`notif.sample.${msg.tKey}Body`)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  flex1: { flex: 1, minWidth: 0 },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28 },
  section: { fontSize: 12, letterSpacing: 0.7, color: theme.colors.textMuted, fontFamily: theme.fontFamily.bold, marginBottom: 12, marginTop: 10 },
  group: { gap: 10 },

  card: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  cardUnread: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: 'rgba(242,162,76,0.22)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  unreadDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.brandCoral },
  app: { fontSize: 12, fontFamily: theme.fontFamily.bold, color: theme.colors.goldSoft },
  time: { fontSize: 11, color: theme.colors.textDim },
  title: { fontSize: 14, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong, marginTop: 2 },
  body: { fontSize: 13, color: theme.colors.textMuted, marginTop: 1, lineHeight: 18 },
}));
