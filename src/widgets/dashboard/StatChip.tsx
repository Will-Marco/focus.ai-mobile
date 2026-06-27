import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from '@shared/ui';

export interface StatChipProps {
  value: string;
  unit?: string;
  dotColor: string;
  label: string;
}

// Dashboard stat chip (dizayn): katta mono raqam + unit yuqorida, dot + label pastda.
export function StatChip({ value, unit, dotColor, label }: StatChipProps) {
  return (
    <View style={styles.chip}>
      <Text variant="mono" style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <View style={styles.labelRow}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  chip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  value: {
    fontFamily: theme.fontFamily.monoSemibold,
    fontSize: 22,
    color: theme.colors.textStrong,
  },
  unit: { fontFamily: theme.fontFamily.mono, fontSize: 13, color: theme.colors.textMuted },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 12, color: theme.colors.textMuted },
}));
