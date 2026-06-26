import React, { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { Screen, Text, Button } from '@shared/ui';
import {
  setThemePref,
  getStoredThemePref,
  type ThemePref,
} from '@shared/theme';

export function ProfileScreen() {
  const { t } = useTranslation();
  const [pref, setPref] = useState<ThemePref>(getStoredThemePref());

  const choose = (next: ThemePref) => {
    setThemePref(next);
    setPref(next);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="title">{t('profile.title')}</Text>
        <Text variant="caption">
          {t('profile.theme')}: {pref}
        </Text>
        <View style={styles.row}>
          <Button
            title={t('profile.themeLight')}
            variant={pref === 'light' ? 'primary' : 'secondary'}
            onPress={() => choose('light')}
          />
          <Button
            title={t('profile.themeDark')}
            variant={pref === 'dark' ? 'primary' : 'secondary'}
            onPress={() => choose('dark')}
          />
          <Button
            title={t('profile.themeSystem')}
            variant={pref === 'system' ? 'primary' : 'secondary'}
            onPress={() => choose('system')}
          />
        </View>
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
  row: {
    flexDirection: 'row',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
}));
