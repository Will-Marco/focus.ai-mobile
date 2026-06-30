// Tinch soatlar — sof (pure) mantiq. Tungi (overnight) oraliqlarni qo'llab-quvvatlaydi.

/** "HH:MM" → yarim tundan boshlab daqiqalar (0..1439). Noto'g'ri format → 0. */
export function parseHm(hm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return 0;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return 0;
  return h * 60 + min;
}

/** Daqiqalar (0..1439) → "HH:MM". */
export function formatHm(minuteOfDay: number): string {
  const m = ((minuteOfDay % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/**
 * `minuteOfDay` tinch oraliq ichidami?
 * - start < end  → oddiy oraliq: [start, end)
 * - start > end  → tungi: [start, 24:00) ∪ [0, end)
 * - start == end → bo'sh oraliq (hech qachon)
 */
export function isInQuietRange(minuteOfDay: number, startMin: number, endMin: number): boolean {
  if (startMin === endMin) return false;
  if (startMin < endMin) return minuteOfDay >= startMin && minuteOfDay < endMin;
  return minuteOfDay >= startMin || minuteOfDay < endMin;
}
