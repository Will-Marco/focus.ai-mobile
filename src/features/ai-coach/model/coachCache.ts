import { storage } from '@shared/lib/storage/mmkv';
import { getLanguage } from '@shared/config/i18n';
import type { UsageRecord } from '../lib/limit';
import type { CoachInsight } from './types';

// MMKV kalitlari — AI insight keshi + kunlik limit yozuvi (offline fallback manbai).
// Insight keshi TIL bo'yicha ajratilgan: til almashtirilganда o'zbekcha javob
// ruscha interfeysда (yoki aksincha) chiqib qolmasin.
const insightKey = (): string => `ai-coach:insight:${getLanguage()}`;
// v2 — eski (nosoz: server-zaxira ham limitni yeydigan) hisobni bekor qiladi.
const USAGE_KEY = 'ai-coach:usage2';

/** Keshlangan insight + olingan vaqti (offline'da shu ko'rsatiladi). */
export interface CachedInsight {
  insight: CoachInsight;
  at: number;
}

export const coachCache = {
  getInsight(): CachedInsight | null {
    const raw = storage.getString(insightKey());
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CachedInsight;
    } catch {
      return null;
    }
  },
  setInsight(insight: CoachInsight, at: number): void {
    storage.set(insightKey(), JSON.stringify({ insight, at }));
  },

  getUsage(): UsageRecord | null {
    const raw = storage.getString(USAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsageRecord;
    } catch {
      return null;
    }
  },
  setUsage(record: UsageRecord): void {
    storage.set(USAGE_KEY, JSON.stringify(record));
  },
};
