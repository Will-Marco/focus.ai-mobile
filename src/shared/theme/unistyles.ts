import { StyleSheet } from 'react-native-unistyles';
import { lightTheme, darkTheme } from './themes';
import { breakpoints } from './breakpoints';
import { getStoredThemePref } from './themeController';

type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

const pref = getStoredThemePref();

StyleSheet.configure({
  themes: { light: lightTheme, dark: darkTheme },
  breakpoints,
  settings:
    pref === 'system' ? { adaptiveThemes: true } : { initialTheme: pref },
});
