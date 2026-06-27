// Sarflangan vaqt (dizayn formati): <1soat → "37 daqiqa", >=1soat → "24s 12d" / "3s".
export function formatSpent(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  if (totalMin < 60) return `${totalMin} daqiqa`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}s ${m}d` : `${h}s`;
}
