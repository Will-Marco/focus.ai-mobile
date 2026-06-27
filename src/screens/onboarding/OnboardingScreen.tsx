import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft, useAnimatedStyle } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Canvas, Circle, RadialGradient, vec, BlurMask } from '@shopify/react-native-skia';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { ProgressRing, RadialBackground, RadialGlow, Text } from '@shared/ui';
import { usePulse } from '@shared/lib/animation/usePulse';
import { haptics } from '@shared/lib/haptics';
import { useProfileStore } from '@entities/profile';

interface Slide {
  key: 'measure' | 'fill' | 'modes';
  ringProgress: number;
  center: string;
}

const SLIDES: Slide[] = [
  { key: 'measure', ringProgress: 0.62, center: '62%' },
  { key: 'fill', ringProgress: 1, center: '100%' },
  { key: 'modes', ringProgress: 1, center: '🌙' },
];

// Animated.View'ga Unistyles style BERMA (crash) — plain const inline.
const RING_GLOW = {
  position: 'absolute',
  width: 200,
  height: 200,
  alignItems: 'center',
  justifyContent: 'center',
} as const;

// Slayd kontenti uchun animatsion wrapper — content'ni to'liq qoplab markazlaydi
// (enter/exit absolute cross-slide uchun; plain — Unistyles emas).
const SLIDE_WRAP = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 34,
} as const;

export function OnboardingScreen() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);
  const [index, setIndex] = useState(0);

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const onNext = () => {
    if (isLast) {
      haptics.success();
      completeOnboarding();
    } else {
      haptics.light();
      setIndex((i) => i + 1);
    }
  };

  // breathe (ring 1↔1.02, 6s) + glowPulse (halo opacity .4↔.85, 3s)
  const breathe = usePulse(1, 1.02, 3000);
  const glow = usePulse(0.4, 0.85, 1500);
  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View style={styles.root}>
      <RadialBackground
        colors={[...theme.colors.sessionBg]}
        positions={[0, 0.5, 1]}
        center={{ x: 0.5, y: 0.08 }}
      />
      <RadialGlow size={340} color={theme.colors.brand} blur={34} opacity={0.18} style={styles.topGlow} />

      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={completeOnboarding} hitSlop={12} style={styles.skip}>
            <Text style={styles.skipTxt}>{t('onboarding.skip')}</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Animated.View
            key={slide.key}
            entering={FadeInRight.duration(420)}
            exiting={FadeOutLeft.duration(300)}
            style={SLIDE_WRAP}
          >
            <View style={styles.ringWrap}>
              <Animated.View style={[RING_GLOW, glowStyle]} pointerEvents="none">
                <Canvas style={styles.ringGlowCanvas}>
                  <Circle cx={100} cy={100} r={100}>
                    <RadialGradient c={vec(100, 100)} r={60} colors={['#F2B45A', 'rgba(242,180,90,0)']} />
                    <BlurMask blur={26} style="normal" />
                  </Circle>
                </Canvas>
              </Animated.View>

              <Animated.View style={breatheStyle}>
                <ProgressRing
                  size={168}
                  strokeWidth={12}
                  progress={slide.ringProgress}
                  animated
                  animationDuration={900}
                />
              </Animated.View>

              <View style={styles.center} pointerEvents="none">
                <Text variant="mono" style={styles.centerTxt}>
                  {slide.center}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>{t(`onboarding.slides.${slide.key}.title`)}</Text>
            <Text style={styles.body}>{t(`onboarding.slides.${slide.key}.body`)}</Text>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <View
                key={s.key}
                style={[
                  styles.dot,
                  { backgroundColor: i === index ? theme.colors.brand : theme.colors.border },
                  i === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={onNext} style={styles.ctaWrap}>
            <LinearGradient
              colors={[...theme.colors.gradientBrand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              <Text style={styles.ctaTxt}>{isLast ? t('onboarding.start') : t('onboarding.next')}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1 },
  topGlow: { position: 'absolute', top: 120, alignSelf: 'center' },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 18, paddingTop: 14 },
  skip: { paddingHorizontal: 12, paddingVertical: 8 },
  skipTxt: { fontSize: 14, fontFamily: theme.fontFamily.semibold, color: theme.colors.textMuted },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  ringWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  ringGlowCanvas: { width: 200, height: 200 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  centerTxt: { fontFamily: theme.fontFamily.monoSemibold, fontSize: 30, color: theme.colors.textStrong },

  title: {
    fontFamily: theme.fontFamily.extrabold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: theme.colors.textStrong,
    textAlign: 'center',
    marginBottom: 14,
  },
  body: { fontSize: 16, lineHeight: 24, color: theme.colors.textMuted, textAlign: 'center', maxWidth: 300 },

  footer: { paddingHorizontal: 28, paddingBottom: 38, gap: 22, alignItems: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 22 },
  ctaWrap: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: theme.colors.brandCoral,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  cta: { height: 56, alignItems: 'center', justifyContent: 'center' },
  ctaTxt: { fontFamily: theme.fontFamily.bold, fontSize: 16, color: theme.colors.onBrand },
}));
