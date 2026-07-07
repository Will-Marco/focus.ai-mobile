// Supabase Edge Function — Telefon ro'yxatdan o'tishni boshlaydi (Telegram tasdiqlash oqimi 1/3).
// Xulq: telefonni tekshiradi, otp_codes'da "pending registration" yozuvi yaratadi (yoki
// mavjudini qayta ishlatadi) va Telegram bot deeplink'ini qaytaradi.
//
// Deploy:
//   supabase secrets set TELEGRAM_BOT_USERNAME=<bot_username, @siz>
//   supabase functions deploy register-init --no-verify-jwt
// (--no-verify-jwt SHART — foydalanuvchi hali login qilmagan, Supabase sessiyasi yo'q.)

// @ts-nocheck  (Deno runtime — RN tsconfig'da tekshirilmaydi)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { CORS, json } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { normalizePhone } from '../_shared/phone.ts';
import { generateToken } from '../_shared/token.ts';

const TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { phone: rawPhone } = (await req.json()) as { phone?: string };
    const phone = normalizePhone(rawPhone ?? '');
    if (!phone) return json({ error: 'invalid_phone' }); // 200 ataylab — [[register-complete]]dagi izohga qarang

    const now = new Date();

    // Muddati o'tgan pending yozuvlarni tozalash (shu telefon uchun).
    await supabaseAdmin.from('otp_codes').delete().eq('phone', phone).lt('expires_at', now.toISOString());

    const { data: existing } = await supabaseAdmin
      .from('otp_codes')
      .select('register_token, verified, created_at')
      .eq('phone', phone)
      .maybeSingle();

    const botUsername = Deno.env.get('TELEGRAM_BOT_USERNAME');

    if (existing) {
      const ageSeconds = (now.getTime() - new Date(existing.created_at).getTime()) / 1000;
      if (ageSeconds < RESEND_COOLDOWN_SECONDS) {
        // Hozirgina so'ralgan — bot'ga qayta spam qilmasdan bir xil tokenni qaytaramiz.
        return json({
          registerToken: existing.register_token,
          verified: existing.verified,
          botDeeplink: `https://t.me/${botUsername}?start=${existing.register_token}`,
        });
      }
      await supabaseAdmin.from('otp_codes').delete().eq('register_token', existing.register_token);
    }

    const registerToken = generateToken();
    const expiresAt = new Date(now.getTime() + TTL_MINUTES * 60_000);

    const { error } = await supabaseAdmin.from('otp_codes').insert({
      phone,
      register_token: registerToken,
      expires_at: expiresAt.toISOString(),
    });
    if (error) {
      console.error(`[register-init] insert xato: ${error.message}`);
      return json({ error: 'internal' }, 500);
    }

    return json({
      registerToken,
      verified: false,
      botDeeplink: `https://t.me/${botUsername}?start=${registerToken}`,
    });
  } catch (err) {
    console.error(`[register-init] Ichki xato: ${err}`);
    return json({ error: 'bad_request' }, 400);
  }
});
