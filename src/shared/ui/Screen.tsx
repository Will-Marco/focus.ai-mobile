import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
}

/** Iliq dark gradient fon + safe-area — barcha ekranlar uchun o'rov (EMBER). */
export function Screen({ children, edges = ['top'] }: ScreenProps) {
  const { theme } = useUnistyles();
  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.backgroundElevated]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.fill}
    >
      <SafeAreaView style={styles.fill} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create(() => ({
  fill: { flex: 1 },
}));
