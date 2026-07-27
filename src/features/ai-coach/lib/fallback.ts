import i18n from '@shared/config/i18n';
import type { CoachInsight, CoachMetrics } from '../model/types';

// Lokal statik zaxira — Supabase sozlanmagan / mehmon / offline va kesh yo'q holatlar uchun.
// Ilova offline-first: AI bo'lmasa ham foydali kontent ko'rsatiladi (core buzilmaydi).
// Matnlar i18n'да (`aiCoach.fb.*`) — til almashganda bular ham tarjima bo'ladi.
export function localFallback(m: CoachMetrics): CoachInsight {
  const t = i18n.t.bind(i18n);
  const fresh = m.last30Sessions === 0;
  return {
    mode: 'fallback',
    daily: fresh
      ? { message: t('aiCoach.fb.firstMsg'), cta: t('aiCoach.fb.firstCta') }
      : { message: t('aiCoach.fb.streakMsg', { days: m.streakCurrent }), cta: t('aiCoach.fb.streakCta') },
    weekly: [
      {
        kind: 'time',
        tag: t('aiCoach.fb.tagTime'),
        title: m.bestHour === null ? t('aiCoach.fb.findRhythm') : t('aiCoach.fb.bestHour', { hour: m.bestHour }),
        body: t('aiCoach.fb.timeBody'),
      },
      {
        kind: 'growth',
        tag: t('aiCoach.fb.tagGrowth'),
        title: t('aiCoach.fb.growthTitle', { min: m.last30Minutes }),
        body: t('aiCoach.fb.growthBody', { days: m.last30ActiveDays }),
      },
      {
        kind: 'attention',
        tag: t('aiCoach.fb.tagAttention'),
        title: t('aiCoach.fb.consistTitle'),
        body: t('aiCoach.fb.consistBody'),
      },
      { kind: 'tip', tag: t('aiCoach.fb.tagTip'), title: t('aiCoach.fb.smallTitle'), body: t('aiCoach.fb.smallBody') },
    ],
  };
}
