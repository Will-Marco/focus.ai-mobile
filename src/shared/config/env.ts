import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@env';

// Maxfiy konfiguratsiya (.env → @env). Offline-first: bo'sh bo'lsa ilova baribir ishlaydi.
// URL sanitatsiya: trim + oxirgi `/` olib tashlanadi (aks holda `//auth/v1` → "Invalid path").
export const env = {
  supabaseUrl: (SUPABASE_URL ?? '').trim().replace(/\/+$/, ''),
  supabaseAnonKey: (SUPABASE_ANON_KEY ?? '').trim(),
};

/** Supabase sozlanganmi (URL + key mavjud). Bo'lmasa — sync/online o'chiq, core ishlaydi. */
export const isSupabaseConfigured = !!env.supabaseUrl && !!env.supabaseAnonKey;
