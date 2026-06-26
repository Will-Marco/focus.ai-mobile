import React, { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Text, Fab, HabitIcon } from '@shared/ui';
import { periodWindow } from '@shared/lib/time/periodWindow';
import { useHabitStore, type Habit } from '@entities/habit';
import { sessionRepo, useSessionStore } from '@entities/session';
import { HabitCard, ActiveSessionBanner } from '@widgets/dashboard';
import type { RootStackParamList } from '@shared/config/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const habits = useHabitStore((s) => s.habits);
  const active = useSessionStore((s) => s.active);

  const [focusTick, setFocusTick] = useState(0);
  const [todayMs, setTodayMs] = useState(0);
  const refreshKey = active.length + focusTick;

  // Ekran har focuslanganda + sessiya holati o'zgarganda qayta hisoblash.
  useFocusEffect(useCallback(() => setFocusTick((n) => n + 1), []));

  React.useEffect(() => {
    let on = true;
    const now = Date.now();
    const { from, to } = periodWindow('daily', now);
    sessionRepo.sumAllDurationMs(from, to).then((ms) => on && setTodayMs(ms));
    return () => {
      on = false;
    };
  }, [refreshKey]);

  const renderItem = useCallback(
    ({ item }: { item: Habit }) => (
      <HabitCard
        habit={item}
        refreshKey={refreshKey}
        onPress={() => navigation.navigate('AddHabit', { habitId: item.id })}
        onStart={() => navigation.navigate('ActiveSession', { habitId: item.id })}
      />
    ),
    [navigation, refreshKey],
  );

  const header = (
    <View style={styles.headerWrap}>
      <Text variant="title">{t('dashboard.greeting')} 👋</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text variant="caption">{t('dashboard.streak')}</Text>
          <Text style={styles.statValue}>— {t('dashboard.day')}</Text>
        </View>
        <View style={styles.stat}>
          <Text variant="caption">{t('dashboard.todayFocus')}</Text>
          <Text style={styles.statValue}>{Math.floor(todayMs / 60_000)} daq</Text>
        </View>
      </View>

      {active.map((s) => (
        <ActiveSessionBanner
          key={s.id}
          sessionId={s.id}
          onPress={() =>
            navigation.navigate('ActiveSession', { habitId: s.habitId, sessionId: s.id })
          }
        />
      ))}

      {habits.length > 0 ? <Text style={styles.sectionTitle}>{t('dashboard.habits')}</Text> : null}
    </View>
  );

  const empty = (
    <View style={styles.empty}>
      <HabitIcon name="target" size={48} color="#8a7263" />
      <Text variant="title" style={styles.emptyTitle}>
        {t('dashboard.empty')}
      </Text>
      <Text variant="caption" style={styles.emptyHint}>
        {t('dashboard.emptyHint')}
      </Text>
    </View>
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
  list: { padding: theme.spacing(5), gap: theme.spacing(3), paddingBottom: theme.spacing(20) },
  headerWrap: { gap: theme.spacing(3), marginBottom: theme.spacing(1) },
  stats: { flexDirection: 'row', gap: theme.spacing(3) },
  stat: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(3),
    gap: 4,
  },
  statValue: { fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg, color: theme.colors.textStrong },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.fontFamily.bold,
    letterSpacing: 1,
    marginTop: theme.spacing(2),
  },
  empty: { alignItems: 'center', gap: theme.spacing(3), paddingVertical: theme.spacing(12) },
  emptyTitle: { fontSize: theme.fontSize.lg },
  emptyHint: { textAlign: 'center', maxWidth: 260 },
  fab: { position: 'absolute', right: 20, bottom: 20 },
}));
