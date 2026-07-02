import { supabase } from '@shared/api/supabase';
import type { CoachInsight, CoachMetrics } from '../model/types';

export type CoachFetch =
  | { ok: true; insight: CoachInsight }
  | { ok: false; reason: 'notConfigured' | 'notAuthed' | 'error' };

// Edge Function'ni anonim metrikalar bilan chaqiradi. Kalit server tomonda —
// mijoz faqat sonli metrikalarni yuboradi (SRS FR-10.1/10.2).
export async function fetchCoachInsight(metrics: CoachMetrics): Promise<CoachFetch> {
  if (!supabase) return { ok: false, reason: 'notConfigured' };

  // verify_jwt yoqilgan — sessiyasiz (mehmon) chaqiruv 401 bo'ladi, oldindan to'sib qo'yamiz.
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return { ok: false, reason: 'notAuthed' };

  try {
    const { data, error } = await supabase.functions.invoke<CoachInsight>('ai-coach', { body: metrics });
    if (error || !data?.daily || !Array.isArray(data?.weekly) || data.weekly.length === 0) {
      return { ok: false, reason: 'error' };
    }
    return { ok: true, insight: data };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
