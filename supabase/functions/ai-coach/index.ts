// Supabase Edge Function — AI murabbiy (Gemini)
// SRS FR-10.1: API kalit FAQAT server tomonda (GEMINI_API_KEY secret), mijozda yo'q.
// SRS FR-10.2: kirish — ANONIM sonli metrikalar (ism/odat nomi yo'q).
//
// Deploy:
//   supabase functions deploy ai-coach
//   supabase secrets set GEMINI_API_KEY=<kalit>   (Google AI Studio, bepul)
//
// verify_jwt (default ON) — faqat autentifikatsiyalangan chaqiruvlar o'tadi.

// @ts-nocheck  (Deno runtime — RN tsconfig'da tekshirilmaydi)
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Anonim metrikalar shakli (mijoz `features/ai-coach` bilan bir xil).
interface CoachMetrics {
  streakCurrent: number;
  streakLongest: number;
  level: number;
  totalXp: number;
  last7Active: boolean[];
  last30Minutes: number;
  last30Sessions: number;
  last30Completed: number;
  last30ActiveDays: number;
  avgSessionMinutes: number;
  bestHour: number | null;
  habitCount: number;
  awayMinutes: number;
}

function buildPrompt(m: CoachMetrics): string {
  const pattern = m.last7Active.map((a) => (a ? '●' : '○')).join('');
  const hour = m.bestHour === null ? "ma'lumot yetarli emas" : `${m.bestHour}:00 atrofida`;
  return [
    'Siz "Focus AI" ilovasining shaxsiy fokus-murabbiysisiz. Foydalanuvchining ANONIM statistikasi asosida',
    "iliq, hurmatli va AMALIY maslahat bering. Faqat o'zbek tilida (lotin), doimo HURMATLI \"siz\" shaklida murojaat qiling",
    '(masalan: "bugun siz...", "sizga tavsiya", "...saqlang", "...boshlang"). Hech qachon "sen" ishlatmang.',
    "Har bir matn qisqa, samimiy va tabiiy bo'lsin. Ism yoki odat nomlari yo'q — faqat raqamlarga tayaning.",
    '',
    'STATISTIKA (oxirgi 30 kun):',
    `- Joriy streak: ${m.streakCurrent} kun (rekord: ${m.streakLongest})`,
    `- Daraja: ${m.level}, jami XP: ${m.totalXp}`,
    `- Oxirgi 7 kun faollik: ${pattern} (● = fokuslangan)`,
    `- Jami fokus: ${m.last30Minutes} daqiqa, ${m.last30Sessions} sessiya`,
    `- Maqsadga yetgan sessiyalar: ${m.last30Completed}`,
    `- Faol kunlar: ${m.last30ActiveDays}, o'rtacha sessiya: ${m.avgSessionMinutes} daqiqa`,
    `- Eng samarali vaqt: ${hour}`,
    `- Kuzatilayotgan odatlar soni: ${m.habitCount}`,
    `- Telefonsiz (Away rejim) fokus: ${m.awayMinutes} daqiqa`,
    '',
    'VAZIFA — FAQAT quyidagi shakldagi to\'g\'ri JSON qaytaring (boshqa matn, izoh yoki ```-ramka YO\'Q):',
    '{',
    '  "daily": { "message": "1-2 gaplik ilhomlantiruvchi tavsiya (hurmatli siz)", "cta": "2-4 so\'zlik tugma matni" },',
    '  "weekly": [',
    '    { "kind": "time", "tag": "qisqa yorliq", "title": "raqamli asosiy xulosa", "body": "1 gaplik izoh" },',
    '    { "kind": "attention", "tag": "...", "title": "...", "body": "..." },',
    '    { "kind": "growth", "tag": "...", "title": "...", "body": "..." },',
    '    { "kind": "tip", "tag": "...", "title": "...", "body": "..." }',
    '  ]',
    '}',
    'ANIQ 4 ta weekly karta bo\'lsin. kind faqat shu 4 qiymatdan: "time" (eng samarali vaqt), "attention" (e\'tibor talab — pasaygan joy), "growth" (o\'sish), "tip" (amaliy maslahat).',
    'Barcha matnlar hurmatli "siz" shaklida. Agar statistika bo\'sh bo\'lsa (0 sessiya), yangi boshlovchini hurmat bilan ilhomlantiring va birinchi qadamni taklif qiling.',
  ].join('\n');
}

