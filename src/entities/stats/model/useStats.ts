import { useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { activeDaySet } from '@shared/lib/time/day';
import { buildHeatmap, last7Done, type HeatmapData } from './aggregate';
import { buildBadgeContext, evaluateBadges, type BadgeId } from './badges';
import { useStatsStore } from './statsStore';
import { streakStats, type StreakResult } from './streak';
import type { SessionStat } from './types';
import { levelFromXp, totalXp, type LevelInfo } from './xp';

export interface StatsSummary {
  loaded: boolean;
  now: number;
  sessions: SessionStat[];
  streak: StreakResult;
  totalXp: number;
  level: LevelInfo;
  last7: boolean[];
  heatmap: HeatmapData;
  badges: Record<BadgeId, boolean>;
}

// Ekran focus'ida sessiyalarni yuklaydi va to'liq statistika xulosasini hisoblaydi.
export function useStatsSummary(): StatsSummary {
  const sessions = useStatsStore((s) => s.sessions);
  const loadedAt = useStatsStore((s) => s.loadedAt);
  const loaded = useStatsStore((s) => s.loaded);
  const load = useStatsStore((s) => s.load);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return useMemo(() => {
    const now = loadedAt || Date.now();
    const active = activeDaySet(sessions.map((s) => s.startedAt));
    const streak = streakStats(active, now);
    const xp = totalXp(sessions);
    return {
      loaded,
      now,
      sessions,
      streak,
      totalXp: xp,
      level: levelFromXp(xp),
      last7: last7Done(active, now),
      heatmap: buildHeatmap(sessions, now),
      badges: evaluateBadges(buildBadgeContext(sessions, streak)),
    };
  }, [sessions, loadedAt, loaded]);
}

// Dashboard uchun yengil selektor — faqat joriy streak.
export function useCurrentStreak(): number {
  const sessions = useStatsStore((s) => s.sessions);
  const loadedAt = useStatsStore((s) => s.loadedAt);
  const load = useStatsStore((s) => s.load);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return useMemo(
    () => streakStats(activeDaySet(sessions.map((s) => s.startedAt)), loadedAt || Date.now()).current,
    [sessions, loadedAt],
  );
}
