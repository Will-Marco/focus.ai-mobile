// Supabase Edge Function — Telegram tasdiqlash holatini so'raydi (oqim 2/3, polling).
// otp_codes jadvali RLS bilan to'liq yopiq (deny-all) — mijoz uni to'g'ridan-to'g'ri
// o'qiy olmaydi, shuning uchun ilova bu Edge Function orqali (register_token bilan)
// FAQAT verified/expired holatini so'raydi — boshqa hech qanday ma'lumot qaytarilmaydi.
//
// Deploy: supabase functions deploy register-status --no-verify-jwt

// @ts-nocheck  (Deno runtime — RN tsconfig'da tekshirilmaydi)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { CORS, json } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { registerToken } = (await req.json()) as { registerToken?: string };
    if (!registerToken) return json({ error: 'invalid_request' }, 400);

    const { data } = await supabaseAdmin
      .from('otp_codes')
      .select('verified, expires_at')
      .eq('register_token', registerToken)
      .maybeSingle();

    if (!data) return json({ verified: false, expired: true });

    const expired = new Date(data.expires_at).getTime() < Date.now();
    return json({ verified: !!data.verified && !expired, expired });
  } catch (err) {
    console.error(`[register-status] Ichki xato: ${err}`);
    return json({ error: 'bad_request' }, 400);
  }
});
