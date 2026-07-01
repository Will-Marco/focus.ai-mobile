import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeftIcon, GroupCardSkeleton, MemberRowSkeleton, ProgressRing, RadialBackground, RadialGlow, Text } from '@shared/ui';
import { usePulse } from '@shared/lib/animation/usePulse';
import { haptics } from '@shared/lib/haptics';
import { supabase } from '@shared/api/supabase';
import { isSupabaseConfigured } from '@shared/config/env';
import { useProfileStore } from '@entities/profile';
import { GROUP_COLORS, groupRepo, useGroupStore, type GroupSummary, type Invite } from '@entities/group';
import { useGroupRoom, useRoomPresence } from '@features/focus-room';

type View5 = 'list' | 'detail' | 'invite' | 'invitation' | 'create';

const TEAL = '#5FD0C5';
const GREEN = '#9bd07f';

// Team timer: <1soat → MM:SS, aks holда HH:MM:SS (padded soat, Sir talabi).
const fmt = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
};

const initial = (name: string) => (name.trim()[0] ?? '?').toUpperCase();

function agoText(createdAt: number, now: number, t: (k: string) => string): string {
  const s = Math.max(0, Math.floor((now - createdAt) / 1000));
  if (s < 60) return t('team.now');
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} ${t('team.minAgo')}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${t('team.hourAgo')}`;
  return `${Math.floor(h / 24)} ${t('team.dayAgo')}`;
}

export function TeamScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const isRegistered = useProfileStore((s) => s.profile?.authMode === 'registered');
  const online = isSupabaseConfigured && isRegistered;

  const groups = useGroupStore((s) => s.groups);
  const invites = useGroupStore((s) => s.invites);
  const refresh = useGroupStore((s) => s.refresh);
  const listLoading = useGroupStore((s) => s.loading);

  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<View5>('list');
  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Yangi guruh / taklif formasi holati.
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState<string>(GROUP_COLORS[0]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Faol guruh kanali — faqat detail ko'rinishida.
  const activeGroupId = view === 'detail' && group ? group.id : null;
  const presences = useRoomPresence(activeGroupId, userId);
  const { members, feed, loading: roomLoading, reload } = useGroupRoom(activeGroupId);

  const onRefreshList = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const onRefreshDetail = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  useEffect(() => {
    if (!online || !supabase) return;
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [online]);

  useFocusEffect(
    useCallback(() => {
      if (online) refresh().catch(() => {});
    }, [online, refresh]),
  );

  // Jonli tick (detail) — fokus timerlari/ringlari va feed "ago".
  useEffect(() => {
    if (view !== 'detail') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [view]);

  // ── Gate: mehmon yoki online sozlanmagan ──
  if (!online) {
    return (
      <Screen2>
        <View style={styles.listHead}>
          <View>
            <Text style={styles.subtitle}>{t('team.subtitle')}</Text>
            <Text style={styles.title}>{t('team.title')}</Text>
          </View>
        </View>
        <View style={styles.gate}>
          <RadialGlow size={200} color={theme.colors.brand} blur={30} opacity={0.14} style={styles.gateGlow} />
          <Text style={styles.gateTitle}>{t('team.gateTitle')}</Text>
          <Text style={styles.gateSub}>{t('team.gateSub')}</Text>
        </View>
      </Screen2>
    );
  }

  // ── INVITATION (kelgan taklif) ──
  if (view === 'invitation' && invite) {
    const respond = async (accept: boolean) => {
      setBusy(true);
      await groupRepo.respondInvite(invite, accept);
      await refresh();
      setBusy(false);
      setInvite(null);
      setView('list');
    };
    return (
      <InvitationView
        groupName={invite.groupName ?? t('team.aGroup')}
        busy={busy}
        onAccept={() => respond(true)}
        onReject={() => respond(false)}
        onBack={() => setView('list')}
      />
    );
  }

  // ── INVITE (email bo'yicha taklif yuborish) ──
  if (view === 'invite' && group) {
    const send = async () => {
      if (!inviteEmail.includes('@')) return;
      setBusy(true);
      haptics.light();
      const ok = await groupRepo.createInvite(group.id, inviteEmail);
      setBusy(false);
      if (ok) {
        setInviteSent(true);
        setInviteEmail('');
      }
    };
    return (
      <Screen2>
        <Header onBack={() => setView('detail')} title={t('team.inviteMember')} />
        <View style={styles.invBody}>
          <View style={styles.search}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#8a7263" strokeWidth={2}>
              <Path d="M4 6h16v12H4zM4 7l8 6 8-6" />
            </Svg>
            <TextInput
              placeholder={t('team.inviteEmailPlaceholder')}
              placeholderTextColor={theme.colors.textDim}
              cursorColor={theme.colors.brand}
              selectionColor={theme.colors.brand}
              style={styles.searchInput}
              value={inviteEmail}
              onChangeText={(v) => {
                setInviteEmail(v);
                setInviteSent(false);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <Pressable accessibilityRole="button" onPress={send} disabled={busy} style={styles.sendWrap}>
            <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sendBtn}>
              <Text style={styles.sendTxt}>{busy ? t('team.sending') : t('team.sendInvite')}</Text>
            </LinearGradient>
          </Pressable>
          {inviteSent ? <Text style={styles.sentNote}>{t('team.inviteSent')}</Text> : null}
        </View>
      </Screen2>
    );
  }

  // ── CREATE (yangi guruh) ──
  if (view === 'create') {
    const create = async () => {
      if (groupName.trim().length < 2) {
        setFormError('team.nameShort');
        return;
      }
      setFormError(null);
      setBusy(true);
      haptics.light();
      const g = await groupRepo.createGroup(groupName.trim(), groupColor);
      await refresh();
      setBusy(false);
      if (g) {
        setGroupName('');
        setView('list');
      } else {
        setFormError('team.createFailed');
      }
    };
    return (
      <Screen2>
        <Header onBack={() => setView('list')} title={t('team.createTitle')} />
        <View style={styles.invBody}>
          <View style={styles.search}>
            <TextInput
              placeholder={t('team.groupNamePlaceholder')}
              placeholderTextColor={theme.colors.textDim}
              cursorColor={theme.colors.brand}
              selectionColor={theme.colors.brand}
              style={styles.searchInput}
              value={groupName}
              onChangeText={(v) => {
                setGroupName(v);
                setFormError(null);
              }}
              maxLength={40}
            />
          </View>
          <View>
            <Text style={styles.section}>{t('team.colorLabel')}</Text>
            <View style={styles.colorRow}>
              {GROUP_COLORS.map((c) => (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  onPress={() => {
                    haptics.selection();
                    setGroupColor(c);
                  }}
                  style={[styles.colorDot, { backgroundColor: c }, groupColor === c && styles.colorDotOn]}
                />
              ))}
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={create} disabled={busy} style={styles.sendWrap}>
            <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sendBtn}>
              <Text style={styles.sendTxt}>{busy ? t('team.creating') : t('team.create')}</Text>
            </LinearGradient>
          </Pressable>
          {formError ? <Text style={styles.errNote}>{t(formError)}</Text> : null}
        </View>
      </Screen2>
    );
  }

  // ── DETAIL (guruh xonasi — jonli) ──
  if (view === 'detail' && group) {
    const presById = new Map(presences.map((p) => [p.userId, p]));
    const focusing = presences.filter((p) => p.focusing);
    const onlineMembers = presences.filter((p) => !p.focusing);
    const offlineMembers = members.filter((m) => !presById.has(m.userId));
    const meTag = (id: string) => (id === userId ? ` ${t('team.youSuffix')}` : '');

    return (
      <Screen2>
        <View style={styles.detailHead}>
          <Pressable accessibilityRole="button" onPress={() => setView('list')} style={styles.circleBtn}>
            <ChevronLeftIcon size={20} color={theme.colors.text} />
          </Pressable>
          <View style={styles.flex1}>
            <Text style={styles.detailTitle} numberOfLines={1}>
              {group.name}
            </Text>
            <View style={styles.detailMetaRow}>
              <LiveDot size={6} color={TEAL} />
              <Text style={styles.detailMeta}>
                {focusing.length} {t('team.nowFocusing')} · {group.memberCount} {t('team.memberUnit')}
              </Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => { setInviteSent(false); setView('invite'); }} style={styles.inviteIconBtn}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={theme.colors.gold} strokeWidth={2}>
              <Circle cx="9" cy="8" r="3.2" />
              <Path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M18 8v6M21 11h-6" />
            </Svg>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.detailBody}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefreshDetail} tintColor={theme.colors.brand} colors={[theme.colors.brand]} />
          }
        >
          {roomLoading && members.length === 0 ? (
            <View style={styles.gap8}>
              <MemberRowSkeleton />
              <MemberRowSkeleton />
              <MemberRowSkeleton />
            </View>
          ) : null}
          {focusing.length > 0 ? (
            <View>
              <Text style={styles.sectionGold}>
                {t('team.focusingNow')} · {focusing.length}
              </Text>
              <View style={styles.gap10}>
                {focusing.map((m) => {
                  const running = m.runningSince != null;
                  const sessionElapsed = (m.accumulatedMs ?? 0) + (running ? Math.max(0, now - (m.runningSince ?? now)) : 0);
                  const dayTotal = (m.todayBaseMs ?? 0) + sessionElapsed; // bugungi JAMI (barcha odatlar)
                  const progress = Math.min(sessionElapsed / (m.targetMs ?? 1), 1);
                  return (
                    <View key={m.userId} style={styles.focusRow}>
                      <View style={styles.avatarWrap}>
                        <MemberAvatar color={m.color} ini={initial(m.name)} size={46} />
                        <View style={[styles.presenceDot, running ? styles.presenceFocus : styles.presenceOnline]} />
                      </View>
                      <View style={styles.flex1}>
                        <Text style={styles.memberName}>
                          {m.name}
                          {meTag(m.userId)}
                        </Text>
                        <Text style={styles.memberSub}>
                          {m.habit ?? ''} · {Math.round((m.targetMs ?? 0) / 60000)} {t('team.fromMinutes')}
                          {running ? '' : ` · ${t('team.paused')}`}
                        </Text>
                      </View>
                      <View style={styles.focusRight}>
                        <View style={styles.focusTimeCol}>
                          <Text variant="mono" style={[styles.focusTime, !running && styles.focusTimePaused]}>
                            {fmt(dayTotal)}
                          </Text>
                          <Text style={styles.focusCaption}>{t('team.todayTotal')}</Text>
                        </View>
                        <ProgressRing size={38} strokeWidth={4} progress={progress} color={m.color} trackOpacity={0.1} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View>
            <Text style={styles.section}>
              {t('team.online')} · {onlineMembers.length}
            </Text>
            <View style={styles.gap8}>
              {onlineMembers.map((m) => (
                <View key={m.userId} style={styles.onlineRow}>
                  <View style={styles.avatarWrap}>
                    <MemberAvatar color={m.color} ini={initial(m.name)} size={38} />
                    <View style={[styles.presenceDotSm, styles.presenceOnline]} />
                  </View>
                  <Text style={[styles.flex1, styles.onlineName]}>
                    {m.name}
                    {meTag(m.userId)}
                  </Text>
                  <Text style={styles.note}>
                    {m.todayBaseMs && m.todayBaseMs > 0
                      ? t('team.todayFocus', { time: fmt(m.todayBaseMs) })
                      : t('team.notFocusing')}
                  </Text>
                </View>
              ))}
              {onlineMembers.length === 0 ? <Text style={styles.note}>{t('team.noneOnline')}</Text> : null}
            </View>
          </View>

          {offlineMembers.length > 0 ? (
            <View>
              <Text style={styles.sectionDim}>
                {t('team.offline')} · {offlineMembers.length}
              </Text>
              {offlineMembers.map((m) => (
                <View key={m.userId} style={styles.offlineRow}>
                  <MemberAvatar color="#3a2e24" ini={initial(m.displayName)} size={38} mutedText />
                  <Text style={[styles.flex1, styles.offlineName]}>{m.displayName}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View>
            <Text style={styles.section}>{t('team.activity')}</Text>
            {feed.map((ev) => (
              <View key={ev.id} style={styles.feedRow}>
                <View style={[styles.feedDot, { backgroundColor: ev.color }]} />
                <View style={styles.flex1}>
                  <Text style={styles.feedText}>{ev.text}</Text>
                  <Text style={styles.feedAgo}>{agoText(ev.createdAt, now, t)}</Text>
                </View>
              </View>
            ))}
            {feed.length === 0 ? <Text style={styles.note}>{t('team.noActivity')}</Text> : null}
          </View>

          <Pressable accessibilityRole="button" onPress={() => { reload().catch(() => {}); }} style={styles.refreshRow}>
            <Text style={styles.refreshTxt}>{t('team.refresh')}</Text>
          </Pressable>
        </ScrollView>
      </Screen2>
    );
  }

  // ── LIST (guruhlar) ──
  const firstInvite = invites[0] ?? null;
  return (
    <Screen2>
      <View style={styles.listHead}>
        <View>
          <Text style={styles.subtitle}>{t('team.subtitle')}</Text>
          <Text style={styles.title}>{t('team.title')}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => setView('create')} style={styles.plusBtn}>
          <Text style={styles.plusTxt}>+</Text>
        </Pressable>
      </View>

      {firstInvite ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setInvite(firstInvite);
            setView('invitation');
          }}
          style={styles.inviteBanner}
        >
          <View style={styles.inviteBannerIcon}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={theme.colors.gold} strokeWidth={2}>
              <Rect x="3" y="5" width="18" height="14" rx="2" />
              <Path d="M3 8l9 6 9-6" />
            </Svg>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.inviteBannerTitle}>{t('team.newInviteTitle')}</Text>
            <Text style={styles.inviteBannerSub}>
              {t('team.invitedToGroup', { group: firstInvite.groupName ?? t('team.aGroup') })}
            </Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </Pressable>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.listBody}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefreshList} tintColor={theme.colors.brand} colors={[theme.colors.brand]} />
        }
      >
        {listLoading && groups.length === 0 ? (
          <>
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
          </>
        ) : (
          groups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              onPress={() => {
                setGroup(g);
                setView('detail');
              }}
            />
          ))
        )}
        {!listLoading && groups.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>{t('team.emptyTitle')}</Text>
            <Text style={styles.emptySub}>{t('team.emptySub')}</Text>
          </View>
        ) : null}
        <Pressable accessibilityRole="button" onPress={() => setView('create')} style={styles.createBtn}>
          <Text style={styles.createPlus}>+</Text>
          <Text style={styles.createTxt}>{t('team.createGroup')}</Text>
        </Pressable>
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

function LiveDot({ size = 7, color = TEAL }: { size?: number; color?: string }) {
  const pulse = usePulse(0.35, 1, 800);
  const st = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, st]} />;
}

function GroupCard({ group, onPress }: { group: GroupSummary; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.groupCard}>
      <View style={[styles.groupBar, { backgroundColor: group.color }]} />
      <View style={styles.groupBody}>
        <View style={styles.rowBetween}>
          <Text style={styles.groupName}>{group.name}</Text>
          <View style={styles.liveRow}>
            <LiveDot color={group.color} />
            <Text style={styles.liveTxt}>{t('team.live')}</Text>
          </View>
        </View>
        <View style={[styles.rowBetween, styles.groupFooter]}>
          <Text style={styles.memberText}>
            {group.memberCount} {t('team.memberUnit')}
          </Text>
          <Text style={styles.chev}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

function InvitationView({
  groupName,
  busy,
  onAccept,
  onReject,
  onBack,
}: {
  groupName: string;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
  onBack: () => void;
}) {
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
            <Text style={styles.invitationAvatarTxt}>{initial(groupName)}</Text>
          </LinearGradient>
          <Text style={styles.invitationFrom}>{t('team.invitedYou')}</Text>
          <Text style={styles.invitationName}>{groupName}</Text>
          <Text style={styles.invitationSub}>{t('team.invitationSub')}</Text>
        </View>
        <View style={styles.invitationActions}>
          <Pressable accessibilityRole="button" onPress={onAccept} disabled={busy} style={styles.acceptWrap}>
            <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.acceptBtn}>
              <Text style={styles.acceptTxt}>{busy ? t('team.sending') : t('team.accept')}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onReject} disabled={busy} style={styles.rejectBtn}>
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

  // gate (mehmon/sozlanmagan)
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 60 },
  gateGlow: { position: 'absolute', top: '30%' },
  gateTitle: { fontSize: 20, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong, textAlign: 'center', marginBottom: 8 },
  gateSub: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 20 },

  // invite banner (list)
  inviteBanner: { marginHorizontal: 20, marginTop: 10, marginBottom: 4, padding: 14, borderRadius: 18, backgroundColor: 'rgba(242,162,76,0.10)', borderWidth: 1, borderColor: 'rgba(242,162,76,0.3)', flexDirection: 'row', alignItems: 'center', gap: 13 },
  inviteBannerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(242,162,76,0.18)', alignItems: 'center', justifyContent: 'center' },
  inviteBannerTitle: { fontSize: 14, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  inviteBannerSub: { fontSize: 12, color: theme.colors.textMuted },
  chev: { color: theme.colors.gold, fontSize: 18 },

  listBody: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24, gap: 12 },
  groupCard: { borderRadius: 20, backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
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

  emptyBox: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong, marginBottom: 6 },
  emptySub: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 19 },

  // detail head
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 },
  circleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceStrong, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { fontSize: 19, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong, lineHeight: 21 },
  detailMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  detailMeta: { fontSize: 12, color: theme.colors.textMuted },
  inviteIconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(242,162,76,0.14)', borderWidth: 1, borderColor: 'rgba(242,162,76,0.3)', alignItems: 'center', justifyContent: 'center' },

  detailBody: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24, gap: 16 },
  section: { fontSize: 12, letterSpacing: 0.7, color: theme.colors.textMuted, fontFamily: theme.fontFamily.bold, marginBottom: 10 },
  sectionGold: { fontSize: 12, letterSpacing: 0.7, color: theme.colors.gold, fontFamily: theme.fontFamily.bold, marginBottom: 10 },
  sectionDim: { fontSize: 12, letterSpacing: 0.7, color: theme.colors.textDim, fontFamily: theme.fontFamily.bold, marginBottom: 10 },

  focusRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13, borderRadius: 18, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: 'rgba(242,162,76,0.18)' },
  avatarWrap: { position: 'relative' },
  presenceDot: { position: 'absolute', right: -1, bottom: -1, width: 13, height: 13, borderRadius: 6.5, borderWidth: 2, borderColor: theme.colors.background },
  presenceDotSm: { position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: 5.5, borderWidth: 2, borderColor: theme.colors.background },
  presenceFocus: { backgroundColor: TEAL },
  presenceOnline: { backgroundColor: GREEN },
  memberName: { fontSize: 15, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  memberSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  focusRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  focusTimeCol: { alignItems: 'flex-end' },
  focusTime: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 16, color: theme.colors.goldSoft },
  focusTimePaused: { color: theme.colors.textMuted },
  focusCaption: { fontSize: 10, color: theme.colors.textDim, marginTop: 1 },

  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 16, backgroundColor: theme.colors.surfaceAlt },
  onlineName: { fontSize: 14, fontFamily: theme.fontFamily.semibold, color: theme.colors.text },
  note: { fontSize: 12, color: theme.colors.textMuted },
  offlineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 16, opacity: 0.55 },
  offlineName: { fontSize: 14, fontFamily: theme.fontFamily.semibold, color: theme.colors.textMuted },
  noteDim: { fontSize: 12, color: theme.colors.textDim },

  feedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, paddingVertical: 9 },
  feedDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  feedText: { fontSize: 13, color: theme.colors.text, lineHeight: 18 },
  feedAgo: { fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  refreshRow: { alignItems: 'center', paddingVertical: 8 },
  refreshTxt: { fontSize: 13, fontFamily: theme.fontFamily.semibold, color: theme.colors.gold },

  avatarIni: { fontFamily: theme.fontFamily.extrabold, color: theme.colors.onBrand },
  avatarIniMuted: { color: theme.colors.textMuted },

  // invite / create view
  simpleHead: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 },
  simpleTitle: { fontSize: 20, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong },
  invBody: { paddingHorizontal: 20, paddingTop: 8, gap: 18 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderRadius: 14, backgroundColor: theme.colors.surfaceStrong, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16 },
  searchInput: { flex: 1, color: theme.colors.textStrong, fontSize: 15, fontFamily: theme.fontFamily.regular, padding: 0 },
  colorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorDot: { width: 40, height: 40, borderRadius: 20 },
  colorDotOn: { borderWidth: 3, borderColor: theme.colors.textStrong },
  sendWrap: { borderRadius: 16, overflow: 'hidden' },
  sendBtn: { height: 54, alignItems: 'center', justifyContent: 'center' },
  sendTxt: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: theme.colors.onBrand },
  sentNote: { fontSize: 13, color: theme.colors.gold, textAlign: 'center' },
  errNote: { fontSize: 13, color: theme.colors.brandCoral, textAlign: 'center' },

  // invitation view
  invitationGlow: { position: 'absolute', left: '50%', marginLeft: -150, top: -40 },
  invitationTop: { paddingHorizontal: 18, paddingTop: 14 },
  invitationCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  invitationAvatar: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: theme.colors.brandCoral, shadowOpacity: 0.45, shadowRadius: 20, shadowOffset: { width: 0, height: 16 }, elevation: 12 },
  invitationAvatarTxt: { fontSize: 34, fontFamily: theme.fontFamily.extrabold, color: theme.colors.onBrand },
  invitationFrom: { fontSize: 13, color: theme.colors.gold, letterSpacing: 0.4 },
  invitationName: { fontSize: 26, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong, marginTop: 6, marginBottom: 4, textAlign: 'center' },
  invitationSub: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 22 },
  invitationActions: { paddingHorizontal: 22, paddingBottom: 34, gap: 12 },
  acceptWrap: { borderRadius: 18, overflow: 'hidden', shadowColor: theme.colors.brandCoral, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  acceptBtn: { height: 56, alignItems: 'center', justifyContent: 'center' },
  acceptTxt: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: theme.colors.onBrand },
  rejectBtn: { height: 52, borderRadius: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  rejectTxt: { fontSize: 15, fontFamily: theme.fontFamily.semibold, color: theme.colors.textMuted },
}));
