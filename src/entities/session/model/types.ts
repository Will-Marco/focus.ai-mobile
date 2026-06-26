// Qaynoq, davom etayotgan sessiya (MMKV'da, timestamp asosida — yopilsa ham aniq).
// Real-time o'tgan vaqt = accumulatedMs + (runningSince ? now - runningSince : 0).
export interface ActiveSession {
  id: string;
  habitId: string;
  /** shu sessiya maqsadi (daqiqa) — ring shuni to'ldiradi. */
  targetMin: number;
  /** pauzalarda to'plangan vaqt (ms). */
  accumulatedMs: number;
  /** running bo'lsa boshlangan timestamp; pauza bo'lsa null. */
  runningSince: number | null;
  /** immersiv Focus Modes faqat shu sessiyaga bog'lanadi (M4). */
  isForeground: boolean;
  /** boshlangan timestamp — davr oynasini (qaysi kun) belgilaydi. */
  startedAt: number;
}

// Yakunlangan sessiya (SQLite — doimiy tarix, statistika/streak manbai).
export interface CompletedSession {
  id: string;
  habitId: string;
  durationMs: number;
  targetMinutes: number;
  /** 100% maqsadga yetdimi (yutuq). */
  completed: boolean;
  startedAt: number;
  endedAt: number;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

// SQLite qator shakli.
export interface SessionRow {
  id: string;
  habit_id: string;
  duration_ms: number;
  target_minutes: number;
  completed: number;
  started_at: number;
  ended_at: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}
