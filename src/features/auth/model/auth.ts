import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '@shared/api/supabase';
import { env, isGoogleConfigured, isSupabaseConfigured } from '@shared/config/env';
import { useProfileStore } from '@entities/profile';

export interface AuthResult {
  ok: boolean;
  /** i18n kaliti (auth.err.*) — UI tarjima qiladi. */
  errorKey?: string;
}

const NOT_CONFIGURED: AuthResult = { ok: false, errorKey: 'auth.err.notConfigured' };

/** Email'dan ko'rinadigan ism (local qism), masalan "ali" → "Ali". */
function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'Foydalanuvchi';
}

/** Auth muvaffaqiyatidan keyin local profilni registered qilib yangilash. */
function applyRegistered(name: string, email: string): void {
  useProfileStore.getState().registerLocal(name, email);
}

/** Google Sign In konfiguratsiyasi (ilova startida bir marta). */
export function configureGoogle(): void {
  if (!isGoogleConfigured) return;
  try {
    GoogleSignin.configure({ webClientId: env.googleWebClientId });
  } catch {
    // ignore
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) return NOT_CONFIGURED;
  const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
  if (error) return { ok: false, errorKey: 'auth.err.signup' };
  applyRegistered(nameFromEmail(email), email.trim());
  // Email tasdiqlash yoqilgan bo'lsa sessiya hali bo'lmaydi — lekin local profil yaratiladi.
  return { ok: true, errorKey: data.session ? undefined : 'auth.err.confirmEmail' };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) return NOT_CONFIGURED;
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { ok: false, errorKey: 'auth.err.signin' };
  applyRegistered(nameFromEmail(email), email.trim());
  return { ok: true };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) return NOT_CONFIGURED;
  if (!isGoogleConfigured) return { ok: false, errorKey: 'auth.err.googleNotConfigured' };
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const res = await GoogleSignin.signIn();
    // google-signin shakli versiyaga qarab: { data: { idToken, user } } yoki { idToken, user }.
    const flat = res as {
      idToken?: string | null;
      user?: { email?: string; name?: string };
      data?: { idToken?: string | null; user?: { email?: string; name?: string } };
    };
    const data = flat.data ?? flat;
    const idToken = data?.idToken;
    if (!idToken) return { ok: false, errorKey: 'auth.err.google' };

    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) {
      if (__DEV__) console.warn('[GoogleAuth] Supabase rad etdi:', error.message);
      return { ok: false, errorKey: 'auth.err.google' };
    }

    const email = data?.user?.email ?? '';
    applyRegistered(data?.user?.name?.trim() || nameFromEmail(email), email);
    return { ok: true };
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (__DEV__) console.warn('[GoogleAuth] xato code =', err.code, '· message =', err.message);
    // Foydalanuvchi o'zi bekor qilgan bo'lsa — jim (xato ko'rsatmaymiz).
    if (err.code === statusCodes.SIGN_IN_CANCELLED) return { ok: false };
    return { ok: false, errorKey: 'auth.err.google' };
  }
}

/** Chiqish — remote sessiya + Google (xavfsiz). Local profilni chaqiruvchi tozalaydi. */
export async function signOutRemote(): Promise<void> {
  try {
    if (supabase) await supabase.auth.signOut();
  } catch {
    // ignore
  }
  try {
    await GoogleSignin.signOut();
  } catch {
    // ignore
  }
}
