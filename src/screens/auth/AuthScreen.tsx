import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { BlurMask, Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { useMaskedInputProps } from 'react-native-mask-input';
import { Button, Input, ProfileIcon, ProgressRing, RadialBackground, RadialGlow, TargetIcon, Text } from '@shared/ui';
import { usePulse } from '@shared/lib/animation/usePulse';
import { haptics } from '@shared/lib/haptics';
import { isValidUzPhone } from '@shared/lib/phone/phone';
import { useProfileStore } from '@entities/profile';
import { usePhoneLogin, usePhoneRegister } from '@features/auth';

type Mode = 'register' | 'login';

// "90 123 45 67" — O'zbekiston mahalliy raqami (9 xona, 2-3-2-2 guruhlash).
const PHONE_MASK = [/\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, ' ', /\d/, /\d/];

// Animated.View'ga Unistyles style BERMA (crash) — plain const [[reanimated-unistyles-conflict]].
const RING_GLOW = { position: 'absolute', width: 160, height: 160, alignItems: 'center', justifyContent: 'center' } as const;

export function AuthScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const continueAsGuest = useProfileStore((s) => s.continueAsGuest);

  const [mode, setMode] = useState<Mode>('login');
  const [phone, setPhone] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const login = usePhoneLogin();
  const register = usePhoneRegister();

  // react-native-mask-input — cursor/selection'ni o'zi tabiiy tarzda boshqaradi (qo'lda
  // selection majburlash aynan "yozayotganda yo'qolib qolish" bugini keltirib chiqargan edi).
  const maskedPhoneProps = useMaskedInputProps({
    value: phone,
    onChangeText: (masked) => setPhone(masked),
    mask: PHONE_MASK,
  });

  // Klaviatura balandligini kuzatish — scroll pastki bo'sh joyini shunga qarab kengaytiramiz
  // (ba'zi qurilmalarda adjustResize yolg'iz yetarli emas — edge-to-edge bilan).
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates?.height ?? 0),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // breathe (ring 1↔1.02, 6s) + glowPulse (halo opacity .4↔.85, 3s) — ilova signature animatsiyasi.
  const breathe = usePulse(1, 1.02, 3000);
  const glow = usePulse(0.4, 0.85, 1500);
  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const busy = mode === 'login' ? login.busy : register.busy;
  const errorKey = mode === 'login' ? login.errorKey : register.errorKey;
  const isWaiting = mode === 'register' && register.step === 'waiting';
  const phoneInvalid = phoneTouched && phone.length > 0 && !isValidUzPhone(phone);

  const switchMode = () => {
    haptics.light();
    setMode((m) => (m === 'register' ? 'login' : 'register'));
    setPhoneTouched(false);
    login.clearError();
    register.cancel();
  };

  const onSubmit = () => {
    haptics.medium();
    if (mode === 'login') login.submit(phone, password);
    else register.submit(phone, password, confirmPassword);
  };

  const onGuest = () => {
    haptics.light();
    continueAsGuest();
  };

  return (
    <View style={styles.root}>
      <RadialBackground colors={[...theme.colors.sessionBg]} positions={[0, 0.5, 1]} center={{ x: 0.5, y: 0.08 }} />
      <RadialGlow size={340} color={theme.colors.brand} blur={34} opacity={0.18} style={styles.topGlow} />

      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scroll,
              keyboardHeight > 0 && { paddingBottom: theme.spacing(6) + keyboardHeight },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Hero — glow halo + breathe ring + markazda brand logo */}
            <View style={styles.hero}>
              <View style={styles.ringWrap}>
                <Animated.View style={[RING_GLOW, glowStyle]} pointerEvents="none">
                  <Canvas style={styles.ringGlowCanvas}>
                    <Circle cx={80} cy={80} r={80}>
                      <RadialGradient c={vec(80, 80)} r={48} colors={['#F2B45A', 'rgba(242,180,90,0)']} />
                      <BlurMask blur={22} style="normal" />
                    </Circle>
                  </Canvas>
                </Animated.View>

                <Animated.View style={breatheStyle}>
                  <ProgressRing size={130} strokeWidth={10} progress={1} animated animationDuration={1100} />
                </Animated.View>

                <View style={styles.center} pointerEvents="none">
                  <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBox}>
                    <TargetIcon size={26} color={theme.colors.onBrand} strokeWidth={2.4} />
                  </LinearGradient>
                </View>
              </View>

              <Text style={styles.wordmark}>{t('app.name')}</Text>
              <Text style={styles.title}>{t('auth.title')}</Text>
              <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
            </View>

            {/* Telegram tasdiqlash kutilmoqda */}
            {isWaiting ? (
              <View style={styles.waiting}>
                <ActivityIndicator size="large" color={theme.colors.brand} />
                <Text style={styles.waitingTitle}>{t('auth.phone.waitingTitle')}</Text>
                <Text style={styles.waitingBody}>{t('auth.phone.waitingBody')}</Text>
                {errorKey ? (
                  <Text style={styles.error} accessibilityRole="alert">
                    {t(errorKey)}
                  </Text>
                ) : null}
                <Button title={t('auth.phone.openBot')} onPress={register.openBot} />
                <Button title={t('common.cancel')} variant="ghost" onPress={register.cancel} />
                <Text style={styles.hint}>{t('auth.phone.waitingHint')}</Text>
              </View>
            ) : (
              // Odatiy auth forma — telefon + parol (+ tasdiqlash) inputlari, ro'yxatdan o'tish/kirish shu sahifada
              <View style={styles.form}>
                <View>
                  <Input
                    label={t('auth.phone.phoneLabel')}
                    accessibilityLabel={t('auth.phone.phoneLabel')}
                    {...maskedPhoneProps}
                    placeholder={t('auth.phone.phonePlaceholder')}
                    onBlur={() => setPhoneTouched(true)}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    editable={!busy}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                  {phoneInvalid ? (
                    <Text style={styles.fieldError} accessibilityRole="alert">
                      {t('auth.err.phone.invalid')}
                    </Text>
                  ) : null}
                </View>

                <Input
                  ref={passwordRef}
                  label={t('auth.phone.passwordLabel')}
                  accessibilityLabel={t('auth.phone.passwordLabel')}
                  placeholder={t('auth.phone.passwordPlaceholder')}
                  value={password}
                  onChangeText={setPassword}
                  passwordToggle
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  textContentType={mode === 'register' ? 'newPassword' : 'password'}
                  editable={!busy}
                  returnKeyType={mode === 'register' ? 'next' : 'done'}
                  blurOnSubmit={mode === 'login'}
                  onSubmitEditing={() => (mode === 'register' ? confirmRef.current?.focus() : onSubmit())}
                />

                {mode === 'register' ? (
                  <Input
                    ref={confirmRef}
                    label={t('auth.phone.confirmPasswordLabel')}
                    accessibilityLabel={t('auth.phone.confirmPasswordLabel')}
                    placeholder={t('auth.phone.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    passwordToggle
                    autoComplete="new-password"
                    textContentType="newPassword"
                    editable={!busy}
                    returnKeyType="done"
                    onSubmitEditing={onSubmit}
                  />
                ) : null}

                {errorKey ? (
                  <Text style={styles.error} accessibilityRole="alert">
                    {t(errorKey)}
                  </Text>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: busy, busy }}
                  onPress={onSubmit}
                  disabled={busy}
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
                >
                  {busy ? (
                    <ActivityIndicator color="#1f140b" />
                  ) : (
                    <Text style={styles.primaryTxt}>
                      {t(mode === 'login' ? 'auth.phone.loginButton' : 'auth.phone.registerButton')}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={switchMode}
                  hitSlop={8}
                  style={styles.phoneLinkBtn}
                >
                  <Text style={styles.phoneLink}>
                    {t(mode === 'login' ? 'auth.phone.switchToRegister' : 'auth.phone.switchToLogin')}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={onGuest}
                  disabled={busy}
                  style={({ pressed }) => [styles.guestBtn, pressed && styles.guestBtnPressed]}
                >
                  <ProfileIcon size={18} color={theme.colors.gold} />
                  <Text style={styles.guestTxt}>{t('auth.guest')}</Text>
                </Pressable>

                <Text style={styles.footerTxt}>{t('auth.guestFooter')}</Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1 },
  topGlow: { position: 'absolute', top: 90, alignSelf: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: theme.spacing(6) },

  hero: { alignItems: 'center', paddingHorizontal: 34, marginBottom: theme.spacing(6) },
  ringWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  ringGlowCanvas: { width: 160, height: 160 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.brandCoral,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  wordmark: { fontSize: 15, letterSpacing: 3, textTransform: 'uppercase', fontFamily: theme.fontFamily.bold, color: theme.colors.gold, marginBottom: 12 },
  title: {
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: -0.3,
    fontFamily: theme.fontFamily.extrabold,
    color: theme.colors.textStrong,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, lineHeight: 20, color: theme.colors.textMuted, textAlign: 'center', maxWidth: 290 },

  form: { paddingHorizontal: 26, gap: theme.spacing(4) },
  error: { fontSize: 13, color: theme.colors.gold, textAlign: 'center' },
  fieldError: { fontSize: 12, color: theme.colors.gold, marginTop: 6 },

  primaryBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primaryBtnPressed: { opacity: 0.85 },
  primaryTxt: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: '#1f140b' },

  guestBtn: { height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: theme.spacing(2) },
  guestBtnPressed: { opacity: 0.7 },
  guestTxt: { fontSize: 15, fontFamily: theme.fontFamily.semibold, color: theme.colors.textMuted },

  phoneLinkBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  phoneLink: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: theme.fontFamily.semibold,
    color: theme.colors.gold,
  },

  footerTxt: { textAlign: 'center', fontSize: 12, lineHeight: 17, color: theme.colors.textDim, marginTop: 6 },

  waiting: { alignItems: 'center', paddingHorizontal: 26, gap: theme.spacing(4) },
  waitingTitle: {
    fontSize: theme.fontSize.xl,
    fontFamily: theme.fontFamily.extrabold,
    color: theme.colors.textStrong,
    textAlign: 'center',
  },
  waitingBody: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  hint: { fontSize: 12, color: theme.colors.textDim, textAlign: 'center' },
}));
