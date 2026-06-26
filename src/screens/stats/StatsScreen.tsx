import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { Screen, Text } from '@shared/ui';

export function StatsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="title">{t('stats.title')}</Text>
        <Text variant="caption">{t('stats.empty')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(3),
    padding: theme.spacing(5),
  },
}));
