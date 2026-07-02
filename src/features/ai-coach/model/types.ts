// AI murabbiy — anonim metrikalar va insight shakllari.
// ⚠️ Metrikalar ANONIM: ism, odat nomi yoki har qanday shaxsiy matn YUBORILMAYDI —
// faqat sonli statistika (SRS FR-10.2).

/** Edge Function'ga yuboriladigan anonim metrikalar. */
export interface CoachMetrics {
  /** Joriy ketma-ket streak (kun). */
  streakCurrent: number;
  /** Eng uzun streak rekordi. */
  streakLongest: number;
  /** Joriy daraja. */
  level: number;
  /** Jami XP. */
  totalXp: number;
  /** Oxirgi 7 kun faollik naqshi (bugun oxirgi). */
  last7Active: boolean[];
  /** Oxirgi 30 kun: jami fokus daqiqasi. */
  last30Minutes: number;
  /** Oxirgi 30 kun: sessiyalar soni. */
  last30Sessions: number;
  /** Oxirgi 30 kun: maqsadga yetgan (100%) sessiyalar soni. */
  last30Completed: number;
  /** Oxirgi 30 kun: faol kunlar soni. */
  last30ActiveDays: number;
  /** O'rtacha sessiya davomiyligi (daqiqa, oxirgi 30 kun). */
  avgSessionMinutes: number;
  /** Eng samarali soat (0–23) yoki null (ma'lumot yetarli emas). */
  bestHour: number | null;
  /** Kuzatilayotgan alohida odatlar soni (nomlarsiz). */
  habitCount: number;
  /** Oxirgi 30 kun telefonsiz (Away/Focus Mode) daqiqalari — signature feature ishlatilishi. */
  awayMinutes: number;
}

/** Kunlik motivatsiya bloki. */
export interface DailyInsight {
  message: string;
  cta: string;
}

/** Haftalik tahlil kartasi turi (UI ikonka/rangga xaritalanadi). */
export type WeeklyKind = 'time' | 'attention' | 'growth' | 'tip';

export interface WeeklyCard {
  kind: WeeklyKind;
  tag: string;
  title: string;
  body: string;
}

/** Edge Function qaytaradigan to'liq insight. */
export interface CoachInsight {
  daily: DailyInsight;
  weekly: WeeklyCard[];
  /** 'live' = haqiqiy Gemini javobi; 'fallback' = server statik zaxira (limit sarflanmaydi). */
  mode?: 'live' | 'fallback';
}
