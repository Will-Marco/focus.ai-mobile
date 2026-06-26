import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { Screen, Text, ProgressRing } from '@shared/ui';

export function DashboardScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="title">{t('dashboard.title')}</Text>
        <ProgressRing size={200} strokeWidth={16} progress={0.62} />
        <Text variant="caption">{t('dashboard.empty')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(4),
    padding: theme.spacing(5),
  },
}));
