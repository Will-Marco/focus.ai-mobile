// Public API — features/ai-coach (AI murabbiy: Edge Function + kesh + offline fallback).
export { useCoachStore, type CoachSource } from './model/coachStore';
export { buildMetrics } from './lib/buildMetrics';
export { DAILY_LIMIT } from './lib/limit';
export type { CoachInsight, CoachMetrics, DailyInsight, WeeklyCard, WeeklyKind } from './model/types';
