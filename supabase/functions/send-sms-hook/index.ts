// Supabase Auth Hook — "Send SMS" (HTTP).
//
// ⚠️ Bu funksiya HAQIQATDA SMS yubormaydi. Telefon tasdiqlash Telegram bot orqali amalga
// oshiriladi (M12: register-init/telegram-webhook/register-complete) — Supabase'ning o'z
// signInWithOtp/SMS oqimi UMUMAN chaqirilmaydi. Bu hook FAQAT Dashboard'da "Phone" provider'ni
// yoqish SMS-yetkazish usuli (Twilio yoki custom hook) talab qilgan taqdirda kerak bo'ladi —
// shuning uchun xavfsiz no-op (har doim muvaffaqiyatli javob, hech qachon haqiqiy chaqirilmaydi
// chunki signInWithOtp ishlatilmaydi).
//
// Deploy:
//   1. Dashboard → Authentication → Hooks → "Send SMS hook" → HTTP → yaratilgach beriladigan
//      secret'ni ko'chiring (shakli: v1,whsec_...)
//   2. supabase secrets set SEND_SMS_HOOK_SECRET=<shu secret>
//   3. supabase functions deploy send-sms-hook --no-verify-jwt
//   4. Dashboard'dagi hook URL maydoniga shu funksiya URL'ini qo'ying.

// @ts-nocheck  (Deno runtime — RN tsconfig'da tekshirilmaydi)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

const rawSecret = Deno.env.get('SEND_SMS_HOOK_SECRET') ?? '';
const hookSecret = rawSecret.replace('v1,whsec_', '');

serve(async (req: Request) => {
  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);
    const { user, sms } = wh.verify(payload, headers) as {
      user?: { phone?: string };
      sms?: { otp?: string };
    };

    // Kutilmagan holat — kuzatuv uchun log (Dashboard → Edge Functions → Logs).
    console.log(`[send-sms-hook] chaqirildi (kutilmagan, no-op): phone=${user?.phone ?? '?'}`);
    void sms;

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`[send-sms-hook] tekshiruv xato: ${err}`);
    return new Response(JSON.stringify({ error: { message: 'invalid webhook' } }), { status: 401 });
  }
});