// Gemini ishlamasa — halol, statik zaxira. `mode: 'fallback'` — mijoz buni JONLI deb
// hisoblamasin va kunlik limitni SARFLAMASIN (jonlidan aniq farqlanadi).
function fallback(m: CoachMetrics): unknown {
  const fresh = m.last30Sessions === 0;
  return {
    mode: 'fallback',
    daily: fresh
      ? {
          message: "Keling, bugun birinchi qadamni qo'yamiz — 25 daqiqalik bitta fokus sessiyasi kifoya. Boshlagan sari osonlashadi.",
          cta: '25 daq sessiya',
        }
      : {
          message: `${m.streakCurrent} kunlik streak — zo'r sur'at! Bugun ham bitta sessiya bilan seriyangizni tirik saqlang.`,
          cta: 'Sessiya boshlash',
        },
    weekly: [
      { kind: 'time', tag: 'Vaqt', title: m.bestHour === null ? 'Ritmingizni toping' : `Eng samarali: ${m.bestHour}:00`, body: 'Muhim ishlarni eng tetik paytingizga rejalashtiring.' },
      { kind: 'growth', tag: "O'sish", title: `${m.last30Minutes} daqiqa fokus`, body: `Oxirgi 30 kunda ${m.last30ActiveDays} kun faol bo'ldingiz.` },
      { kind: 'attention', tag: "E'tibor", title: 'Muntazamlik kuch beradi', body: "Har kuni oz-ozdan — streak shunday o'sadi." },
      { kind: 'tip', tag: 'Maslahat', title: "Kichik maqsad qo'ying", body: 'Qisqaroq sessiyalar yakunlash ehtimolini oshiradi.' },
    ],
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

  try {
    const metrics = (await req.json()) as CoachMetrics;
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('[ai-coach] GEMINI_API_KEY topilmadi');
      return json(fallback(metrics));
    }

    const res = await fetch(GEMINI_URL(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(metrics) }] }],
        // responseSchema ISHLATILMAYDI — Gemini uni ba'zan rad etadi (400).
        // JSON shakli promptда tasvirlangan; responseMimeType JSON qaytishni kafolatlaydi.
        generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[ai-coach] Gemini xato ${res.status}: ${body.slice(0, 900)}`);
      return json(fallback(metrics));
    }

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error(`[ai-coach] Gemini bo'sh javob: ${JSON.stringify(data).slice(0, 500)}`);
      return json(fallback(metrics));
    }

    // Ehtiyot uchun ```json ... ``` ramkasini olib tashlaymiz.
    const clean = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let insight: { daily?: unknown; weekly?: unknown[] };
    try {
      insight = JSON.parse(clean);
    } catch (_e) {
      console.error(`[ai-coach] JSON parse xato: ${clean.slice(0, 500)}`);
      return json(fallback(metrics));
    }

    if (!insight?.daily || !Array.isArray(insight?.weekly) || insight.weekly.length === 0) {
      console.error(`[ai-coach] Kutilmagan struktura: ${clean.slice(0, 500)}`);
      return json(fallback(metrics));
    }
    insight.weekly = insight.weekly.slice(0, 4);
    (insight as { mode?: string }).mode = 'live'; // haqiqiy Gemini javobi — mijoz limitni shu holda sarflaydi
    return json(insight);
  } catch (err) {
    console.error(`[ai-coach] Ichki xato: ${err}`);
    return json({ error: 'bad_request' }, 400);
  }
});
