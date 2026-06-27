import { palette } from './palette';

// EMBER dizayn shriftlari (design/DESIGN-SPEC.md). .ttf assets/fonts ga qo'shilganda
// ishlaydi; bo'lmasa RN tizim shriftiga fallback (crash yo'q).
const fontFamily = {
  regular: 'HankenGrotesk-Regular',
  medium: 'HankenGrotesk-Medium',
  semibold: 'HankenGrotesk-SemiBold',
  bold: 'HankenGrotesk-Bold',
  extrabold: 'HankenGrotesk-ExtraBold',
  display: 'HankenGrotesk-ExtraBold',
  mono: 'GeistMono-Regular',
  monoMedium: 'GeistMono-Medium',
  monoSemibold: 'GeistMono-SemiBold',
} as const;

const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 27,
  xxxl: 30,
  display: 34,
  timer: 54,
  timerLg: 64,
} as const;

const radius = { sm: 10, md: 14, lg: 16, xl: 20, pill: 100 } as const;

const spacing = (n: number) => n * 4;

const shared = { fontFamily, fontSize, radius, spacing };

// DARK — asosiy (dizayn dark-first)
export const darkTheme = {
  ...shared,
  name: 'dark',
  colors: {
    background: palette.espresso,
    backgroundElevated: palette.espressoElevated,
    surface: 'rgba(255,255,255,0.04)',
    surfaceAlt: 'rgba(255,255,255,0.035)',
    surfaceStrong: 'rgba(255,255,255,0.06)',
    text: palette.cream,
    textStrong: palette.white,
    textMuted: palette.taupe,
    textDim: palette.mocha,
    brand: palette.amber,
    brandDeep: palette.coral,
    brandCoral: palette.coral,
    onBrand: palette.onBrand,
    gold: palette.gold,
    goldSoft: palette.goldSoft,
    danger: palette.rose,
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.12)',
    tabActive: palette.amber,
    tabInactive: palette.mocha,
    gradientBrand: [palette.amber, palette.coral],
    gradientRing: [palette.goldSoft, palette.amber, palette.coral],
    // Faol sessiya radial fon (markazdan tashqariga)
    sessionBg: ['#3a2410', '#1f140b', palette.espresso],
    // Active session banner (gradient + border)
    bannerBg: ['rgba(242,162,76,0.2)', 'rgba(242,96,62,0.08)'],
    bannerBorder: 'rgba(242,162,76,0.32)',
    // ProgressRing track asosiy RGB (opacity per-call beriladi)
    trackRgb: '255,255,255',
  },
} as const;

// LIGHT — Kunduzgi (aniq tokenlar `Light Mavzu.dc.html` dan).
export const lightTheme = {
  ...shared,
  name: 'light',
  colors: {
    background: '#FCF6EF',
    backgroundElevated: '#F3E7D8',
    surface: '#FFFFFF',
    surfaceAlt: '#FFFFFF',
    surfaceStrong: '#FFFFFF',
    text: '#2A1C12',
    textStrong: '#2A1C12',
    textMuted: '#9A7E64',
    textDim: '#B49A82',
    brand: '#E89A3C',
    brandDeep: '#E0552E',
    brandCoral: '#E0552E',
    onBrand: palette.white,
    gold: '#C2641F',
    goldSoft: '#F2B45A',
    danger: '#C2415C',
    border: 'rgba(42,28,18,0.07)',
    borderStrong: 'rgba(42,28,18,0.12)',
    tabActive: '#E0552E',
    tabInactive: '#B49A82',
    gradientBrand: ['#E89A3C', '#E0552E'],
    gradientRing: ['#F2B45A', '#E89A3C', '#E0552E'],
    sessionBg: ['#FFF3E2', '#FBF1E4', '#F3E7D8'],
    bannerBg: ['#FFF1E0', '#FFE6D6'],
    bannerBorder: 'rgba(224,138,46,0.28)',
    trackRgb: '42,28,18',
  },
} as const;

export type AppTheme = typeof darkTheme;
