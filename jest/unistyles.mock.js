/**
 * Minimal Unistyles mock — komponent testlari uchun.
 * StyleSheet.create(fn) ni light tema bilan oddiy style obyektiga aylantiradi.
 */
const { lightTheme } = require('../src/shared/theme/themes');

const rt = { screen: { width: 390, height: 844 }, insets: {} };

const StyleSheet = {
  create: stylesOrFn =>
    typeof stylesOrFn === 'function' ? stylesOrFn(lightTheme, rt) : stylesOrFn,
  configure: () => {},
};

const useUnistyles = () => ({ theme: lightTheme, rt });

const UnistylesRuntime = {
  setTheme: () => {},
  setAdaptiveThemes: () => {},
  themeName: 'light',
  colorScheme: 'light',
};

module.exports = { StyleSheet, useUnistyles, UnistylesRuntime };
