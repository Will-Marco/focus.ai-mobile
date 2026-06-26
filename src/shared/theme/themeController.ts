import { UnistylesRuntime } from 'react-native-unistyles';
import { storage } from '@shared/lib/storage/mmkv';

export type ThemePref = 'light' | 'dark' | 'system';

const KEY = 'theme.pref';

export function getStoredThemePref(): ThemePref {
  const v = storage.getString(KEY);
  // Default: dark — dizayn dark-first (Ember).
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'dark';
}

export function setThemePref(pref: ThemePref): void {
  storage.set(KEY, pref);
  if (pref === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(pref);
  }
}

export function getActiveThemeName(): 'light' | 'dark' {
  return (UnistylesRuntime.themeName as 'light' | 'dark') ?? 'light';
}
