// Supabase Edge Function — Telegram bot webhook (oqim 2/3): /start<token> → raqam so'raydi →
// kontakt kelganda pending registratsiya bilan solishtirib tasdiqlaydi.
//
// Deploy:
//   supabase secrets set TELEGRAM_BOT_TOKEN=<@BotFather bergan token>
//   supabase secrets set TELEGRAM_WEBHOOK_SECRET=<o'zingiz o'ylab topgan tasodifiy satr>
//   supabase functions deploy telegram-webhook --no-verify-jwt
//   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<function_url>&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
//
// ⚠️ secret_token muhim: --no-verify-jwt ochiq endpoint qiladi (Telegram serveri Supabase
// sessiyasiga ega emas) — Telegram har so'rovda shu secretni header'da yuboradi, biz
// tekshiramiz, aks holda istalgan kishi to'g'ridan-to'g'ri funksiyani chaqira olardi.

// @ts-nocheck  (Deno runtime — RN tsconfig'da tekshirilmaydi)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { CORS } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { normalizePhone } from '../_shared/phone.ts';

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId: number | string, text: string, replyMarkup?: unknown) {
  await fetch(`${TG_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup,
    }),
  });
}

const CONTACT_KEYBOARD = {
  keyboard: [[{ text: '📲 Raqamni ulashish', request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};
const REMOVE_KEYBOARD = { remove_keyboard: true };

interface TgUpdate {
  message?: {
    text?: string;
    chat: { id: number };
    from?: { username?: string; first_name?: string };
    contact?: { phone_number: string; first_name?: string };
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // Telegram javobni kutmaydi — xato bo'lsa ham har doim 200 qaytaramiz (aks holda
  // Telegram webhook'ni qayta urinaveradi/muallaqlashtiradi).
  const ok = () => new Response('ok', { status: 200 });

  if (req.headers.get('x-telegram-bot-api-secret-token') !== WEBHOOK_SECRET) {
    console.error('[telegram-webhook] noto\'g\'ri secret token');
    return ok();
  }

  try {
    const update = (await req.json()) as TgUpdate;
    const message = update.message;
    if (!message) return ok();

    const chatId = message.chat.id;

    // /start <register_token>
    if (message.text?.startsWith('/start')) {
      const token = message.text.split(' ')[1]?.trim();
      if (!token) {
        await sendMessage(
          chatId,
          "👋 Bu bot Focus AI ro'yxatdan o'tishni tasdiqlash uchun ishlatiladi.\nIlovada ro'yxatdan o'tishni boshlab, u yerdagi havola orqali qaytadan kiring.",
        );
        return ok();
      }

      const { data: pending } = await supabaseAdmin
        .from('otp_codes')
        .select('expires_at, verified')
        .eq('register_token', token)
        .maybeSingle();

      if (!pending || pending.verified || new Date(pending.expires_at).getTime() < Date.now()) {
        await sendMessage(chatId, "❌ Havola eskirgan yoki noto'g'ri. Ilovada qaytadan urinib ko'ring.");
        return ok();
      }

      await supabaseAdmin.from('otp_codes').update({ telegram_chat_id: String(chatId) }).eq('register_token', token);
      await sendMessage(
        chatId,
        "📲 Raqamingizni tasdiqlash uchun pastdagi tugma orqali ulashing.",
        CONTACT_KEYBOARD,
      );
      return ok();
    }

    // Kontakt ulashildi
    if (message.contact?.phone_number) {
      const { data: pending } = await supabaseAdmin
        .from('otp_codes')
        .select('register_token, phone, expires_at')
        .eq('telegram_chat_id', String(chatId))
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!pending) {
        await sendMessage(chatId, "Iltimos, avval ilovada ro'yxatdan o'tishni boshlang.", REMOVE_KEYBOARD);
        return ok();
      }

      if (new Date(pending.expires_at).getTime() < Date.now()) {
        await supabaseAdmin.from('otp_codes').delete().eq('register_token', pending.register_token);
        await sendMessage(chatId, '⏳ Vaqt tugadi. Ilovada qaytadan urinib ko\'ring.', REMOVE_KEYBOARD);
        return ok();
      }

      const sharedPhone = normalizePhone(message.contact.phone_number);
      if (!sharedPhone || sharedPhone !== pending.phone) {
        await sendMessage(
          chatId,
          "❌ Bu raqam ilovada kiritilgan raqamga mos kelmayapti. Ilovada ko'rsatilgan raqamning Telegram hisobidan ulashing.",
          REMOVE_KEYBOARD,
        );
        return ok();
      }

      await supabaseAdmin
        .from('otp_codes')
        .update({
          verified: true,
          telegram_username: message.from?.username ?? null,
          telegram_first_name: message.contact.first_name ?? message.from?.first_name ?? null,
        })
        .eq('register_token', pending.register_token);

      await sendMessage(chatId, '✅ Tasdiqlandi! Ilovaga qayting — ro\'yxatdan o\'tish avtomatik yakunlanadi.', REMOVE_KEYBOARD);
      return ok();
    }

    return ok();
  } catch (err) {
    console.error(`[telegram-webhook] Ichki xato: ${err}`);
    return ok();
  }
});
