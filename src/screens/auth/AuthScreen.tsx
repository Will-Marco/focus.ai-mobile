import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { GoogleIcon, ProfileIcon, RadialGlow, Screen, TargetIcon, Text } from '@shared/ui';
import { useProfileStore } from '@entities/profile';
import { useAuthForm } from '@features/auth';
import { haptics } from '@shared/lib/haptics';

export function AuthScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const continueAsGuest = useProfileStore((s) => s.continueAsGuest);
  const { busy, errorKey, submitGoogle } = useAuthForm();

  const onGoogle = () => {
    haptics.light();
    submitGoogle();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <RadialGlow size={300} color={theme.colors.brandCoral} opacity={0.16} blur={34} style={styles.cornerGlow} />

      <View style={styles.content}>
        {/* Brand */}
        <View>
          <View style={styles.logoRow}>
            <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBox}>
              <TargetIcon size={24} color={theme.colors.onBrand} strokeWidth={2.4} />
            </LinearGradient>
            <Text style={styles.wordmark}>{t('app.name')}</Text>
          </View>
          <Text style={styles.title}>{t('auth.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
        </View>

        <View style={styles.spacer} />

        {/* Amallar — Google (asosiy) + Mehmon (ikkilamchi) */}
        <View style={styles.actions}>
          {errorKey ? <Text style={styles.error}>{t(errorKey)}</Text> : null}

          <Pressable accessibilityRole="button" onPress={onGoogle} disabled={busy} style={styles.googleBtn}>
            {busy ? (
              <ActivityIndicator color={theme.colors.textStrong} />
            ) : (
              <>
                <GoogleIcon size={20} />
                <Text style={styles.googleTxt}>{t('auth.continueGoogle')}</Text>
              </>
            )}
          </Pressable>

          <Pressable accessibilityRole="button" onPress={() => continueAsGuest()} disabled={busy} style={styles.guestBtn}>
            <ProfileIcon size={19} color={theme.colors.gold} />
            <Text style={styles.guestTxt}>{t('auth.guest')}</Text>
          </Pressable>

          <Text style={styles.footer}>{t('auth.guestFooter')}</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  cornerGlow: { position: 'absolute', right: -80, top: -40 },
  content: { flex: 1, paddingHorizontal: 26, paddingTop: 48, paddingBottom: 30 },

  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.brandCoral,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  wordmark: { fontSize: 20, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: theme.fontFamily.extrabold,
    color: theme.colors.textStrong,
    marginTop: 28,
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, lineHeight: 21, color: theme.colors.textMuted },

  spacer: { flex: 1 },

  actions: { gap: 12 },
  error: { fontSize: 13, color: theme.colors.gold, textAlign: 'center', marginBottom: 2 },

  googleBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleTxt: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },

  guestBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  guestTxt: { fontSize: 15, fontFamily: theme.fontFamily.semibold, color: theme.colors.textMuted },

  footer: { textAlign: 'center', fontSize: 12, lineHeight: 17, color: theme.colors.textDim, marginTop: 8 },
}));
