import React from 'react';
import { View, TextInput, type TextInputProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
}

export function Input({ label, style, ...rest }: InputProps) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.colors.textDim}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  wrap: { gap: theme.spacing(2) },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.fontFamily.bold,
  },
  input: {
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing(4),
    color: theme.colors.textStrong,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
  },
}));
