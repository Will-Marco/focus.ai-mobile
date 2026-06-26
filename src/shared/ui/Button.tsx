import React from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: ButtonVariant;
}

export function Button({
  title,
  variant = 'primary',
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { theme } = useUnistyles();
  const isPrimary = variant === 'primary';

  const label = (
    <Text
      style={
        isPrimary
          ? styles.labelOnColor
          : variant === 'danger'
          ? styles.labelDanger
          : styles.labelOnSurface
      }
    >
      {title}
    </Text>
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrap,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style as object,
      ]}
      {...rest}
    >
      {isPrimary ? (
        <LinearGradient
          colors={[...theme.colors.gradientBrand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.base}
        >
          {label}
        </LinearGradient>
      ) : (
        <View style={[styles.base, styles[variant]]}>{label}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create(theme => ({
  wrap: { borderRadius: theme.radius.lg, overflow: 'hidden' },
  base: {
    height: 54,
    paddingHorizontal: theme.spacing(5),
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: {
    backgroundColor: 'rgba(178,58,72,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(236,92,125,0.3)',
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  labelOnColor: {
    color: theme.colors.onBrand,
    fontFamily: theme.fontFamily.bold,
  },
  labelOnSurface: {
    color: theme.colors.textStrong,
    fontFamily: theme.fontFamily.semibold,
  },
  labelDanger: {
    color: theme.colors.danger,
    fontFamily: theme.fontFamily.bold,
  },
}));
