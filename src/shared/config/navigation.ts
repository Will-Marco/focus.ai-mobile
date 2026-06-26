import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Navigatsiya kontrakti (biznes-mantiqsiz) — shared'da, shuning uchun screens
// ham app'dan import qilmasdan typed bo'ladi (FSD: faqat pastga import).
export type RootStackParamList = {
  Tabs: undefined;
  AddHabit: { habitId?: string } | undefined;
  ActiveSession: { habitId: string; sessionId?: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Stats: undefined;
  Team: undefined;
  Profile: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
