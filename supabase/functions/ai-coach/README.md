# ai-coach — Edge Function (AI murabbiy)

Anonim fokus metrikalari → Google Gemini → kunlik motivatsiya + haftalik tahlil (JSON).
API kalit **faqat server tomonda** (Supabase secret) — mijozda yo'q (SRS FR-10.1).

## Deploy (Sir bir marta bajaradi)

1. **Gemini kalit** (bepul): https://aistudio.google.com/apikey → kalit yarating.
2. **Secret** o'rnating:
   ```bash
   supabase secrets set GEMINI_API_KEY=<kalit>
   ```
3. **Deploy**:
   ```bash
   supabase functions deploy ai-coach
   ```
   `verify_jwt` default yoqilgan — faqat kirgan foydalanuvchilar chaqira oladi.

## Xatti-harakat
- Kalit yo'q / Gemini xato / bo'sh javob → **statik zaxira** JSON qaytaradi (mijoz baribir kontent ko'radi).
- Mijoz tomonда: kesh (MMKV) + offline fallback + kunlik limit (5/kun) — `src/features/ai-coach`.
- Kirish: anonim sonli metrikalar (ism/odat nomi YO'Q) — `CoachMetrics`.
