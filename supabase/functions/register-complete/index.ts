// Supabase Edge Function — Telegram tasdiqlangandan keyin haqiqiy foydalanuvchini yaratadi (oqim 3/3).
// Parol FAQAT shu chaqiruvda, to'g'ridan-to'g'ri Supabase'ning o'z auth.users'iga yoziladi
// (bcrypt — Supabase/GoTrue tomonidan) — otp_codes jadvalida parol UMUMAN saqlanmaydi.
//
// Deploy: supabase functions deploy register-complete --no-verify-jwt

// @ts-nocheck  (Deno runtime — RN tsconfig'da tekshirilmaydi)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { CORS, json } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { registerToken, password } = (await req.json()) as {
      registerToken?: string;
      password?: string;
    };

    if (!registerToken || !password || password.length < 6) {
      return json({ error: 'invalid_request' }, 400);
    }

    const { data: pending } = await supabaseAdmin
      .from('otp_codes')
      .select('phone, verified, expires_at, telegram_chat_id, telegram_username, telegram_first_name')
      .eq('register_token', registerToken)
      .maybeSingle();

    // ⚠️ Biznes-xatolar (not_found/expired/not_verified/already_registered) ATAYLAB 200 bilan
    // qaytariladi (faqat body'da `error`) — `supabase-js functions.invoke` non-2xx status'da
    // `data`ni ba'zi versiyalarda parse qilmaydi; mijoz doim `data.error`ga ishonchli tayanishi
    // uchun shunday. Faqat kutilmagan holatlar (400/500) haqiqiy http xato kodi bilan.
    if (!pending) return json({ error: 'not_found' });
    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await supabaseAdmin.from('otp_codes').delete().eq('register_token', registerToken);
      return json({ error: 'expired' });
    }
    if (!pending.verified) return json({ error: 'not_verified' });

    const { error } = await supabaseAdmin.auth.admin.createUser({
      phone: pending.phone,
      password,
      phone_confirm: true,
      user_metadata: {
        telegram_chat_id: pending.telegram_chat_id,
        telegram_username: pending.telegram_username,
        telegram_first_name: pending.telegram_first_name,
      },
    });

    if (error) {
      const alreadyExists = /already|exists|registered/i.test(error.message ?? '');
      console.error(`[register-complete] createUser xato: ${error.message}`);
      return json({ error: alreadyExists ? 'already_registered' : 'internal' });
    }

    await supabaseAdmin.from('otp_codes').delete().eq('register_token', registerToken);

    return json({
      ok: true,
      phone: pending.phone,
      name: pending.telegram_first_name ?? pending.telegram_username ?? null,
    });
  } catch (err) {
    console.error(`[register-complete] Ichki xato: ${err}`);
    return json({ error: 'bad_request' }, 400);
  }
});
