import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { PlusIcon } from './icons';

export type FabProps = Omit<PressableProps, 'children'>;

/** Floating Action Button — gradient, "+" (yangi odat). */
export function Fab({ disabled, ...rest }: FabProps) {
  const { theme } = useUnistyles();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      {...rest}
    >
      <LinearGradient
        colors={[...theme.colors.gradientBrand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inner}
      >
        <PlusIcon size={30} color={theme.colors.onBrand} strokeWidth={2.6} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create(theme => ({
  wrap: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.xl,
    // dizayn: box-shadow 0 14px 34px rgba(242,120,62,.5) — coral, yumshoq
    shadowColor: '#F2783E',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  inner: {
    flex: 1,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.9 },
}));
