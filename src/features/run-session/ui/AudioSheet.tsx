import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { PauseIcon, PlayIcon, Text } from '@shared/ui';
import { usePulse } from '@shared/lib/animation/usePulse';
import { haptics } from '@shared/lib/haptics';
import { TRACKS } from '../config/tracks';
import { useAudioStore } from '../model/audioStore';

// Animated wrapper plain style (Unistyles emas — crash).
const SHEET_WRAP = { position: 'absolute', left: 0, right: 0, bottom: 0 } as const;
const BACKDROP = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,7,4,0.55)' } as const;
const BAR_BASE = { width: 4, borderRadius: 2 } as const;

const WAVE = [
  { color: '#F2C879', dur: 450, max: 10 },
  { color: '#F2A24C', dur: 520, max: 17 },
  { color: '#F2C879', dur: 480, max: 13 },
  { color: '#F2603E', dur: 560, max: 21 },
  { color: '#F2A24C', dur: 500, max: 12 },
];

export interface AudioSheetProps {
  onClose: () => void;
}

export function AudioSheet({ onClose }: AudioSheetProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { height } = useWindowDimensions();
  const trackId = useAudioStore((s) => s.trackId);
  const vol = useAudioStore((s) => s.volume);
  const playing = useAudioStore((s) => s.playing);
  const selectTrack = useAudioStore((s) => s.selectTrack);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const setVolume = useAudioStore((s) => s.setVolume);
  const preloadAll = useAudioStore((s) => s.preloadAll);

  // Sheet ochilganда treklarni fonда oldindan decode qilib keshlaymiz.
  useEffect(() => {
    preloadAll();
  }, [preloadAll]);

  const cur = TRACKS.find((x) => x.id === trackId) ?? TRACKS[0];
  const sheetHeight = Math.min(600, height * 0.82);

  // Slide-up ochilish + pastga sudrab/silliq yopilish.
  const translateY = useSharedValue(sheetHeight);
  useEffect(() => {
    translateY.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [translateY]);
  const close = useCallback(() => {
    translateY.value = withTiming(sheetHeight, { duration: 240, easing: Easing.in(Easing.cubic) }, (fin) => {
      if (fin) runOnJS(onClose)();
    });
  }, [translateY, sheetHeight, onClose]);
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, sheetHeight], [1, 0], 'clamp'),
  }));
  const sheetPan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        translateY.value = withTiming(sheetHeight, { duration: 240, easing: Easing.in(Easing.cubic) }, (fin) => {
          if (fin) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  return (
    <View style={styles.overlay}>
      <Animated.View style={[BACKDROP, backdropStyle]}>
        <Pressable style={styles.flex1} onPress={close} accessibilityRole="button" accessibilityLabel="close" />
      </Animated.View>
      <Animated.View style={[SHEET_WRAP, sheetStyle]}>
        <LinearGradient colors={[...theme.colors.sheetBg]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[styles.sheet, { height: sheetHeight }]}>
          <GestureDetector gesture={sheetPan}>
            <View>
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.title}>{t('session.audioTitle')}</Text>
                <Pressable accessibilityRole="button" onPress={close} style={styles.close}>
                  <Text style={styles.closeTxt}>✕</Text>
                </Pressable>
              </View>
            </View>
          </GestureDetector>

          {/* now playing */}
          <View style={styles.nowPlaying}>
            <LinearGradient colors={[cur.color, '#F2603E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.npIcon}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1f140b" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d={cur.d} />
              </Svg>
            </LinearGradient>
            <View style={styles.flex1}>
              <Text style={styles.npName}>{cur.name}</Text>
              <Text style={styles.npState}>{playing ? t('session.audioPlaying') : t('session.audioPaused')}</Text>
            </View>
            <View style={styles.wave}>
              {playing
                ? WAVE.map((w, i) => <WaveBar key={i} color={w.color} dur={w.dur} max={w.max} />)
                : WAVE.map((_, i) => <View key={i} style={styles.waveStatic} />)}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                haptics.light();
                togglePlay();
              }}
              style={styles.playWrap}
            >
              <LinearGradient colors={[...theme.colors.gradientBrand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.playBtn}>
                {playing ? <PauseIcon size={18} color={theme.colors.onBrand} /> : <PlayIcon size={18} color={theme.colors.onBrand} />}
              </LinearGradient>
            </Pressable>
          </View>

          {/* volume */}
          <View style={styles.volRow}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M11 5L6 9H2v6h4l5 4zM16 9a4 4 0 010 6" />
            </Svg>
            <VolumeSlider value={vol} onChange={setVolume} />
            <Text variant="mono" style={styles.volTxt}>
              {vol}%
            </Text>
          </View>

          <Text style={styles.section}>{t('session.audioTracks')}</Text>
          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {TRACKS.map((tr) => {
              const sel = tr.id === trackId;
              return (
                <Pressable
                  key={tr.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  onPress={() => {
                    haptics.selection();
                    selectTrack(tr.id);
                  }}
                  style={[styles.trackCard, sel && styles.trackCardSel, sel && { borderColor: tr.color }]}
                >
                  <View style={[styles.trackIcon, sel && { backgroundColor: tr.color }]}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={sel ? '#1f140b' : tr.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d={tr.d} />
                    </Svg>
                  </View>
                  <Text style={[styles.trackName, sel ? styles.trackNameOn : styles.trackNameOff]}>{tr.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function WaveBar({ color, dur, max }: { color: string; dur: number; max: number }) {
  const h = usePulse(6, max, dur);
  const st = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[BAR_BASE, { backgroundColor: color }, st]} />;
}

function VolumeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [w, setW] = useState(1);
  const wRef = useRef(1);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const apply = useCallback((x: number) => {
    onChangeRef.current(Math.max(0, Math.min(100, Math.round((x / wRef.current) * 100))));
  }, []);
  // RNGH Pan — tap + ushlab-surish ishonchli (e.x slider'ga nisbatan), sheet gesture bilan konfliktsiz
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin((e) => runOnJS(apply)(e.x))
        .onUpdate((e) => runOnJS(apply)(e.x)),
    [apply],
  );
  const onLayout = (e: LayoutChangeEvent) => {
    wRef.current = e.nativeEvent.layout.width;
    setW(e.nativeEvent.layout.width);
  };
  const fillW = (value / 100) * w;
  return (
    <GestureDetector gesture={pan}>
      <View style={styles.slider} onLayout={onLayout}>
        <View style={styles.sliderTrack} pointerEvents="none" />
        <View style={[styles.sliderFill, { width: fillW }]} pointerEvents="none" />
        <View style={[styles.sliderThumb, { left: fillW - 8 }]} pointerEvents="none" />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create((theme) => ({
  flex1: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },

  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderColor: 'rgba(242,162,76,0.18)',
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 24,
  },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: `rgba(${theme.colors.trackRgb},0.18)`, alignSelf: 'center', marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontSize: 19, fontFamily: theme.fontFamily.extrabold, color: theme.colors.textStrong },
  close: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.colors.surfaceStrong, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 16, color: theme.colors.textMuted },

  nowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(242,162,76,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(242,162,76,0.26)',
    marginBottom: 14,
  },
  npIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  npName: { fontSize: 16, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  npState: { fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  wave: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 24, width: 40 },
  waveStatic: { width: 4, height: 7, borderRadius: 2, backgroundColor: theme.colors.textDim },
  playWrap: { borderRadius: 22, overflow: 'hidden' },
  playBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  volRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, paddingBottom: 18 },
  slider: { flex: 1, height: 24, justifyContent: 'center' },
  sliderTrack: { height: 5, borderRadius: 3, backgroundColor: `rgba(${theme.colors.trackRgb},0.12)` },
  sliderFill: { position: 'absolute', height: 5, borderRadius: 3, backgroundColor: theme.colors.brand },
  sliderThumb: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.goldSoft },
  volTxt: { fontFamily: theme.fontFamily.mono, fontSize: 13, color: theme.colors.goldSoft, width: 38, textAlign: 'right' },

  section: { fontSize: 12, letterSpacing: 0.7, color: theme.colors.textMuted, fontFamily: theme.fontFamily.bold, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trackCard: {
    width: '31%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    alignItems: 'center',
    gap: 9,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  trackCardSel: { backgroundColor: 'rgba(242,162,76,0.14)' },
  trackIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceStrong },
  trackName: { fontSize: 12, fontFamily: theme.fontFamily.semibold, textAlign: 'center' },
  trackNameOn: { color: theme.colors.textStrong },
  trackNameOff: { color: theme.colors.textMuted },
}));
