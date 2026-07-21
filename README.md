# Focus AI

**Odat quruvchi fokus-taymer — telefoningizni qo'yib qo'yganingiz uchun mukofotlaydi.**

Ko'pchilik fokus ilovalari ekranga tikilib turishingizni kutadi. Focus AI teskarisini
qiladi: telefonni **yuztuban qo'ysangiz** sessiya "Away" rejimiga o'tadi va siz **ikki
barobar XP** olasiz. Yon burasangiz — ekran katta stol soatiga aylanadi va tizim
"Bezovta qilmang" rejimi yoqiladi. Diqqat qurilmadan uziladi, taymer esa ishlashda davom
etadi.

Ilova **butunlay offline ishlaydi** — ro'yxatdan o'tmasdan, internetsiz. Mehmon rejimida
ochib, darhol sinab ko'rish mumkin.

---

## Signature: Focus Modes (orientatsiyaga sezgir)

Telefon holatiga qarab ilova o'zini butunlay boshqacha tutadi:

| Holat | Rejim | Nima bo'ladi |
|---|---|---|
| 📱 Tik | Odatiy sessiya | Skia ring, jonli progress, fon ovozi |
| 🛌 **Yuztuban** | **Away** | Ekran qorayadi, sensor kuzatadi, **2× XP bonus** |
| 🔄 **Yon** | **Focus Clock** | Katta stol soati + tizim DND (Android) |

Yuztuban holat akselerometr bilan aniqlanadi — hysteresis va "hold" oynasi bilan, ya'ni
telefonni qo'lda ushlab turganda yoki tasodifiy qimirlaganda yolg'on ishga tushmaydi.

## Boshqa imkoniyatlar

- **Taymer yadrosi** — bir vaqtda bir nechta sessiya, overtime (100% dan keyin ham davom
  etadi), erta tugatilgan sessiya "pauzada" saqlanadi va keyin davom ettiriladi
- **Odatlar** — kunlik/haftalik/oylik davr + "necha marta" maqsadi; hisob davr
  chegarasida avtomatik tiklanadi
- **Streak · statistika · gamifikatsiya** — auto-freeze streak, heatmap, XP/level, 12 badge
- **Focus Rooms** — guruh yaratish, jonli presence (kim hozir fokusda), feed, taklif
- **AI murabbiy** — anonim metrikalar asosida shaxsiy tavsiya (Gemini, Edge Function)
- **Fon ovozi** — 6 ta ambient trek, loop + fade, har biri loudness bo'yicha kalibrlangan
- **Bildirishnomalar** — eslatma, streak ogohlantirishi, quiet hours
- **Sync** — Supabase, last-write-wins, offline-first ustiga qurilgan

## Skrinshotlar

> _(topshiruvdan oldin qo'shiladi)_

---

## Tech stack

| Qatlam | Tanlov |
|---|---|
| Framework | React Native **0.86** (bare CLI, Expo'siz), **New Architecture ON** |
| Til | TypeScript (strict, `any` yo'q) |
| Navigatsiya | React Navigation (native-stack + bottom-tabs) |
| State | Zustand · TanStack Query (server holati) |
| Styling | Unistyles 3 (C++ yadro — theme almashuvi re-render'siz) |
| Grafika | Skia + Reanimated 4 (ring UI thread'da, React re-render'siz) |
| Local DB | op-sqlite 17 (doimiy) + MMKV 3 (issiq taymer holati) |
| Sensor / Haptic | nitro-sensors · nitro-haptics (worklet, UI thread) |
| Audio | react-native-audio-api (Web Audio uslubi) |
| Notif | Notifee |
| Backend | Supabase (auth · Postgres · Realtime · Edge Functions) |
| AI | Gemini `2.5-flash` (Edge Function orqali, kalit ilovada emas) |
| i18n | react-i18next (uz-Latn birlamchi) |

Har bir tanlov ataylab qilingan: Unistyles C++ yadrosi tema almashuvini re-render'siz
qiladi, Skia ring UI thread'da aylanadi (JS bloklanmaydi), MMKV esa taymer holatini
millisekundlarda saqlaydi — ilova o'ldirilsa ham sessiya yo'qolmaydi.
To'liq asoslar: [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md).

## Arxitektura — Feature-Sliced Design

```
src/
├── app/        # init: providers, navigation, theme/i18n
├── screens/    # ekran kompozitsiyalari (11 ta)
├── widgets/    # mustaqil UI bloklar
├── features/   # biznes qiymatli interaksiyalar (run-session, create-habit, sync…)
├── entities/   # biznes modellar (habit, session, profile, stats…)
└── shared/     # ui · lib · api · config · theme — biznes mantiqsiz
```

Qatlam faqat **pastdagi** qatlamdan import qiladi, cross-slice aloqa faqat public API
(`index.ts`) orqali. Qoida `eslint-plugin-boundaries` bilan majburlanadi — ya'ni buzilsa
lint yiqiladi, kod-review'ga qolmaydi.

Pure biznes mantiq (`model/`, `lib/`) UI'dan ajratilgan: timer matematikasi, streak
hisobi, XP, quiet-hours, sync merge — hammasi toza funksiya va test bilan qoplangan.

---

## Ishga tushirish

**Talablar:** Node ≥ 20, JDK 17, Android Studio (Android) / Xcode 16+ (iOS).

```bash
npm install
cp .env.example .env      # Supabase kalitlari (ixtiyoriy — mehmon rejimi ularsiz ishlaydi)
npm start                 # Metro
```

Keyin ikkinchi terminalda:

```bash
npm run android
```

### iOS

```bash
bundle install            # birinchi marta — CocoaPods
cd ios && pod install && cd ..
npm run ios
```

> iOS'da tizim DND mavjud emas (Apple public API bermaydi) — face-down "Away" va
> landscape "Focus Clock" to'liq ishlaydi, faqat tizim DND Android'ga xos.

### Release APK

```bash
cd android && ./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

## Sifat

```bash
npm test              # Jest — 158 test, 25 suite
npx tsc --noEmit      # TypeScript strict
npm run lint          # ESLint + FSD boundaries
```

Testlar slice ichida co-located (`model/timer.test.ts`, `ui/HabitCard.test.tsx`).
Ustuvorlik logikaga berilgan: taymer, streak, XP, quiet-hours, sync merge — bular
deterministik va to'liq qoplangan.

---

## Hujjatlar

| Fayl | Nima |
|---|---|
| [`docs/SRS.md`](docs/SRS.md) | To'liq spetsifikatsiya — funksional talablar, modul bo'linishi, acceptance mezonlari |
| [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md) | O'zgarmas tamoyillar va stack tanlovlarining sabablari |

## Litsenziya

Konkurs topshirig'i sifatida ishlab chiqilgan.
