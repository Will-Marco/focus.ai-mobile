import React, { forwardRef, useState } from 'react';
import { Pressable, View, TextInput, type TextInputProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from './Text';
import { EyeIcon, EyeOffIcon } from './icons';

export interface InputProps extends TextInputProps {
  label?: string;
  /** true bo'lsa parolni ko'rsatish/yashirish ko'z ikonkasi qo'shiladi (secureTextEntry'ni o'zi boshqaradi). */
  passwordToggle?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function InputComponent(
  { label, style, passwordToggle, secureTextEntry, onFocus, onBlur, ...rest },
  ref,
) {
  const { theme } = useUnistyles();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (e) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur: NonNullable<TextInputProps['onBlur']> = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  if (passwordToggle) {
    return (
      <View style={styles.wrap}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={[styles.row, focused && styles.rowFocused]}>
          <TextInput
            ref={ref}
            placeholderTextColor={theme.colors.textDim}
            cursorColor={theme.colors.brand}
            selectionColor={theme.colors.brand}
            style={[styles.rowInput, style]}
            secureTextEntry={!visible}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? "Parolni yashirish" : "Parolni ko'rsatish"}
            hitSlop={10}
            onPress={() => setVisible((v) => !v)}
            style={styles.eyeBtn}
          >
            {visible ? (
              <EyeOffIcon size={20} color={theme.colors.textDim} />
            ) : (
              <EyeIcon size={20} color={theme.colors.textDim} />
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.colors.textDim}
        cursorColor={theme.colors.brand}
        selectionColor={theme.colors.brand}
        style={[styles.input, focused && styles.inputFocused, style]}
        secureTextEntry={secureTextEntry}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
    </View>
  );
});

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
  inputFocused: {
    borderColor: theme.colors.brand,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: theme.spacing(4),
  },
  rowFocused: {
    borderColor: theme.colors.brand,
  },
  rowInput: {
    flex: 1,
    height: '100%',
    color: theme.colors.textStrong,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fontFamily.regular,
  },
  eyeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
