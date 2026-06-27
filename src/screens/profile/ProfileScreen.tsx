import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar, Button, Screen, Segmented, Text } from '@shared/ui';
import { setThemePref, getStoredThemePref, type ThemePref } from '@shared/theme';
import { useProfileStore } from '@entities/profile';
import type { RootStackParamList } from '@shared/config/navigation';

export function ProfileScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfileStore((s) => s.profile);
  const updateName = useProfileStore((s) => s.updateName);
  const signOut = useProfileStore((s) => s.signOut);

  const [pref, setPref] = useState<ThemePref>(getStoredThemePref());
  const [name, setName] = useState(profile?.name ?? '');

  const choose = (next: ThemePref) => {
    setThemePref(next);
    setPref(next);
  };

  const isGuest = profile?.authMode !== 'registered';

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <Avatar name={name || '?'} size={88} />
          <TextInput
            value={name}
            onChangeText={setName}
            onEndEditing={() => updateName(name)}
            placeholder={t('profile.namePlaceholder')}
            placeholderTextColor={theme.colors.textDim}
            maxLength={40}
            style={styles.nameInput}
            textAlign="center"
          />
          <Text style={styles.sub}>
            {isGuest ? t('profile.guestMode') : t('profile.registered')}
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.section}>{t('profile.theme')}</Text>
          <Segmented
            value={pref}
            onChange={choose}
            options={[
              { value: 'light', label: t('profile.themeLight') },
              { value: 'dark', label: t('profile.themeDark') },
              { value: 'system', label: t('profile.themeSystem') },
            ]}
          />
        </View>

        <View style={styles.card}>
          <Row label={t('profile.language')} value={t('profile.languageValue')} />
          <Row
            label={t('profile.notifications')}
            value={t('profile.notificationsValue')}
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <Row
            label={t('profile.quietHours')}
            value={t('profile.quietHoursValue')}
            onPress={() => navigation.navigate('NotificationSettings')}
            last
          />
        </View>

        <Button
          variant="danger"
          title={isGuest ? t('profile.signIn') : t('profile.signOut')}
          onPress={signOut}
        />
      </ScrollView>
    </Screen>
  );
}

function Row({
  label,
  value,
  last,
  onPress,
}: {
  label: string;
  value: string;
  last?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>
        <Text style={styles.rowChevron}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 20, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong },

  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: theme.spacing(8), gap: 22 },

  identity: { alignItems: 'center', gap: 12, paddingVertical: 10 },
  nameInput: {
    fontFamily: theme.fontFamily.extrabold,
    fontSize: 21,
    color: theme.colors.textStrong,
    padding: 0,
    minWidth: 120,
  },
  sub: { fontSize: 13, color: theme.colors.textMuted },

  block: { gap: 10 },
  section: { fontSize: 13, color: theme.colors.textMuted, fontFamily: theme.fontFamily.bold },

  card: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 15, color: theme.colors.textStrong },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14, color: theme.colors.textMuted },
  rowChevron: { fontSize: 18, color: theme.colors.textMuted },
}));
