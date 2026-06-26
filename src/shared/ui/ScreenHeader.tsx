import React from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Text } from './Text';
import { ChevronLeftIcon } from './icons';

export interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

/** Orqaga tugma + sarlavha (modal/stack ekranlari uchun). */
export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  const { theme } = useUnistyles();
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="back"
          onPress={onBack}
          style={styles.back}
        >
          <ChevronLeftIcon size={24} color={theme.colors.textStrong} />
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <Text variant="title" style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.back}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
    gap: theme.spacing(2),
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: theme.fontSize.xl },
}));
