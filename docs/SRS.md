# SRS — Focus AI (Mobil)

> Software Requirements Specification. Living document — qaror o'zgarsa avval shu yerni yangilang.
> Oxirgi yangilanish: 2026-06-26

## 0. Kontekst — bu KONKURS loyihasi
Bu ilova **konkurs** uchun quriladi (Buyurtmachi: Shamsuddeen · Mukofot: $300).
Hakamlar **100 ball** bo'yicha baholaydi:

| Mezon | Ball |
|---|---|
| **Kreativlik** | **30** |
| **Interaktivlik** (animatsiya, mikro-interaksiya, haptic, sound) | **25** |
| **Dizayn** | **20** |
| Funksionallik (majburiy ekranlar + aniq taymer) | 15 |
| Kod sifati (toza struktura, README) | 10 |

**Hal qiluvchi tamoyil:** "Web versiyaning aynan nusxasi g'olib bo'lmaydi. Yangi narsa keling."
→ Maqsad: majburiy minimal + **o'ziga xos kreativ konsept** + sayqallangan dizayn/animatsiya.

**Buyurtmachi bergan shart (yagona rasmiy manba):**
1. `docs/focus-ai-mobile-konkurs-tz.pdf` — konkurs TZ, 6 sahifa. Majburiy 6 ekran,
   timestamp taymer, baholash mezonlari, **7 ta ixtiyoriy kreativ taklif**, topshirish paketi.
2. **Berilgan web versiya** — <https://focus-82lnf9rc9-shakhalimov7-engs-projects.vercel.app/>
   (bitta sahifa: odat + maqsad soat + taymer + filtr, localStorage). Mobil ilova shuning
   ustiga quriladi. To'liq funksiya taqqoslash: `docs/FEATURES.md`.

`docs/focus-ai-mobile-tz.docx` — konkurs TZ'si emas, balki **bizning kengaytirilgan vizyon
hujjatimiz**: g'oyalar manbai sifatida ishlatiladi, talab sifatida emas.

## 1. Maqsad (Goal)
Focus AI — **vaqtga asoslangan** odat kuzatuvchi mobil ilova. Foydalanuvchi odat qo'shadi,
davr (kunlik/haftalik/oylik) uchun necha marta bajarilishini belgilaydi, taymerni bosadi —
jarayon paneli haqiqiy sarflangan vaqt bilan to'lib boradi. Har bir "marta" faqat sessiya
o'z maqsadiga (100%) yetganda hisoblanadi — checkbox tap emas, real o'lchangan vaqt. Boshqa
ilovalar "qildim/qilmadim" deydi; Focus AI **haqiqiy sarflangan vaqtni** talab qiladi —
asosiy farq shu. *(2026-07-08 — habit-level maqsad birligi "soat"dan "necha marta"ga
o'zgardi; sessiya-darajasidagi real vaqt taymeri o'zgarmadi. Batafsil: PROGRESS.md Qaror
jurnali.)*

