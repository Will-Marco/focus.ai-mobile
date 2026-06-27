import React from 'react';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from './Text';

export interface AvatarProps {
  name: string;
  size?: number;
}

/** Ism bosh harfi + brand gradient (rasm ixtiyoriy — MVP'da initial). */
export function Avatar({ name, size = 56 }: AvatarProps) {
  const { theme } = useUnistyles();
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <LinearGradient
      colors={[...theme.colors.gradientBrand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <View style={styles.inner}>
        <Text style={[styles.initial, { fontSize: size * 0.4, color: theme.colors.onBrand }]}>
          {initial}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  inner: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: theme.fontFamily.bold },
}));
