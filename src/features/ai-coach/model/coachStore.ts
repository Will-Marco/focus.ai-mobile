import { create } from 'zustand';
import { fetchCoachInsight } from '../api/coach';
import { localFallback } from '../lib/fallback';
import { canFetch, recordFetch, remaining as remainingOf, todayKey } from '../lib/limit';
import { coachCache } from './coachCache';
import type { CoachInsight, CoachMetrics } from './types';

/** Joriy insight manbai: jonli AI, kesh yoki lokal zaxira. */
export type CoachSource = 'live' | 'cache' | 'fallback';
export type CoachStatus = 'idle' | 'loading' | 'ready';

interface CoachState {
  insight: CoachInsight | null;
  source: CoachSource | null;
  /** Joriy insight olingan vaqt (kesh yorlig'i uchun). */
  cachedAt: number | null;
  status: CoachStatus;
  /** AI'ga yetib bo'lmadi — kesh/zaxira ko'rsatilmoqda. */
  offline: boolean;
  /** Kunlik limitga yetildi. */
  limitReached: boolean;
  /** Bugun qolgan so'rovlar. */
  remaining: number;

  /** Ekran ochilganда: keshni tiklaydi, bugungi insight yo'q bo'lsa bir marta oladi. */
  ensureToday: (metrics: CoachMetrics) => Promise<void>;
  /** Qo'lda yangilash (limit hisobiga) — refresh tugmasi. */
  refresh: (metrics: CoachMetrics) => Promise<void>;
}

export const useCoachStore = create<CoachState>((set) => {
  // Ichki: Edge Function'ni chaqiradi, keshlab limitni oshiradi; xato bo'lsa keshga tushadi.
  const doFetch = async (metrics: CoachMetrics): Promise<void> => {
    const now = Date.now();
    const usage = coachCache.getUsage();

    if (!canFetch(usage, now)) {
      set({ limitReached: true, remaining: 0 });
      return;
    }

    set({ status: 'loading' });
    const res = await fetchCoachInsight(metrics);

    // Faqat HAQIQIY jonli AI javobi keshlanadi va limitni sarflaydi.
    // Server zaxirasi (mode='fallback', kalit yo'q/Gemini xato) jonli hisoblanmaydi.
    if (res.ok && res.insight.mode !== 'fallback') {
      coachCache.setInsight(res.insight, now);
      const nextUsage = recordFetch(usage, now);
      coachCache.setUsage(nextUsage);
      set({
        insight: res.insight,
        source: 'live',
        cachedAt: now,
        status: 'ready',
        offline: false,
        limitReached: false,
        remaining: remainingOf(nextUsage, now),
      });
      return;
    }

    // Xato / sozlanmagan / mehmon / server-zaxira — limit SARFLANMAYDI.
    // Eng yaxshi mavjud kontentni ko'rsatamiz (oldingi jonli kesh > server zaxira > lokal zaxira).
    const cached = coachCache.getInsight();
    const serverFallback = res.ok ? res.insight : null;
    set({
      insight: cached?.insight ?? serverFallback ?? localFallback(metrics),
      source: cached ? 'cache' : 'fallback',
      cachedAt: cached?.at ?? null,
      status: 'ready',
      offline: true,
    });
  };

  return {
    insight: null,
    source: null,
    cachedAt: null,
    status: 'idle',
    offline: false,
    limitReached: false,
    remaining: 0,

    ensureToday: async (metrics) => {
      const now = Date.now();
      const usage = coachCache.getUsage();
      const cached = coachCache.getInsight();

      // Keshni darhol ko'rsatamiz (bir narsa chiqsin), limit holatini tiklaymiz.
      if (cached) {
        set({ insight: cached.insight, source: 'cache', cachedAt: cached.at, status: 'ready' });
      }
      set({ remaining: remainingOf(usage, now), limitReached: !canFetch(usage, now) });

      // Bugungi insight allaqachon bor — qayta chaqirmaymiz (limitni tejaymiz).
      if (cached && todayKey(cached.at) === todayKey(now)) {
        set({ offline: false });
        return;
      }
      await doFetch(metrics);
    },

    refresh: async (metrics) => {
      await doFetch(metrics);
    },
  };
});
