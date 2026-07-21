# Kreativ tavsif — Focus AI

## Muammo

Fokus ilovalari qiziq qarama-qarshilikka ega: ular sizni diqqatingizni jamlashga
undaydi, lekin buning uchun **ekranga qarab turishingizni** talab qiladi. Taymer
ishlayotganini ko'rish uchun telefonni qo'lda ushlaysiz — va o'sha telefon aynan
diqqatingizni bo'ladigan narsa. Bildirishnoma keladi, barmoq o'z-o'zidan boshqa ilovaga
siljiydi, sessiya buziladi.

Biz shu qarama-qarshilikni asosiy g'oyaga aylantirdik.

## Yechim: Focus Modes — telefon holati interfeys bo'ladi

Focus AI'da **telefonning fizik holati** ilovani boshqaradi. Tugma bosish shart emas —
qurilmani qo'yib qo'yish o'zi buyruq.

**Telefonni yuztuban qo'ysangiz** — akselerometr buni sezadi va sessiya "Away" rejimiga
o'tadi. Ekran qorayadi, taymer ishlashda davom etadi, va siz shu vaqt uchun **ikki
barobar XP** olasiz. Ya'ni ilova sizni o'zidan uzoqlashganingiz uchun mukofotlaydi. Bu
oddiy g'oya, lekin u butun mahsulot falsafasini o'zgartiradi: muvaffaqiyat mezoni —
ilovada o'tkazgan vaqt emas, ilovadan uzoqda o'tkazgan vaqt.

**Telefonni yon bursangiz** — ekran "Focus Clock"ga aylanadi: katta, uzoqdan
o'qiladigan stol soati, ekran o'chmaydi, tizim "Bezovta qilmang" rejimi yoqiladi.
Telefon stolda turadi va vaqt o'lchagichga aylanadi, chalg'ituvchi emas.

Yuztuban holatni aniqlash sodda `z < 0` tekshiruvi emas — hysteresis va "hold" oynasi
bilan qurilgan, ya'ni telefonni qo'lda ushlab turganda yoki tasodifiy qimirlaganda
yolg'on ishga tushmaydi. Bu mantiq toza funksiya sifatida yozilgan va test bilan
qoplangan.

## Boshqa ongli qarorlar

**Sudya darhol sinaydi.** Ilova mehmon rejimida ochiladi — ro'yxatdan o'tishsiz,
internetsiz, hamma narsa ishlaydi. Local SQLite yagona haqiqat manbai, bulut esa
faqat sinxronizatsiya qatlami. Bu arxitektura qarori topshiruv talabidan kelib chiqqan,
keyin esa ilovaning o'zini kuchaytirdi.

**Sessiyani erta tugatish "pushaymonsiz".** Maqsadga yetmasdan to'xtatsangiz, sessiya
o'chmaydi — pauzada saqlanadi va istalgan vaqt davom ettiriladi. Ko'p ilovalarda erta
to'xtatish jazoga o'xshaydi; bu esa foydalanuvchini boshlashdan qo'rqitadi.

**100% — tugash emas, nishonlash.** Maqsadga yetganda haptic va animatsiya bilan
belgilanadi, lekin taymer davom etishi mumkin va ortiqcha vaqt statistikaga yoziladi.

**Vizual identitet — "Ember".** Iliq amber-koral gradientlar, dark-first. Fokus ilovalari
odatda sovuq ko'k yoki oq bo'ladi; biz ataylab teskarisiga bordik — kechqurun, chiroq
o'chirilgan xonada ishlayotgan odam uchun.

**Animatsiya bezak emas.** Progress ring Skia bilan chiziladi va Reanimated orqali UI
thread'da aylanadi — JavaScript umuman qatnashmaydi, shuning uchun ilova og'ir ish
qilayotganda ham ring silliq qoladi.

## Texnik jasorat

Loyiha React Native'ning **New Architecture** rejimida, Expo'siz qurilgan. Bu qiyinroq
yo'l, lekin sensor, haptic va grafika ustidan to'liq nazorat beradi. Taymer hech qachon
`setInterval` sanog'iga tayanmaydi — u timestamp asosida hisoblanadi, ya'ni ilova
o'ldirilsa, telefon uxlab qolsa yoki sessiya soatlab davom etsa ham vaqt to'g'ri qoladi.