## 2. Doira (Scope)
**Kiradi (MVP — majburiy + farqlovchi):**
- Majburiy ekranlar: Onboarding · Sign Up/In (mehmon rejimi default) · Dashboard · Odat qo'shish · Faol sessiya · Profil
- Timestamp asosidagi aniq taymer (ko'p odat parallel, background-safe, qayta ochilganda tiklanadi)
- Offline-first local persistence (mehmon rejimi — login'siz to'la ishlaydi)
- **Kreativ ustun: Focus Modes** — orientatsiyaga sezgir rejimlar (face-down "Away" + landscape "Focus Clock")
- Audio fon + haptic + mikro-interaksiyalar (interaktivlik)
- Streak + statistika + gamifikatsiya (XP/level/badge)
- Local bildirishnomalar
- Supabase sync (offline-first ustiga, ixtiyoriy login → multi-device)
- **Team / Focus Rooms** — guruh, jonli birga-fokus presence + feed (online-only ustki qatlam)
- AI murabbiy (bepul tier: Gemini/Groq, Edge Function orqali)
- O'zbek tili (lotin) — birlamchi

**Kirmaydi (non-goals — hozircha):**
- Premium/monetizatsiya (paywall, IAP)
- Challenge/do'stlar musobaqasi, Hamjamiyat, Stories (V2+)
- Apple Watch / Wear OS
- Web versiya (alohida loyiha — mavjud)
- App Store/Play Store rasmiy release (APK / TestFlight link kifoya)
- Ko'p tillilik to'liq (ru/en) — keyin; avval uz-Latn

## 3. Foydalanuvchilar / aktyorlar
- **Mehmon foydalanuvchi** — login'siz, hamma narsa qurilmada. Sudya shu rejimda darrov sinaydi.
- **Ro'yxatdan o'tgan foydalanuvchi** — Supabase auth, multi-device sync.
- **Hakam (judge)** — APK'ni o'rnatib, internet/login'siz to'la sinab ko'ra olishi SHART.
- Personas (docx'dan): talaba (imtihonga soat), freelance dev (fokus), ona/marafonchi (streak).

## 4. Funktsional talablar (modullar bo'yicha)

### Modul 1: Fundament & Dizayn tizimi
- FR-1.1 — RN CLI (bare, Expo'siz) + TypeScript strict; ESLint/Prettier; React Navigation (native-stack + bottom-tabs).
- FR-1.2 — Theme tizimi: Light/Dark (dark default); **Ember** palitrasi (brand gradient amber `#F2A24C`→coral `#F2603E`, gold aksent `#F7D98A`, fon gradient `#120c08`→`#1c130c`, matn `#F6E9E0`) — bizning o'ziga xos iliq, dark-first vizual identitet. *(Ember palitrasi M1 dan keyin tanlandi — dastlabki firuza variant brendni sovuq va umumiy ko'rsatardi.)*
- FR-1.3 — Tipografika: Display+Body (**Hanken Grotesk** 400–800), Mono (**Geist Mono**, taymer/raqam/% — tabular-nums). *(Eski Bricolage/Figtree/Spline bekor.)*
- FR-1.4 — Asosiy komponentlar: Button (Primary/Secondary/Ghost/Danger), Card, Sheet/Dialog, Toast, ProgressRing (Skia), Mini progress.
- FR-1.5 — i18n (uz-Latn), barcha matn string-key orqali.
- FR-1.6 — Local storage qatlami: MMKV (tezkor key-value: faol taymer holati, sozlama) + local SQLite (op-sqlite/WatermelonDB — habits/sessions tarixi).
- *Acceptance:* ilova ishga tushadi, themed shell, dark/light almashadi, uz matnlar, local store o'qiydi/yozadi.

### Modul 2: Taymer yadrosi & Odat oqimi (YURAK)
- FR-2.1 — Odat CRUD: nom (1-50), ikonka (8+), rang (4+), **davr (kunlik/haftalik/oylik — majburiy, "umrlik" turi yo'q) + necha marta** (kunlik 1-5 def.1 / haftalik 1-14 def.3 / oylik 1-60 def.8), rasm (ixtiyoriy), kategoriya; tahrir/o'chirish (tasdiq bilan)/arxiv. *(2026-07-08 — avval "maqsad soat 0.1-1000" + `type` cumulative/recurring edi; sessiya davomiyligi habit yaratishda emas, sessiya boshlanganda tanlanadi — o'zgarmadi.)*
- FR-2.2 — Dashboard: odatlar ro'yxati (mini progress + foiz), bo'sh holat (chiroyli empty state), "yangi odat" tugmasi (FAB).
- FR-2.3 — Timestamp taymer: `o'tgan = accumulatedMs + (now − runningSince)`. Start/Pause/Resume/Finish/Reset.
- FR-2.4 — Background-safe: ilova yopilsa/uxlasa ham vaqt aniq (timestamp asosida, setInterval emas).
- FR-2.5 — Bir vaqtda bir nechta sessiya mustaqil ishlaydi (biri pauza, biri running).
- FR-2.6 — Auto-complete 100%; manfiy vaqt yoki maqsaddan oshib ketish bo'lmaydi.
- FR-2.7 — Faol sessiya ekrani: katta dumaloq progress (Skia, 60fps), o'tgan/qolgan vaqt (tap bilan almashadi), Boshlash/Pauza/Davom/Yakunlash; 100% da yutuq holati.
- FR-2.8 — Qayta ochilganda barcha odatlar va jarayon tiklanadi.
- FR-2.9 — **Habit progress = necha marta hisoblash (2026-07-08).** Sessiya faqat o'z maqsadiga (100%, `completed=true`) yetganda habit'ning joriy davr oynasidagi "bajarilgan marta"siga qo'shiladi (erta to'xtatilgan sessiya hisoblanmaydi — FR-2.10ga qarang). Qolgan/bajarilgan son alohida saqlanmaydi — joriy davr oynasi (`periodWindow`) ichidagi `completed=true` sessiyalar soni har safar `sessions`dan hisoblanadi (mavjud `sumDurationMs`ga o'xshash yangi `countCompleted` so'rovi, **`ended_at` bo'yicha filtrlanadi**, `started_at` emas — pastga qarang). Davr chegarasi o'tganda hisob avtomatik `targetCount`ga tiklanadi (habit hech qachon avtomatik o'chmaydi — faqat qo'lda).
- FR-2.10 — **Erta tugatilgan sessiya = "pushaymon yo'q" (2026-07-08).** "Yakunlash" (target'ga yetmasdan) endi `finish()` (destructive, darhol SQLite'ga `completed:false` yozadi) chaqirmaydi — sessiya oddiy pauzada qoladi (`active` MMKV massivida), Dashboard'da banner sifatida ko'rinadi, istalgan vaqt qayta ochib davom ettirish mumkin (mavjud ko'p-parallel-active-sessiya infratuzilmasi — `activeSessionStorage`/`sessionStore` — o'zgarishsiz qayta ishlatiladi). Foydalanuvchi butunlay tashlab yubormoqchi bo'lsa — banner'da o'chirish (trash) tugmasi, mavjud `discard(id)` chaqiradi (yozmasdan bekor qiladi). Sessiya faqat o'z 100%iga real yetganda `finish()` chaqirilib SQLite'ga yoziladi — demak yozilgan har bir `sessions` qatori endi doim `completed=true` (below-target `completed:false` qator umuman yaratilmaydi). **Davr-chegara o'tish qoidasi:** agar sessiya davr chegarasidan o'tib (masalan dushanba boshlanib chorshanba tugatilgan) davom ettirilsa — **tugatilgan kunga** (`endedAt`) hisoblanadi, boshlangan kunga emas (shu sabab FR-2.9'dagi so'rov `ended_at` bo'yicha filtrlaydi).
- *Acceptance:* odat yaratib, taymer ishlatib, ilovani yopib-ochib vaqt aniq tiklanishini ko'rsatish. Taymer mantiqi unit-test bilan (90%+).

### Modul 3: Mandatory shell (Onboarding + Auth + Profil)
- FR-3.1 — Onboarding: 2-3 slayd (ilova nima qiladi), Skip har doim ko'rinarli.
- FR-3.2 — Auth: **mehmon rejimi default** (darrov kirish); Email+parol (sign up/in), "Parolni unutdim" tiklash. Xato xabarlari aniq, o'zbekcha. (Google — M8 da.)
- FR-3.3 — Profil: ism, avatar (ixtiyoriy), til tanlash (uz), mavzu (Light/Dark), Logout.
- *Acceptance:* barcha majburiy ekranlar ishlaydi → ilova birinchi marta to'liq topshiriladigan holatda.

### Modul 4: Focus Modes (orientatsiyaga sezgir) — SIGNATURE KREATIV
- FR-4.1 — Akselerometr orqali telefon holatini aniqlash: portrait / landscape (yon) / face-down (yuztuban).
- FR-4.2 — **Face-down "Away"**: ekran qorayadi, telefonsizlik bonusi (2× XP) hisoblanadi; ko'tarsa yengil ogohlantirish, sessiya to'xtamaydi.
- FR-4.3 — **Landscape "Focus Clock"**: katta glanceable taymer (stol soati), keep-awake (ekran o'chmaydi), minimal UI; **distraction-free**: bizning bildirishnomalar bloklanadi + Android tizim DND so'raladi (iOS — faqat in-app).
- FR-4.4 — Holat o'zgarishida haptic feedback; rejimlar orasida silliq animatsiya.
- *Acceptance:* uchala holatda to'g'ri rejim, bonus to'g'ri hisoblanadi, DND in-app ishlaydi, Android DND ruxsati so'raladi.

### Modul 5: Audio + Haptic + mikro-interaksiya — INTERAKTIVLIK
- FR-5.1 — Fokus audio fon (yomg'ir/lo-fi), loop, sessiya bilan boshqariladi.
- FR-5.2 — Haptic: start/pause/finish/100%/milestone.
- FR-5.3 — Celebration animatsiyasi (100% da), mikro-interaksiyalar (tugma press, ro'yxat, o'tishlar) 60fps.
- *Acceptance:* audio ishlaydi/to'xtaydi, haptic to'g'ri nuqtalarda, animatsiyalar silliq.

### Modul 6: Streak + Statistika + Gamifikatsiya
- FR-6.1 — Streak qoidalari (kunlik kamida 1 odat); eng uzun rekord; streak freeze (hafta 1).
- FR-6.2 — GitHub uslubidagi heatmap (365 kun); haftalik/oylik grafiklar; "+20%" taqqoslash.
- FR-6.3 — XP (daqiqa=1XP, 100%=+50, streak=+10, phone-down=2×), darajalar, badge'lar (10+).
- *Acceptance:* streak to'g'ri sanaladi, heatmap/grafiklar real ma'lumotdan, XP/badge mantiqi unit-test bilan.

### Modul 7: Bildirishnomalar (local)
- FR-7.1 — Notifee local: odat eslatmasi (foydalanuvchi vaqti), 100% yutuq, streak-xavfi.
- FR-7.2 — Quiet Hours: belgilangan oraliqda hech narsa kelmaydi.
- *Acceptance:* eslatma belgilangan vaqtda keladi, quiet hours hurmat qilinadi.

### Modul 8: Supabase sync (offline-first) + Google Sign In
- FR-8.1 — Supabase schema + RLS (profiles, habits, sessions, badges, streaks); foydalanuvchi faqat o'z ma'lumotini ko'radi.
- FR-8.2 — Auth ulash (email + Google + anonymous→link); local DB = manba, sync engine connectivity bo'lganda LWW + timestamp.
- FR-8.3 — Multi-device: bir qurilmada o'zgarish ikkinchisida ko'rinadi.
- *Acceptance:* mehmon ma'lumoti login'dan keyin cloud'ga ko'chadi; ikki qurilma sinxron; offline'da to'la ishlaydi.

### Modul 9: Team / Focus Rooms (online-only ustki qatlam)
- FR-9.1 — Guruh yaratish: nom, ixtiyoriy belgi/rang; yaratgan — owner.
- FR-9.2 — Maqsadli taklif: a'zo foydalanuvchini username/email orqali topib taklif yuboradi; taklif **in-app bildirishnoma** sifatida keladi va ichida **guruh havolasi** bo'ladi.
- FR-9.3 — Taklifni ochган user **kirishdan oldin** guruh a'zolarini (preview) ko'radi → **Qabul** yoki **Rad** etadi.
- FR-9.4 — A'zolikni boshqarish: a'zo guruhdan chiqishi; owner a'zoni chiqarishi; limitlar (guruhda ~20 a'zo, user ~5 guruh — spam oldini olish).
- FR-9.5 — **Jonli Focus Rooms (presence):** guruh ekranida a'zolar real-time holati — kim hozir fokusda (qaysi odat + o'tgan vaqt), kim offline/oxirgi faollik. Supabase Realtime presence.
- FR-9.6 — **Feed:** a'zo sessiyani 100% tugatganda guruh feed'iga voqea + in-app realtime banner. Push (FCM) — keyingi bosqich (non-goal hozircha).
- FR-9.7 — RLS: faqat guruh a'zolari guruh ma'lumotini ko'radi; taklif qilingan user faqat a'zolar preview'ini ko'radi. Shaxsiy ma'lumot oshkor bo'lmaydi.
- *Eslatma:* bu modul **faqat online + auth** ishlaydi; core ilova baribir offline/mehmon ishlaydi. Demo videoda ko'rsatiladi.
- *Acceptance:* ikki akkaunt bilan guruh yaratib, taklif yuborib (havolali notif), preview ko'rib qabul qilib — biri sessiya boshlasa ikkinchisida **jonli** ko'rinadi va 100% tugatganda feed'da chiqadi.

### Modul 10: AI murabbiy
- FR-10.1 — Supabase Edge Function → bepul AI (Gemini/Groq), API kalit server tomonda.
- FR-10.2 — Kunlik motivatsiya + haftalik tahlil (oxirgi 30 kun konteksti, anonim metrikalar — shaxsiy ma'lumot yuborilmaydi).
- FR-10.3 — Javoblar keshlanadi; offline'da oxirgi keshlangan ko'rsatiladi; bepul limit (kuniga 5).
- *Acceptance:* insight Edge Function orqali keladi, kesh ishlaydi, kalit mijozda yo'q, offline fallback bor.

### Modul 11: Topshiruv paketi
- FR-11.1 — Android APK (release) — sudya o'rnatadi; build hujjatlangan. iOS — TestFlight orqali (M13'da qo'shildi).
- FR-11.2 — README (ishga tushirish, tech stack); kod toza struktura.
- FR-11.3 — 1-3 daqiqalik demo video skript; 300-500 so'z kreativ tavsif (qaysi g'oyalar qo'shildi).
- *Acceptance:* toza checkout'dan APK quriladi va ishlaydi; topshiruv elementlari to'liq.

## 5. Nofunktsional talablar
- **Performance:** cold start < 2s; ekran o'tish < 200ms; progress paneli aniq 60fps (Reanimated UI thread / Skia); fonda battery < 0.5%/soat.
- **Reliability:** taymer timestamp asosida — yopilsa/uxlasa/yangilansa ham aniq; offline'da to'la ishlaydi; qayta ochilganda holat tiklanadi.
- **Security:** API kalitlari (AI, push) faqat Edge Functions'da, mijozda emas; tokenlar SecureStore (Keychain/Keystore); RLS yoqilgan; shaxsiy ma'lumot AI'ga yuborilmaydi.
- **Usability/A11y:** WCAG kontrast, screen reader (TalkBack/VoiceOver), uz tilida aniq xato xabarlari.
- **Tooling:** sudya bepul/open-source vositalar bilan to'la sinay olishi (pullik xizmat shart emas).

## 6. Tech stack & arxitektura
- **Frontend:** React Native CLI (bare, Expo'siz) **0.86+**, TypeScript strict, **New Architecture ON** (0.82'dan yagona yo'l).
- **Navigatsiya:** React Navigation (native-stack + bottom-tabs).
- **State:** Zustand (local/timer UI holati) + TanStack Query (Supabase server holati, M8).
- **Local DB:** MMKV **v3** (key-value: qaynoq taymer) + **op-sqlite v17** (JSI, reactive queries, SQLCipher) — ixtiyoriy **Drizzle ORM** (type-safe). Manba haqiqat = local.
- **Grafika/animatsiya:** **react-native-skia** + **Reanimated 4** (New-Arch only) + **Moti** (deklarativ mikro-animatsiya) + gesture-handler. Ring: `useClock()` + `useDerivedValue` (UI thread, React re-render'siz).
- **Sensor:** **react-native-nitro-sensors** (Nitro/JSI — akselerometr, Focus Modes orientatsiyasi).
- **Haptic/Audio:** **react-native-nitro-haptics** (Nitro, worklet support — UI thread'дан Skia bilan sinxron); audio loop — react-native-track-player (New Arch, background).
- **Notif:** Notifee (local).
- **i18n:** i18next / react-i18next.
- **Backend:** Supabase (Auth, Postgres + RLS, Realtime, Edge Functions — AI). Offline-first ustiga sync.
- **Team realtime:** Supabase Realtime **presence** (jonli Focus Rooms) + feed. ⚠️ `track()` throttle qilinadi (rate-limit/kvota) — start/stop + heartbeat. Push (FCM) keyingi bosqich.
- **AI:** bepul tier (Gemini/Groq) Edge Function orqali.
- **Arxitektura qatlamlari:** UI · biznes mantiq (taymer/streak/XP — pure, test qilinadigan) · ma'lumot (local DB + sync) · tarmoq · AI (Edge Function).
- **Tracer-bullet:** har modul mustaqil ishlaydigan qiymat beradi; M2 dan keyin demoable, M3 dan keyin to'liq topshiriladigan.

## 7. UI/UX
- Dizayn tizimi: Ember palitrasi + tipografika + komponent kutubxonasi (`src/shared/ui`, `src/shared/theme`).
- Uslub: "Tinch kuch" (Quiet Power) — sokin, ataylab tanlangan, fokusga yordam beradigan. **O'ziga xos vizual identitet**, web versiyasidan farqli (TZ talabi).
- Har modul yakunida UI dizayn tizimiga moslik va "web nusxasi emasligi" bo'yicha tekshiriladi.

## 8. Tashqi bog'liqliklar / integratsiyalar
- Supabase (Auth/DB/Realtime/Edge Functions).
- Bepul AI API (Gemini yoki Groq).
- Google Sign In (M8).
- Android DND access (Focus Clock — ixtiyoriy ruxsat).

## 9. Qaror jurnali (yopilgan savollar)
- [x] Yakuniy deadline: **2026-07-27**.
- [x] AI provayderi: **Gemini `2.5-flash`** (bepul tier; `2.0-flash` kvotasi 0 bo'lgani uchun).
- [x] Local SQLite kutubxonasi: **op-sqlite v17** (WatermelonDB rad — kichik schema'da custom LWW sync oson).
- [x] Audio: **react-native-audio-api** — 6 ta ambient trek, har biri loudness bo'yicha kalibrlangan (RMS tarqalishi 23 dB edi).
- [x] iOS: **qo'shildi** (M13) — konfiguratsiya + 7 ta platforma defekti tuzatildi; tizim DND'dan tashqari hamma narsa ishlaydi.
