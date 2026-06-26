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
  },
} as const;

// LIGHT — iliq variant. ⚠️ Placeholder: aniq tokenlar `Light Mavzu.dc.html` dan olinadi.
export const lightTheme = {
  ...shared,
  name: 'light',
  colors: {
    background: '#FBF5EE',
    backgroundElevated: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F4EAE0',
    surfaceStrong: '#EFE3D6',
    text: '#2A1D12',
    textStrong: '#1A1209',
    textMuted: '#8a7263',
    textDim: '#A08A78',
    brand: '#E07B2E',
    brandDeep: '#D14A2A',
    brandCoral: '#D14A2A',
    onBrand: palette.white,
    gold: '#C9912F',
    goldSoft: '#E6B95C',
    danger: '#C2415C',
    border: 'rgba(0,0,0,0.08)',
    borderStrong: 'rgba(0,0,0,0.12)',
    tabActive: '#E07B2E',
    tabInactive: '#A08A78',
    gradientBrand: ['#F2A24C', '#F2603E'],
    gradientRing: ['#F7D98A', '#F2A24C', '#F2603E'],
  },
} as const;

export type AppTheme = typeof darkTheme;
