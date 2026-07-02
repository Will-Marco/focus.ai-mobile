import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { BlurMask, Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { GoogleIcon, ProfileIcon, ProgressRing, RadialBackground, RadialGlow, TargetIcon, Text } from '@shared/ui';
import { usePulse } from '@shared/lib/animation/usePulse';
import { haptics } from '@shared/lib/haptics';
import { useProfileStore } from '@entities/profile';
import { useAuthForm } from '@features/auth';

// Animated.View'ga Unistyles style BERMA (crash) — plain const [[reanimated-unistyles-conflict]].
const RING_GLOW = { position: 'absolute', width: 220, height: 220, alignItems: 'center', justifyContent: 'center' } as const;

export function AuthScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const continueAsGuest = useProfileStore((s) => s.continueAsGuest);
  const { busy, errorKey, submitGoogle } = useAuthForm();

  // breathe (ring 1↔1.02, 6s) + glowPulse (halo opacity .4↔.85, 3s) — ilova signature animatsiyasi.
  const breathe = usePulse(1, 1.02, 3000);
  const glow = usePulse(0.4, 0.85, 1500);
  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const onGoogle = () => {
    haptics.light();
    submitGoogle();
  };

  return (
    <View style={styles.root}>
      <RadialBackground colors={[...theme.colors.sessionBg]} positions={[0, 0.5, 1]} center={{ x: 0.5, y: 0.08 }} />
      <RadialGlow size={340} color={theme.colors.brand} blur={34} opacity={0.18} style={styles.topGlow} />

      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        {/* Hero — glow halo + breathe ring + markazda brand logo */}
        <View style={styles.content}>
          <View style={styles.ringWrap}>
            <Animated.View style={[RING_GLOW, glowStyle]} pointerEvents="none">
              <Canvas style={styles.ringGlowCanvas}>
                <Circle cx={110} cy={110} r={110}>
                  <RadialGradient c={vec(110, 110)} r={66} colors={['#F2B45A', 'rgba(242,180,90,0)']} />
                  <BlurMask blur={28} style="normal" />
                </Circle>
              </Canvas>
            </Animated.View>

            <Animated.View style={breatheStyle}>
              <ProgressRing size={180} strokeWidth={13} progress={1} animated animationDuration={1100} />
            </Animated.View>

            <View style={styles.center} pointerEvents="none">
              <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBox}>
                <TargetIcon size={34} color={theme.colors.onBrand} strokeWidth={2.4} />
              </LinearGradient>
            </View>
          </View>

          <Text style={styles.wordmark}>{t('app.name')}</Text>
          <Text style={styles.title}>{t('auth.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>
        </View>

        {/* Amallar — Google (asosiy oq pill) + Mehmon (ghost) */}
        <View style={styles.footer}>
          {errorKey ? <Text style={styles.error}>{t(errorKey)}</Text> : null}

          <Pressable accessibilityRole="button" onPress={onGoogle} disabled={busy} style={styles.googleBtn}>
            {busy ? (
              <ActivityIndicator color="#1f140b" />
            ) : (
              <>
                <GoogleIcon size={20} />
                <Text style={styles.googleTxt}>{t('auth.continueGoogle')}</Text>
              </>
            )}
          </Pressable>

          <Pressable accessibilityRole="button" onPress={() => continueAsGuest()} disabled={busy} style={styles.guestBtn}>
            <ProfileIcon size={18} color={theme.colors.gold} />
            <Text style={styles.guestTxt}>{t('auth.guest')}</Text>
          </Pressable>

          <Text style={styles.footerTxt}>{t('auth.guestFooter')}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1 },
  topGlow: { position: 'absolute', top: 90, alignSelf: 'center' },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  ringWrap: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 34 },
  ringGlowCanvas: { width: 220, height: 220 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
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
    fontSize: 29,
    lineHeight: 34,
    letterSpacing: -0.3,
    fontFamily: theme.fontFamily.extrabold,
    color: theme.colors.textStrong,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: { fontSize: 15, lineHeight: 22, color: theme.colors.textMuted, textAlign: 'center', maxWidth: 290 },

  footer: { paddingHorizontal: 26, paddingBottom: 34, gap: 12 },
  error: { fontSize: 13, color: theme.colors.gold, textAlign: 'center', marginBottom: 2 },

  googleBtn: {
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
  googleTxt: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: '#1f140b' },

  guestBtn: { height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  guestTxt: { fontSize: 15, fontFamily: theme.fontFamily.semibold, color: theme.colors.textMuted },

  footerTxt: { textAlign: 'center', fontSize: 12, lineHeight: 17, color: theme.colors.textDim, marginTop: 6 },
}));
