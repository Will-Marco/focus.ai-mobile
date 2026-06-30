// Public API — entities/stats (streak + statistika + gamifikatsiya).
export { useStatsSummary, useCurrentStreak } from './model/useStats';
export type { StatsSummary } from './model/useStats';
export { useStatsStore } from './model/statsStore';
export { buildSeries, type ChartPeriod, type ChartSeries, type HeatmapData } from './model/aggregate';
export { levelFromXp, totalXp, sessionXp, type LevelInfo } from './model/xp';
export { streakStats, currentStreak, longestStreak, type StreakResult } from './model/streak';
export { BADGE_IDS, type BadgeId } from './model/badges';
export type { SessionStat } from './model/types';
