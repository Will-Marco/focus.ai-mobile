import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { CheckIcon, ChevronLeftIcon, ProgressRing, RadialBackground, RadialGlow, Text } from '@shared/ui';
import { usePulse } from '@shared/lib/animation/usePulse';

// ⚠️ Mock data (UI build) — Team/presence/feed M9 (Supabase Realtime)da real ulanadi.
type Status = 'focusing' | 'online' | 'offline';
interface Member {
  id: string;
  name: string;
  ini: string;
  color: string;
  habit?: string;
  status: Status;
  startMs?: number;
  targetMs?: number;
  completed?: boolean;
  note?: string;
}
interface FeedItem {
  id: string;
  text: string;
  ago: string;
  color: string;
}
type View4 = 'list' | 'detail' | 'invite' | 'invitation';

const TEAL = '#5FD0C5';
const GREEN = '#9bd07f';

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const initialMembers = (now: number): Member[] => [
  { id: 'm1', name: 'Dilnoza', ini: 'D', color: '#F2A24C', habit: 'Chuqur ish', status: 'focusing', startMs: now - 32 * 60000, targetMs: 45 * 60000 },
  { id: 'm2', name: 'Sardor', ini: 'S', color: TEAL, habit: 'Mutolaa', status: 'focusing', startMs: now - 12 * 60000, targetMs: 25 * 60000 },
  { id: 'm3', name: 'Kamola', ini: 'K', color: '#EC5C7D', status: 'online', note: "bo'sh" },
  { id: 'me', name: 'Aziz (sen)', ini: 'A', color: '#F2603E', status: 'online', note: 'fokusda emas' },
  { id: 'm4', name: 'Jasur', ini: 'J', color: '#9A8CF0', status: 'offline', note: '2 soat oldin' },
];

const initialFeed: FeedItem[] = [
  { id: 'f1', text: 'Dilnoza Chuqur ish sessiyasini boshladi', ago: '5 daq oldin', color: '#F2A24C' },
  { id: 'f2', text: 'Sen 45 daqiqalik sessiyani yakunlading', ago: '22 daq oldin', color: '#F2603E' },
  { id: 'f3', text: "Kamola guruhga qo'shildi", ago: '1 soat oldin', color: '#EC5C7D' },
];

const SUGGESTIONS = [
  { id: 's1', name: 'Bekzod', handle: '@bekzod', ini: 'B', color: '#F2C879' },
  { id: 's2', name: 'Madina', handle: '@madina_k', ini: 'M', color: '#EC5C7D' },
  { id: 's3', name: 'Oybek', handle: '@oybek', ini: 'O', color: '#9A8CF0' },
];

