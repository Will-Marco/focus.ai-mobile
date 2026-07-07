// @ts-nocheck  (Deno runtime — RN tsconfig'da tekshirilmaydi)
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — Edge Function muhitida avtomatik mavjud
// (qo'lda secret sifatida sozlash shart emas). Service role — RLS'ni chetlab o'tadi,
// shuning uchun bu klient FAQAT server tomonda (Edge Function ichida) ishlatiladi.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);
