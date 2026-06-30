// Lokal kalendar-kun yordamchilari (streak/heatmap/grafiklar uchun).
// Pure. Hammasi LOKAL vaqt zonasida ishlaydi (DST'ga chidamli — Date orqali).

const DAY_MS = 86_400_000;

/** Berilgan timestampning lokal kun boshini (00:00) qaytaradi. */
export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Kun boshidan `n` kun siljitadi (manfiy = orqaga). Natija — kun boshi. */
export function addDays(ts: number, n: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.getTime();
}

/** Ikki sana orasidagi kalendar-kunlar farqi (b - a), DST'ga yaxlitlangan. */
export function diffDays(a: number, b: number): number {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS);
}

/** Faol kunlar to'plami: har sessiya boshlangan kun (kun boshi ts). */
export function activeDaySet(timestamps: number[]): Set<number> {
  const set = new Set<number>();
  for (const ts of timestamps) set.add(startOfDay(ts));
  return set;
}
