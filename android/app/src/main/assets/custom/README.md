# Shriftlar (Fonts)

Bu papkaga `.ttf` fayllar tashlanadi, so'ng linklanadi:

```bash
npx react-native-asset
```

Kerakli oilalar (OFL, bepul — Google Fonts):

| Rol | Oila | Kutilayotgan fayl nomlari (fontFamily) |
|---|---|---|
| Display | Bricolage Grotesque | `BricolageGrotesque-Bold` |
| Body | Figtree | `Figtree-Regular`, `Figtree-Medium`, `Figtree-SemiBold`, `Figtree-Bold` |
| Mono (taymer) | Spline Sans Mono | `SplineSansMono-Regular` |

> Eslatma: `src/shared/theme/themes.ts` shu nomlarga tayanadi. Fayl bo'lmasa RN
> tizim shriftiga fallback qiladi (crash yo'q). Dizayn yakunlanganда shriftlar
> shu yerga qo'shiladi (DESIGN-BRIEF §6 — dizayner shriftni o'zgartirishi mumkin).
