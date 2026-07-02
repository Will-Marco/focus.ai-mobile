import type { CoachInsight, CoachMetrics } from '../model/types';

// Lokal statik zaxira — Supabase sozlanmagan / mehmon / offline va kesh yo'q holatlar uchun.
// Ilova offline-first: AI bo'lmasa ham foydali kontent ko'rsatiladi (core buzilmaydi).
export function localFallback(m: CoachMetrics): CoachInsight {
  const fresh = m.last30Sessions === 0;
  return {
    mode: 'fallback',
    daily: fresh
      ? { message: "Keling, bugun birinchi qadamni qo'yamiz — 25 daqiqalik bitta fokus sessiyasi kifoya. Boshlagan sari osonlashadi.", cta: '25 daq sessiya' }
      : { message: `${m.streakCurrent} kunlik streak — zo'r sur'at! Bugun ham bitta sessiya bilan seriyangizni tirik saqlang.`, cta: 'Sessiya boshlash' },
    weekly: [
      { kind: 'time', tag: 'Vaqt', title: m.bestHour === null ? 'Ritmingizni toping' : `Eng samarali: ${m.bestHour}:00`, body: 'Muhim ishlarni eng tetik paytingizga rejalashtiring.' },
      { kind: 'growth', tag: "O'sish", title: `${m.last30Minutes} daqiqa fokus`, body: `Oxirgi 30 kunda ${m.last30ActiveDays} kun faol bo'ldingiz.` },
      { kind: 'attention', tag: "E'tibor", title: 'Muntazamlik kuch beradi', body: "Har kuni oz-ozdan — streak shunday o'sadi." },
      { kind: 'tip', tag: 'Maslahat', title: "Kichik maqsad qo'ying", body: 'Qisqaroq sessiyalar yakunlash ehtimolini oshiradi.' },
    ],
  };
}
