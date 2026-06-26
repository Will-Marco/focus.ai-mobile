import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type TextVariant = 'display' | 'title' | 'body' | 'caption' | 'mono';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  muted?: boolean;
}

export function Text({
  variant = 'body',
  muted = false,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        styles.base,
        variant !== 'body' && styles[variant],
        muted && styles.muted,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create(theme => ({
  base: {
    color: theme.colors.text,
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.md,
  },
  display: {
    fontFamily: theme.fontFamily.display,
    fontSize: theme.fontSize.display,
    color: theme.colors.textStrong,
  },
  title: {
    fontFamily: theme.fontFamily.extrabold,
    fontSize: theme.fontSize.xxl,
    color: theme.colors.textStrong,
  },
  caption: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  mono: {
    fontFamily: theme.fontFamily.mono,
  },
  muted: {
    color: theme.colors.textMuted,
  },
}));
