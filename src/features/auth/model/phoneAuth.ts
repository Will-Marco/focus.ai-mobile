import { supabase } from '@shared/api/supabase';
import { isSupabaseConfigured } from '@shared/config/env';
import { useProfileStore } from '@entities/profile';
import type { AuthResult } from './auth';

const NOT_CONFIGURED: AuthResult = { ok: false, errorKey: 'auth.err.notConfigured' };
const DEFAULT_NAME = 'Foydalanuvchi';

/** Supabase Auth "Phone" provider Dashboard'da o'chirilgan bo'lsa — aniq, alohida xabar. */
function mapSignInError(error: { code?: string; message?: string }, fallbackKey: string): string {
  if (error.code === 'phone_provider_disabled') {
    if (__DEV__) console.warn('[PhoneAuth] Supabase Phone provider o\'chirilgan — Dashboard: Auth > Providers > Phone yoqilsin.');
    return 'auth.err.phone.providerDisabled';
  }
  return fallbackKey;
}

export interface RegisterInitResult {
  ok: boolean;
  registerToken?: string;
  botDeeplink?: string;
  errorKey?: string;
}

/** 1/3 — pending registratsiya yaratadi, Telegram bot deeplink qaytaradi. */
export async function registerInitPhone(phone: string): Promise<RegisterInitResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, errorKey: 'auth.err.notConfigured' };
  try {
    const { data, error } = await supabase.functions.invoke<{
      registerToken?: string;
      botDeeplink?: string;
      error?: string;
    }>('register-init', { body: { phone } });

    if (error || !data || data.error || !data.registerToken || !data.botDeeplink) {
      const key = data?.error === 'invalid_phone' ? 'auth.err.phone.invalid' : 'auth.err.phone.generic';
      return { ok: false, errorKey: key };
    }
    return { ok: true, registerToken: data.registerToken, botDeeplink: data.botDeeplink };
  } catch (e) {
    if (__DEV__) console.warn('[PhoneAuth] registerInit xato:', e);
    return { ok: false, errorKey: 'auth.err.phone.generic' };
  }
}

/** 2/3 — bot tasdiqlash holatini so'raydi (polling; Realtime emas — [[phone-auth-otp-security]]). */
export async function checkRegisterStatus(registerToken: string): Promise<{ verified: boolean; expired: boolean }> {
  if (!supabase) return { verified: false, expired: true };
  try {
    const { data } = await supabase.functions.invoke<{ verified: boolean; expired: boolean }>('register-status', {
      body: { registerToken },
    });
    return data ?? { verified: false, expired: false };
  } catch {
    return { verified: false, expired: false };
  }
}

/** 3/3 — Supabase foydalanuvchisini yaratadi (phone_confirm) va darhol kiritadi. */
export async function registerCompletePhone(
  registerToken: string,
  phone: string,
  password: string,
): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) return NOT_CONFIGURED;
  try {
    const { data, error } = await supabase.functions.invoke<{
      ok?: boolean;
      name?: string | null;
      error?: string;
    }>('register-complete', { body: { registerToken, password } });

    if (error || !data?.ok) {
      const key = data?.error === 'already_registered' ? 'auth.err.phone.alreadyRegistered' : 'auth.err.phone.generic';
      return { ok: false, errorKey: key };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ phone, password });
    if (signInError) {
      if (__DEV__) console.warn('[PhoneAuth] signIn xato:', signInError.code, signInError.message);
      return { ok: false, errorKey: mapSignInError(signInError, 'auth.err.phone.generic') };
    }

    useProfileStore.getState().registerLocal(data.name?.trim() || DEFAULT_NAME, null, phone);
    return { ok: true };
  } catch (e) {
    if (__DEV__) console.warn('[PhoneAuth] registerComplete xato:', e);
    return { ok: false, errorKey: 'auth.err.phone.generic' };
  }
}

export async function loginWithPhone(phone: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) return NOT_CONFIGURED;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ phone, password });
    if (error) {
      if (__DEV__) console.warn('[PhoneAuth] login xato:', error.code, error.message);
      return { ok: false, errorKey: mapSignInError(error, 'auth.err.phone.loginFailed') };
    }

    const meta = data.user?.user_metadata as
      | { telegram_first_name?: string; telegram_username?: string }
      | undefined;
    const name = meta?.telegram_first_name?.trim() || meta?.telegram_username?.trim() || DEFAULT_NAME;
    useProfileStore.getState().registerLocal(name, null, phone);
    return { ok: true };
  } catch (e) {
    if (__DEV__) console.warn('[PhoneAuth] login xato:', e);
    return { ok: false, errorKey: 'auth.err.phone.loginFailed' };
  }
}
