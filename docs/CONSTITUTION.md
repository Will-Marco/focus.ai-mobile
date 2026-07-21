# CONSTITUTION — Focus AI (Mobil)

> O'zgarmas tamoyillar. Har o'zgarish shularga bo'ysunadi.
> O'zgartirish faqat loyiha egasining ruxsati bilan.

## Muhandislik tamoyillari
1. Doim eng **optimal, professional va clean** yo'l.
2. **Halollik:** taxmin yo'q; tekshirilmagan narsa "tayyor" emas.
3. **TDD** — biznes mantiq (taymer, streak, XP, sync) test-first (red → green → refactor).
4. **Module-by-module** — har modul alohida qabul qilinadi (acceptance gate).
5. Qaytarib bo'lmas operatsiya (deploy/migrate/delete/secret) — faqat aniq ruxsat bilan.
6. Avtonomiya: kod yozishda erkin, arxitektura/muhim qaror oldidan so'rash.

## Konkurs tamoyillari (bu loyihaga xos — qat'iy)
1. **Kreativlik birinchi o'rinda** (30 ball). Har qaror "bu bizni farqlaydimi?" deb so'raydi.
2. **Web versiyaning nusxasi EMAS.** O'ziga xos vizual identitet va g'oya. Web screenshotlar faqat referens.
3. **Sudya darhol sinashi shart:** APK ochiladi → mehmon rejimida internet/login'siz to'la ishlaydi.
4. **Interaktivlik his qilinadigan bo'lsin** (25 ball): animatsiya, haptic, sound, mikro-interaksiya — bezak emas, tajriba.
5. **Taymer muqaddas:** har doim timestamp asosida (`accumulatedMs + (now − runningSince)`), hech qachon setInterval sanog'i. Manfiy/oshib ketish bo'lmaydi.
6. **Offline-first:** local DB = yagona haqiqat manbai; cloud — sync qatlami.

## Tech stack (qat'iy)
- React Native CLI (bare, **Expo'siz**) 0.86+, TypeScript **strict**, **New Architecture ON**.
- React Navigation · Zustand + TanStack Query · **Unistyles 3** (styling/theme).
- Local: MMKV v3 + op-sqlite v17. Grafika: react-native-skia + **Reanimated 4**. Ring: `useClock`+`useDerivedValue` (UI thread).
- Backend: Supabase (Auth/Postgres+RLS/Realtime/Edge Functions). AI: bepul tier (Gemini) Edge Function orqali.
- Sensor: react-native-nitro-sensors · Haptic: react-native-nitro-haptics · Audio: **react-native-audio-api** (Web Audio uslubi — M5 da track-player o'rniga tanlandi: loop/fade/gain ustidan to'liq nazorat) · Notif: Notifee · i18n: react-i18next.
- Paket qo'shish — arxitektura qarori; yangisidan oldin asoslash shart.

## Arxitektura (qat'iy) — FSD v2 (RN'ga moslangan)
- Qatlamlar: `app · screens · widgets · features · entities · shared`. Import faqat **pastga**; cross-slice faqat `index.ts` public API orqali. `eslint-plugin-boundaries` majburlaydi.
- Slice ichida segmentlar: `ui/` (komponentlar) · `model/` (store, pure mantiq) · `api/` · `lib/` · `config/`.

## Kod uslubi / konvensiyalar
- Biznes mantiq (timer/streak/XP) — **pure funksiyalar**, slice `model/lib`'da, UI'dan ajratilgan, to'liq test qilinadigan.
- Til: muloqot o'zbekcha; kod/identifikator/comment inglizcha; UI matn i18n key orqali (uz-Latn).
- Styling: **Unistyles 3** (typed theme, dark mode, variants). Komponent named export, props aniq typed.
- Hech qanday secret repozitoriyda emas — `.env` + Edge Functions; token → Keychain/SecureStore.

## Definition of Done (har modul)
- Testlar yashil; TypeScript/lint toza.
- Kod-review topilmalari yopilgan.
- UI bo'lsa dizayn tizimiga moslik tekshirilgan (va web nusxa emasligi).
- SRS'dagi modul FR talablari bajarilgan; TODO/taxmin yo'q.
- Haqiqiy qurilmada xulq tasdiqlangan (faqat "test yashil" emas).
- Offline + mehmon rejimida ishlashi buzilmagan.
