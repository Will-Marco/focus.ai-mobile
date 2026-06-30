import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { Button, GoogleIcon, Input, ProfileIcon, RadialGlow, Screen, TargetIcon, Text } from '@shared/ui';
import { useProfileStore } from '@entities/profile';
import { useAuthForm } from '@features/auth';
import { haptics } from '@shared/lib/haptics';

type Mode = 'signin' | 'signup';

export function AuthScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const continueAsGuest = useProfileStore((s) => s.continueAsGuest);
  const { busy, errorKey, clearError, submitEmail, submitGoogle } = useAuthForm();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isSignin = mode === 'signin';
  const shownError = localError ?? errorKey;

  const onSubmitEmail = () => {
    if (!email.includes('@') || password.length < 6) {
      clearError();
      setLocalError('auth.err.invalid');
      return;
    }
    setLocalError(null);
    haptics.light();
    submitEmail(mode, email, password);
  };

  const onGoogle = () => {
    setLocalError(null);
    haptics.light();
    submitGoogle();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <RadialGlow
        size={300}
        color={theme.colors.brandCoral}
        opacity={0.16}
        blur={34}
        style={styles.cornerGlow}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View style={styles.logoRow}>
            <LinearGradient
              colors={[...theme.colors.gradientBrand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <TargetIcon size={24} color={theme.colors.onBrand} strokeWidth={2.4} />
            </LinearGradient>
            <Text style={styles.wordmark}>{t('app.name')}</Text>
          </View>

          <Text style={styles.title}>{isSignin ? t('auth.signinTitle') : t('auth.signupTitle')}</Text>
          <Text style={styles.subtitle}>{isSignin ? t('auth.signinSub') : t('auth.signupSub')}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isSignin ? (
            <Pressable accessibilityRole="button" onPress={() => setLocalError('auth.err.resetSoon')} hitSlop={8}>
              <Text style={styles.forgot}>{t('auth.forgot')}</Text>
            </Pressable>
          ) : null}

          {shownError ? <Text style={styles.soon}>{t(shownError)}</Text> : null}

          <Button
            title={busy ? t('auth.loading') : isSignin ? t('auth.signIn') : t('auth.signUp')}
            onPress={onSubmitEmail}
            disabled={busy}
            style={styles.cta}
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
            hitSlop={8}
          >
            <Text style={styles.switch}>
              {isSignin ? t('auth.switchToSignupText') : t('auth.switchToSigninText')}{' '}
              <Text style={styles.switchCta}>
                {isSignin ? t('auth.switchToSignupCta') : t('auth.switchToSigninCta')}
              </Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>{t('auth.or')}</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onGoogle}
          disabled={busy}
          style={[styles.guestBtn, styles.googleBtn]}
        >
          <GoogleIcon size={20} />
          <Text style={styles.guestTxt}>{t('auth.continueGoogle')}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => continueAsGuest()}
          style={styles.guestBtn}
        >
          <ProfileIcon size={20} color={theme.colors.gold} />
          <Text style={styles.guestTxt}>{t('auth.guest')}</Text>
        </Pressable>

        <Text style={styles.footer}>{t('auth.guestFooter')}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  cornerGlow: { position: 'absolute', right: -80, top: -40 },
  content: { paddingHorizontal: 26, paddingTop: 40, paddingBottom: 30 },

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
    lineHeight: 32,
    fontFamily: theme.fontFamily.extrabold,
    color: theme.colors.textStrong,
    marginTop: 24,
    marginBottom: 6,
  },
  subtitle: { fontSize: 15, color: theme.colors.textMuted, marginBottom: 26 },

  form: { gap: 14 },
  forgot: { textAlign: 'right', fontSize: 13, fontFamily: theme.fontFamily.semibold, color: theme.colors.gold },
  soon: { fontSize: 13, color: theme.colors.gold, textAlign: 'center' },
  cta: { marginTop: 4 },
  switch: { textAlign: 'center', fontSize: 14, color: theme.colors.textMuted, marginTop: 2 },
  switchCta: { color: theme.colors.gold, fontFamily: theme.fontFamily.bold },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  or: { fontSize: 12, color: theme.colors.textDim },

  guestBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleBtn: { marginBottom: 12 },
  guestTxt: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  footer: { textAlign: 'center', fontSize: 12, lineHeight: 17, color: theme.colors.textDim, marginTop: 14 },
}));
