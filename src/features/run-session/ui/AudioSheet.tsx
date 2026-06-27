import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
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

// Animated wrapper plain style (Unistyles emas — crash).
const SHEET_WRAP = { position: 'absolute', left: 0, right: 0, bottom: 0 } as const;
const BACKDROP = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,7,4,0.55)' } as const;
const BAR_BASE = { width: 4, borderRadius: 2 } as const;

// ⚠️ Mock — audio ijro M5 (track-player)da real ulanadi.
interface TrackDef {
  id: string;
  name: string;
  color: string;
  d: string;
}
const TRACKS: TrackDef[] = [
  { id: 'rain', name: "Yomg'ir", color: '#5FD0C5', d: 'M16 13a4 4 0 10-3.7-6 5 5 0 10-3.3 9h7M8 19l-1 2M12 19l-1 2M16 19l-1 2' },
  { id: 'lofi', name: 'Lo-fi', color: '#9A8CF0', d: 'M9 18V6l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zM19 16a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'ocean', name: 'Okean', color: '#3B9EF2', d: 'M2 7c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 13c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2' },
  { id: 'forest', name: "O'rmon", color: '#7FB069', d: 'M12 2L7 11h3l-3 6h10l-3-6h3zM12 17v5' },
  { id: 'fire', name: "O'choq", color: '#F2603E', d: 'M12 2c1 3-1 4.5-2 6.5s.5 4 2.5 4 3-2.5 1.5-5.5c2.5 1.5 4 4.5 4 7.5a6 6 0 11-12 0c0-3 2-5.5 3-7.5' },
  { id: 'white', name: 'Oq shovqin', color: '#F2C879', d: 'M4 12h2l2-7 4 18 3-14 2 6 3-3' },
];
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
  const [trackId, setTrackId] = useState('lofi');
  const [vol, setVol] = useState(40);
  const [playing, setPlaying] = useState(true);

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
        <LinearGradient colors={['#211710', '#17100a']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[styles.sheet, { height: sheetHeight }]}>
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
            <Pressable accessibilityRole="button" onPress={() => setPlaying((p) => !p)} style={styles.playWrap}>
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
            <VolumeSlider value={vol} onChange={setVol} />
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
                    setTrackId(tr.id);
                    setPlaying(true);
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
  const set = (x: number) => onChange(Math.max(0, Math.min(100, Math.round((x / w) * 100))));
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => set(e.nativeEvent.locationX),
      onPanResponderMove: (e) => set(e.nativeEvent.locationX),
    }),
  ).current;
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const fillW = (value / 100) * w;
  return (
    <View style={styles.slider} onLayout={onLayout} {...responder.panHandlers}>
      <View style={styles.sliderTrack} />
      <View style={[styles.sliderFill, { width: fillW }]} />
      <View style={[styles.sliderThumb, { left: fillW - 8 }]} />
    </View>
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
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginBottom: 18 },
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
  waveStatic: { width: 4, height: 7, borderRadius: 2, backgroundColor: '#5a4a3a' },
  playWrap: { borderRadius: 22, overflow: 'hidden' },
  playBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  volRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, paddingBottom: 18 },
  slider: { flex: 1, height: 24, justifyContent: 'center' },
  sliderTrack: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.12)' },
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
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  trackCardSel: { backgroundColor: 'rgba(242,162,76,0.14)' },
  trackIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  trackName: { fontSize: 12, fontFamily: theme.fontFamily.semibold, textAlign: 'center' },
  trackNameOn: { color: theme.colors.textStrong },
  trackNameOff: { color: theme.colors.textMuted },
}));
