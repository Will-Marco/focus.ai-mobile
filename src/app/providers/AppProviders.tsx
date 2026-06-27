import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme, type Theme } from '@react-navigation/native';
import { useUnistyles } from 'react-native-unistyles';
import { useBootstrap } from '@app/lib/useBootstrap';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { ready } = useBootstrap();
  const { theme } = useUnistyles();

  // Navigatsiya konteyner mavzusi — transition paytida oq fon chaqnashining oldini oladi.
  const navTheme = useMemo<Theme>(() => {
    const base = theme.name === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.background,
        card: theme.colors.backgroundElevated,
        text: theme.colors.text,
        border: theme.colors.border,
        primary: theme.colors.brand,
      },
    };
  }, [theme]);

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>{ready ? children : null}</NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
