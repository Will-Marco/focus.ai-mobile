import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  dotColor?: string;
}

/** Pill-shaped status chip (audio foni, holat). */
export function Chip({ label, dotColor }: ChipProps) {
  return (
    <View style={styles.chip}>
      {dotColor ? (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      ) : null}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create(theme => ({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    paddingVertical: theme.spacing(2),
    paddingHorizontal: theme.spacing(3.5),
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: 'flex-start',
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { fontSize: theme.fontSize.sm, color: theme.colors.text },
}));
