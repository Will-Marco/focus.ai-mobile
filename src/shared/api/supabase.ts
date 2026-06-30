import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { storage } from '@shared/lib/storage/mmkv';
import { env, isSupabaseConfigured } from '@shared/config/env';

// Supabase auth sessiyasini MMKV'da saqlash adapteri (AsyncStorage o'rniga — bizda MMKV bor).
const mmkvAuthStorage = {
  getItem: (key: string): string | null => storage.getString(key) ?? null,
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  removeItem: (key: string): void => {
    storage.remove(key);
  },
};

// Sozlanmagan bo'lsa null — chaqiruvchilar `isSupabaseConfigured` bilan tekshiradi.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: mmkvAuthStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/** Client mavjud bo'lsa qaytaradi, aks holda xato (online amallar uchun guard). */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new Error('Supabase sozlanmagan (.env: SUPABASE_URL/ANON_KEY)');
  return supabase;
}
