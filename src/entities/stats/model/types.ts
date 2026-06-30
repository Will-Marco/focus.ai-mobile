// Statistika/gamifikatsiya pure logikasi uchun minimal sessiya shakli.
// (entities/session'ga bog'lanmaslik uchun — hook chegarada CompletedSession'dan map qiladi.)
export interface SessionStat {
  habitId: string;
  durationMs: number;
  targetMinutes: number;
  completed: boolean;
  /** telefonsiz (Away) davomiyligi ms — XP 2× bonus manbai. */
  awayMs: number;
  /** sessiya boshlangan timestamp (kun/soat bucketing uchun). */
  startedAt: number;
}