export function TeamScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [view, setView] = useState<View4>('list');
  const [now, setNow] = useState(() => Date.now());
  const [members, setMembers] = useState<Member[]>(() => initialMembers(Date.now()));
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);
  const [banner, setBanner] = useState<{ name: string; habit: string } | null>(null);
  const [invitePending, setInvitePending] = useState(true);
  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Jonli tick (faqat detail) — timerlar/ringlar yangilanadi, maqsadga yetganlar yakunlanadi.
  useEffect(() => {
    if (view !== 'detail') return;
    const id = setInterval(() => {
      const t2 = Date.now();
      setNow(t2);
      setMembers((prev) => {
        const done = prev.find(
          (m) => m.status === 'focusing' && !m.completed && m.startMs != null && m.targetMs != null && t2 - m.startMs >= m.targetMs,
        );
        if (!done) return prev;
        const mins = Math.round((done.targetMs ?? 0) / 60000);
        setFeed((f) => [
          { id: `f${t2}`, text: `${done.name} ${mins} daqiqalik ${done.habit} sessiyasini yakunladi`, ago: 'hozir', color: done.color },
          ...f,
        ]);
        setBanner({ name: done.name, habit: done.habit ?? '' });
        if (bannerTimer.current) clearTimeout(bannerTimer.current);
        bannerTimer.current = setTimeout(() => setBanner(null), 4000);
        return prev.map((m) => (m.id === done.id ? { ...m, status: 'online', completed: true, note: 'hozir yakunladi' } : m));
      });
    }, 1000);
    return () => clearInterval(id);
  }, [view]);

  useEffect(
    () => () => {
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
    },
    [],
  );

  const openGroup = () => {
    const t2 = Date.now();
    setNow(t2);
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === 'm1') return { ...m, startMs: t2 - 32 * 60000, completed: false, status: 'focusing' };
        if (m.id === 'm2') return { ...m, startMs: t2 - ((m.targetMs ?? 0) - 9000), completed: false, status: 'focusing', note: undefined };
        return m;
      }),
    );
    setView('detail');
  };

  const focusing = members.filter((m) => m.status === 'focusing');
  const online = members.filter((m) => m.status === 'online');
  const offline = members.filter((m) => m.status === 'offline');

  if (view === 'invitation') {
    return (
      <InvitationView
        onAccept={() => {
          setInvitePending(false);
          setView('list');
        }}
        onReject={() => {
          setInvitePending(false);
          setView('list');
        }}
        onBack={() => setView('list')}
      />
    );
  }

  if (view === 'invite') {
    return (
      <Screen2>
        <Header onBack={() => setView('detail')} title={t('team.inviteMember')} />
        <View style={styles.invBody}>
          <View style={styles.search}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#8a7263" strokeWidth={2}>
              <Circle cx="11" cy="11" r="7" />
              <Path d="M21 21l-4-4" />
            </Svg>
            <TextInput placeholder={t('team.searchPlaceholder')} placeholderTextColor={theme.colors.textDim} style={styles.searchInput} />
          </View>
          <View>
            <Text style={styles.section}>{t('team.canInvite')}</Text>
            <View style={styles.gap8}>
              {SUGGESTIONS.map((s) => {
                const inv = !!invited[s.id];
                return (
                  <View key={s.id} style={styles.suggRow}>
                    <MemberAvatar color={s.color} ini={s.ini} size={40} />
                    <View style={styles.flex1}>
                      <Text style={styles.suggName}>{s.name}</Text>
                      <Text style={styles.suggHandle}>{s.handle}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setInvited((p) => ({ ...p, [s.id]: true }))}
                      style={inv ? styles.inviteBtnOff : null}
                    >
                      {inv ? (
                        <Text style={styles.inviteBtnOffTxt}>{t('team.invitedBtn')}</Text>
                      ) : (
                        <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.inviteBtnOn}>
                          <Text style={styles.inviteBtnOnTxt}>{t('team.inviteBtn')}</Text>
                        </LinearGradient>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Screen2>
    );
  }

  if (view === 'detail') {
    return (
      <Screen2>
        <View style={styles.detailHead}>
          <Pressable accessibilityRole="button" onPress={() => setView('list')} style={styles.circleBtn}>
            <ChevronLeftIcon size={20} color={theme.colors.text} />
          </Pressable>
          <View style={styles.flex1}>
            <Text style={styles.detailTitle} numberOfLines={1}>
              Imtihonga tayyorgarlik
            </Text>
            <View style={styles.detailMetaRow}>
              <LiveDot size={6} color={TEAL} />
              <Text style={styles.detailMeta}>
                {focusing.length} {t('team.nowFocusing')} · 5 {t('team.memberUnit')}
              </Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setView('invite')} style={styles.inviteIconBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={theme.colors.gold} strokeWidth={2}>
              <Circle cx="9" cy="8" r="3.2" />
              <Path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M18 8v6M21 11h-6" />
            </Svg>
          </Pressable>
        </View>

        {banner ? (
          <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
            <View style={styles.bannerCheck}>
              <CheckIcon size={18} color="#fff" strokeWidth={3} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.bannerTitle}>{banner.name} {t('team.reachedGoal')}</Text>
              <Text style={styles.bannerSub}>
                {banner.habit} · {t('team.justFinished')}
              </Text>
            </View>
          </LinearGradient>
        ) : null}

        <ScrollView contentContainerStyle={styles.detailBody} showsVerticalScrollIndicator={false}>
          <View>
            <Text style={[styles.sectionGold]}>
              {t('team.focusingNow')} · {focusing.length}
            </Text>
            <View style={styles.gap10}>
              {focusing.map((m) => {
                const elapsed = now - (m.startMs ?? now);
                const progress = Math.min(elapsed / (m.targetMs ?? 1), 1);
                return (
                  <View key={m.id} style={styles.focusRow}>
                    <View style={styles.avatarWrap}>
                      <MemberAvatar color={m.color} ini={m.ini} size={46} />
                      <View style={[styles.presenceDot, styles.presenceFocus]} />
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.memberName}>{m.name}</Text>
                      <Text style={styles.memberSub}>
                        {m.habit} · {Math.round((m.targetMs ?? 0) / 60000)} {t('team.fromMinutes')}
                      </Text>
                    </View>
                    <View style={styles.focusRight}>
                      <Text variant="mono" style={styles.focusTime}>
                        {fmt(elapsed)}
                      </Text>
                      <ProgressRing size={38} strokeWidth={4} progress={progress} color={m.color} trackOpacity={0.1} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View>
            <Text style={styles.section}>
              {t('team.online')} · {online.length}
            </Text>
            <View style={styles.gap8}>
              {online.map((m) => (
                <View key={m.id} style={styles.onlineRow}>
                  <View style={styles.avatarWrap}>
                    <MemberAvatar color={m.color} ini={m.ini} size={38} />
                    <View style={[styles.presenceDotSm, styles.presenceOnline]} />
                  </View>
                  <Text style={[styles.flex1, styles.onlineName]}>{m.name}</Text>
                  <Text style={styles.note}>{m.note}</Text>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.sectionDim}>
              {t('team.offline')} · {offline.length}
            </Text>
            {offline.map((m) => (
              <View key={m.id} style={styles.offlineRow}>
                <MemberAvatar color="#3a2e24" ini={m.ini} size={38} mutedText />
                <Text style={[styles.flex1, styles.offlineName]}>{m.name}</Text>
                <Text style={styles.noteDim}>{m.note}</Text>
              </View>
            ))}
          </View>

          <View>
            <Text style={styles.section}>{t('team.activity')}</Text>
            {feed.map((ev) => (
              <View key={ev.id} style={styles.feedRow}>
                <View style={[styles.feedDot, { backgroundColor: ev.color }]} />
                <View style={styles.flex1}>
                  <Text style={styles.feedText}>{ev.text}</Text>
                  <Text style={styles.feedAgo}>{ev.ago}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </Screen2>
    );
  }

  // ----- LIST -----
  return (
    <Screen2>
      <View style={styles.listHead}>
        <View>
          <Text style={styles.subtitle}>{t('team.subtitle')}</Text>
          <Text style={styles.title}>{t('team.title')}</Text>
        </View>
        <Pressable accessibilityRole="button" style={styles.plusBtn}>
          <Text style={styles.plusTxt}>+</Text>
        </Pressable>
      </View>

      {invitePending ? (
        <Pressable accessibilityRole="button" onPress={() => setView('invitation')} style={styles.inviteBanner}>
          <View style={styles.inviteBannerIcon}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={theme.colors.gold} strokeWidth={2}>
              <Rect x="3" y="5" width="18" height="14" rx="2" />
              <Path d="M3 8l9 6 9-6" />
            </Svg>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.inviteBannerTitle}>{t('team.newInviteTitle')}</Text>
            <Text style={styles.inviteBannerSub}>Nigora sizni "Dizaynerlar" guruhiga taklif qildi</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.listBody} showsVerticalScrollIndicator={false}>
        <GroupCard name="Imtihonga tayyorgarlik" color="#F2A24C" live={focusing.length} members={5} mem={members} onPress={openGroup} />
        <GroupCard name="Erta turuvchilar" color={TEAL} live={1} members={8} mem={members.slice(0, 4)} onPress={() => {}} />
        <View style={styles.createBtn}>
          <Text style={styles.createPlus}>+</Text>
          <Text style={styles.createTxt}>{t('team.createGroup')}</Text>
        </View>
      </ScrollView>
    </Screen2>
  );
}

// ---------- sub-komponentlar ----------

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

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.simpleHead}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.circleBtn}>
        <ChevronLeftIcon size={20} color={theme.colors.text} />
      </Pressable>
      <Text style={styles.simpleTitle}>{title}</Text>
    </View>
  );
}

function MemberAvatar({ color, ini, size, mutedText }: { color: string; ini: string; size: number; mutedText?: boolean }) {
  return (
    // eslint-disable-next-line react-native/no-inline-styles -- o'lcham/rang dinamik
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[styles.avatarIni, mutedText ? styles.avatarIniMuted : null, { fontSize: size * 0.37 }]}>{ini}</Text>
    </View>
  );
}

function AvatarStack({ mem }: { mem: Member[] }) {
  return (
    <View style={styles.row}>
      {mem.slice(0, 4).map((m, i) => (
        // eslint-disable-next-line react-native/no-inline-styles -- rang/overlap dinamik
        <View key={m.id} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: m.color, alignItems: 'center', justifyContent: 'center', marginLeft: i ? -8 : 0, borderWidth: 2, borderColor: '#16100a' }}>
          <Text style={styles.stackIni}>{m.ini}</Text>
        </View>
      ))}
    </View>
  );
}

function LiveDot({ size = 7, color = TEAL }: { size?: number; color?: string }) {
  const pulse = usePulse(0.35, 1, 800);
  const st = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, st]} />;
}

function GroupCard({ name, color, live, members, mem, onPress }: { name: string; color: string; live: number; members: number; mem: Member[]; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.groupCard}>
      <View style={[styles.groupBar, { backgroundColor: color }]} />
      <View style={styles.groupBody}>
        <View style={styles.rowBetween}>
          <Text style={styles.groupName}>{name}</Text>
          <View style={styles.liveRow}>
            <LiveDot />
            <Text style={styles.liveTxt}>
              {live} {t('team.focusingUnit')}
            </Text>
          </View>
        </View>
        <View style={[styles.rowBetween, styles.groupFooter]}>
          <AvatarStack mem={mem} />
          <Text style={styles.memberText}>
            {members} {t('team.memberUnit')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function InvitationView({ onAccept, onReject, onBack }: { onAccept: () => void; onReject: () => void; onBack: () => void }) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  return (
    <View style={styles.flex1}>
      <RadialBackground colors={[...theme.colors.sessionBg]} positions={[0, 0.5, 1]} center={{ x: 0.5, y: 0.06 }} />
      <RadialGlow size={300} color={theme.colors.brand} blur={34} opacity={0.16} style={styles.invitationGlow} />
      <SafeAreaView style={styles.flex1} edges={['top', 'bottom']}>
        <View style={styles.invitationTop}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.circleBtn}>
            <ChevronLeftIcon size={20} color={theme.colors.text} />
          </Pressable>
        </View>
        <View style={styles.invitationCenter}>
          <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.invitationAvatar}>
            <Text style={styles.invitationAvatarTxt}>D</Text>
          </LinearGradient>
          <Text style={styles.invitationFrom}>Nigora sizni taklif qilmoqda</Text>
          <Text style={styles.invitationName}>Dizaynerlar uyushmasi</Text>
          <Text style={styles.invitationSub}>Kunlik birga-fokus · 6 {t('team.memberUnit')}</Text>
          <View style={styles.invitationAvatars}>
            {['#F2A24C', TEAL, '#EC5C7D', '#9A8CF0', '#F2C879', '#F2603E'].map((c, i) => (
              // eslint-disable-next-line react-native/no-inline-styles -- rang/overlap dinamik
              <View key={c} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c, marginLeft: i ? -10 : 0, borderWidth: 2, borderColor: '#160f09' }} />
            ))}
          </View>
          <Text style={styles.invitationNames}>Dilnoza, Sardor, Kamola va yana 3 kishi</Text>
        </View>
        <View style={styles.invitationActions}>
          <Pressable accessibilityRole="button" onPress={onAccept} style={styles.acceptWrap}>
            <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.acceptBtn}>
              <Text style={styles.acceptTxt}>{t('team.accept')}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onReject} style={styles.rejectBtn}>
            <Text style={styles.rejectTxt}>{t('team.reject')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  flex1: { flex: 1 },
  row: { flexDirection: 'row' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gap8: { gap: 8 },
  gap10: { gap: 10 },

  // List header
  listHead: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subtitle: { fontSize: 13, color: theme.colors.textMuted },
  title: { fontSize: 26, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong, lineHeight: 29 },
  plusBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.surfaceStrong, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  plusTxt: { fontSize: 24, color: theme.colors.gold, marginTop: -2 },

  // invite banner (list)
  inviteBanner: { marginHorizontal: 20, marginTop: 10, marginBottom: 4, padding: 14, borderRadius: 18, backgroundColor: 'rgba(242,162,76,0.10)', borderWidth: 1, borderColor: 'rgba(242,162,76,0.3)', flexDirection: 'row', alignItems: 'center', gap: 13 },
  inviteBannerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(242,162,76,0.18)', alignItems: 'center', justifyContent: 'center' },
  inviteBannerTitle: { fontSize: 14, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  inviteBannerSub: { fontSize: 12, color: theme.colors.textMuted },
  chev: { color: theme.colors.gold, fontSize: 18 },

  listBody: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24, gap: 12 },
  groupCard: { borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.035)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  groupBar: { height: 4 },
  groupBody: { padding: 16 },
  groupName: { fontSize: 17, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveTxt: { fontSize: 12, color: theme.colors.goldSoft },
  groupFooter: { marginTop: 12 },
  memberText: { fontSize: 12, color: theme.colors.textMuted },
  stackIni: { fontFamily: theme.fontFamily.bold, fontSize: 12, color: theme.colors.onBrand },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(242,162,76,0.4)', marginTop: 2 },
  createPlus: { fontSize: 20, color: theme.colors.gold },
  createTxt: { fontSize: 15, fontFamily: theme.fontFamily.semibold, color: theme.colors.gold },

  // detail head
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceStrong, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { fontSize: 19, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong, lineHeight: 21 },
  detailMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  detailMeta: { fontSize: 12, color: theme.colors.textMuted },
  inviteIconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(242,162,76,0.14)', borderWidth: 1, borderColor: 'rgba(242,162,76,0.3)', alignItems: 'center', justifyContent: 'center' },

  banner: { marginHorizontal: 18, marginVertical: 6, paddingVertical: 13, paddingHorizontal: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerCheck: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 14, fontFamily: theme.fontFamily.extrabold, color: theme.colors.onBrand },
  bannerSub: { fontSize: 12, fontFamily: theme.fontFamily.semibold, color: theme.colors.onBrand, opacity: 0.85 },

  detailBody: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24, gap: 16 },
  section: { fontSize: 12, letterSpacing: 0.7, color: theme.colors.textMuted, fontFamily: theme.fontFamily.bold, marginBottom: 10 },
  sectionGold: { fontSize: 12, letterSpacing: 0.7, color: theme.colors.gold, fontFamily: theme.fontFamily.bold, marginBottom: 10 },
  sectionDim: { fontSize: 12, letterSpacing: 0.7, color: theme.colors.textDim, fontFamily: theme.fontFamily.bold, marginBottom: 10 },

  focusRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(242,162,76,0.18)' },
  avatarWrap: { position: 'relative' },
  presenceDot: { position: 'absolute', right: -1, bottom: -1, width: 13, height: 13, borderRadius: 6.5, borderWidth: 2, borderColor: '#1c130c' },
  presenceDotSm: { position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: 5.5, borderWidth: 2, borderColor: '#16100a' },
  presenceFocus: { backgroundColor: TEAL },
  presenceOnline: { backgroundColor: GREEN },
  memberName: { fontSize: 15, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  memberSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  focusRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  focusTime: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 16, color: theme.colors.goldSoft },

  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.025)' },
  onlineName: { fontSize: 14, fontFamily: theme.fontFamily.semibold, color: theme.colors.text },
  note: { fontSize: 12, color: theme.colors.textMuted },
  offlineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 16, opacity: 0.55 },
  offlineName: { fontSize: 14, fontFamily: theme.fontFamily.semibold, color: theme.colors.textMuted },
  noteDim: { fontSize: 12, color: theme.colors.textDim },

  feedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, paddingVertical: 9 },
  feedDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  feedText: { fontSize: 13, color: theme.colors.text, lineHeight: 18 },
  feedAgo: { fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },

  avatarIni: { fontFamily: theme.fontFamily.extrabold, color: theme.colors.onBrand },
  avatarIniMuted: { color: theme.colors.textMuted },

  // invite view
  simpleHead: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 },
  simpleTitle: { fontSize: 20, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong },
  invBody: { paddingHorizontal: 20, paddingTop: 8, gap: 18 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderRadius: 14, backgroundColor: theme.colors.surfaceStrong, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16 },
  searchInput: { flex: 1, color: theme.colors.textStrong, fontSize: 15, fontFamily: theme.fontFamily.regular, padding: 0 },
  suggRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)' },
  suggName: { fontSize: 15, fontFamily: theme.fontFamily.semibold, color: theme.colors.textStrong },
  suggHandle: { fontSize: 12, color: theme.colors.textDim },
  inviteBtnOn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.pill },
  inviteBtnOnTxt: { fontSize: 13, fontFamily: theme.fontFamily.bold, color: theme.colors.onBrand },
  inviteBtnOff: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.pill, backgroundColor: theme.colors.surfaceStrong, borderWidth: 1, borderColor: theme.colors.borderStrong },
  inviteBtnOffTxt: { fontSize: 13, fontFamily: theme.fontFamily.bold, color: theme.colors.textMuted },

  // invitation view
  invitationGlow: { position: 'absolute', left: '50%', marginLeft: -150, top: -40 },
  invitationTop: { paddingHorizontal: 18, paddingTop: 14 },
  invitationCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  invitationAvatar: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: theme.colors.brandCoral, shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 16 }, elevation: 12 },
  invitationAvatarTxt: { fontSize: 34, fontFamily: theme.fontFamily.extrabold, color: theme.colors.onBrand },
  invitationFrom: { fontSize: 13, color: theme.colors.gold, letterSpacing: 0.4 },
  invitationName: { fontSize: 26, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong, marginTop: 6, marginBottom: 4, textAlign: 'center' },
  invitationSub: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 22 },
  invitationAvatars: { flexDirection: 'row', marginBottom: 8 },
  invitationNames: { fontSize: 13, color: theme.colors.textDim, marginTop: 8, textAlign: 'center' },
  invitationActions: { paddingHorizontal: 22, paddingBottom: 34, gap: 12 },
  acceptWrap: { borderRadius: 18, overflow: 'hidden', shadowColor: theme.colors.brandCoral, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  acceptBtn: { height: 56, alignItems: 'center', justifyContent: 'center' },
  acceptTxt: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: theme.colors.onBrand },
  rejectBtn: { height: 52, borderRadius: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  rejectTxt: { fontSize: 15, fontFamily: theme.fontFamily.semibold, color: theme.colors.textMuted },
}));
