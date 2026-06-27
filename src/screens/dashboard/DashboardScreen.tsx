import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AiOrb, Avatar, Screen, Text, Fab, HabitIcon } from '@shared/ui';
import { periodWindow } from '@shared/lib/time/periodWindow';
import { formatSpent } from '@shared/lib/time/formatSpent';
import { useHabitStore, type Habit } from '@entities/habit';
import { sessionRepo, useSessionStore } from '@entities/session';
import { useProfileStore } from '@entities/profile';
import { HabitCard, ActiveSessionBanner, StatChip } from '@widgets/dashboard';
import type { RootStackParamList } from '@shared/config/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const navigation = useNavigation<Nav>();
  const habits = useHabitStore((s) => s.habits);
  const active = useSessionStore((s) => s.active);
  const profileName = useProfileStore((s) => s.profile?.name ?? '');

  const [focusTick, setFocusTick] = useState(0);
  const [todayMs, setTodayMs] = useState(0);
  const refreshKey = active.length + focusTick;

  useFocusEffect(useCallback(() => setFocusTick((n) => n + 1), []));

  React.useEffect(() => {
    let on = true;
    const { from, to } = periodWindow('daily', Date.now());
    sessionRepo.sumAllDurationMs(from, to).then((ms) => on && setTodayMs(ms));
    return () => {
      on = false;
    };
  }, [refreshKey]);

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? 'greetingMorning' : hour < 18 ? 'greetingDay' : hour < 22 ? 'greetingEvening' : 'greetingNight';

  const renderItem = useCallback(
    ({ item, index }: { item: Habit; index: number }) => (
      <Animated.View entering={FadeInDown.delay(60 * index).duration(320)}>
        <HabitCard
          habit={item}
          refreshKey={refreshKey}
          onPress={() => navigation.navigate('AddHabit', { habitId: item.id })}
          onStart={() => {
            // shu odatning faol sessiyasi bo'lsa — yangi yaratmasdan unga davom
            const existing = active.find((s) => s.habitId === item.id);
            navigation.navigate(
              'ActiveSession',
              existing ? { habitId: item.id, sessionId: existing.id } : { habitId: item.id },
            );
          }}
        />
      </Animated.View>
    ),
    [navigation, refreshKey, active],
  );

  const header = (
    <Animated.View entering={FadeInDown.duration(350)}>
      <View style={styles.headerWrap}>
      <View style={styles.greetRow}>
        <View style={styles.greetText}>
          <Text style={styles.greeting}>{t(`dashboard.${greetingKey}`)}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {profileName}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('aiCoach.title')}
            onPress={() => navigation.navigate('AICoach')}
          >
            <AiOrb size={42} />
          </Pressable>
          <Avatar name={profileName || '?'} size={42} />
        </View>
      </View>

      <View style={styles.stats}>
        <StatChip value="—" unit={t('dashboard.day')} dotColor={theme.colors.brandCoral} label={t('dashboard.streak')} />
        <StatChip value={formatSpent(todayMs)} dotColor={theme.colors.brand} label={t('dashboard.todayFocus')} />
      </View>

      {active.map((s) => (
        <ActiveSessionBanner
          key={s.id}
          sessionId={s.id}
          onPress={() => navigation.navigate('ActiveSession', { habitId: s.habitId, sessionId: s.id })}
        />
      ))}

      {habits.length > 0 ? (
        <View style={styles.habitsHead}>
          <Text style={styles.habitsTitle}>{t('dashboard.habits')}</Text>
          <Text style={styles.habitsCount}>
            {habits.length} {t('dashboard.count')}
          </Text>
        </View>
      ) : null}
      </View>
    </Animated.View>
  );

  const empty = (
    <Animated.View entering={FadeInDown.duration(350)}>
      <View style={styles.empty}>
        <HabitIcon name="target" size={48} color={theme.colors.textMuted} />
        <Text variant="title" style={styles.emptyTitle}>
          {t('dashboard.empty')}
        </Text>
        <Text variant="caption" style={styles.emptyHint}>
          {t('dashboard.emptyHint')}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <Screen>
      <FlatList
        data={habits}
        keyExtractor={(h) => h.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.fab}>
        <Fab onPress={() => navigation.navigate('AddHabit')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110, gap: 11 },
  headerWrap: { gap: 11, marginBottom: 0 },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  greetText: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { fontSize: 13, color: theme.colors.textMuted },
  name: { fontFamily: theme.fontFamily.extrabold, fontSize: 27, color: theme.colors.textStrong, lineHeight: 30 },
  stats: { flexDirection: 'row', gap: 10 },
  habitsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  habitsTitle: { fontSize: 13, letterSpacing: 0.6, color: theme.colors.textMuted, fontFamily: theme.fontFamily.bold },
  habitsCount: { fontSize: 12, color: theme.colors.textDim },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 48 },
  emptyTitle: { fontSize: 18 },
  emptyHint: { textAlign: 'center', maxWidth: 260 },
  fab: { position: 'absolute', right: 20, bottom: 24 },
}));
