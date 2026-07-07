import { supabase } from '@shared/api/supabase';

export interface AuthResult {
  ok: boolean;
  /** i18n kaliti (auth.err.*) — UI tarjima qiladi. */
  errorKey?: string;
}

/** Chiqish — remote sessiya. Local profilni chaqiruvchi tozalaydi. */
export async function signOutRemote(): Promise<void> {
  try {
    if (supabase) await supabase.auth.signOut();
  } catch {
    // ignore
  }
}
