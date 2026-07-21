/**
 * Audio Fon controller — react-native-audio-api (Web Audio uslubi, New Arch).
 * Lazy + guarded: native modul/fayl bo'lmasa jim no-op. Loop: AudioBufferSourceNode.loop.
 * Buferlar trek bo'yicha keshlanadi. Fade — JS interval bilan (gain.value qadamlab),
 * Web Audio automation (linearRamp) audio-api'да ishonchsiz bo'lgani uchun.
 */

type Ctx = any;
type SourceNode = any;
type GainNode = any;
type AudioBuffer = any;

import { trackGain } from '../config/tracks';

let api: any;
let triedRequire = false;

function mod(): any {
  if (!triedRequire) {
    triedRequire = true;
    try {
      api = require('react-native-audio-api');
    } catch {
      api = null;
    }
  }
  return api;
}

let ctx: Ctx | null = null;
let currentSource: SourceNode | null = null;
let currentGain: GainNode | null = null;
let currentVolume = 0.4;
/** Joriy trekning loudness kalibrovkasi (TRACK_GAIN) — setVolume'да ham qo'llanadi. */
let currentTrackGain = 1;
let isPaused = false;
let fadeTimer: ReturnType<typeof setInterval> | null = null;
const buffers = new Map<string, AudioBuffer>();

const FADE_MS = 450; // silliq kirib/chiqish

/** Karnayga ketadigan haqiqiy gain — foydalanuvchi ovozi × trek kalibrovkasi. */
function targetGain(): number {
  return currentVolume * currentTrackGain;
}

function clearFade(): void {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function setGain(v: number): void {
  try {
    if (currentGain) currentGain.gain.value = v;
  } catch {
    // ignore
  }
}

/** Gain'ni `target`ga `durMs`да qadamlab silliq olib boradi (klik yo'q). */
function fadeTo(target: number, durMs: number, onDone?: () => void): void {
  clearFade();
  if (!currentGain) {
    onDone?.();
    return;
  }
  let start = target;
  try {
    start = currentGain.gain.value;
  } catch {
    // ignore
  }
  const steps = Math.max(1, Math.round(durMs / 16));
  let i = 0;
  fadeTimer = setInterval(() => {
    i += 1;
    setGain(start + (target - start) * (i / steps));
    if (i >= steps) {
      clearFade();
      onDone?.();
    }
  }, 16);
}

let sessionConfigured = false;

/** Audio session'ni playback uchun faollashtiradi — Android'да audio focus, iOS'да category.
 *  Busiz AudioContext ishlaydi, lekin karnayga ovoz CHIQMAYDI. */
async function configureSession(m: any): Promise<void> {
  if (sessionConfigured) return;
  sessionConfigured = true;
  try {
    m.AudioManager?.setAudioSessionOptions?.({
      iosCategory: 'playback',
      iosMode: 'default',
      iosOptions: ['mixWithOthers'],
    });
    await m.AudioManager?.setAudioSessionActivity?.(true);
  } catch {
    // ignore
  }
}

/** `resume()` dan keyin AudioContext haqiqatan ishga tushishini kutadi (max ~600ms).
 *  Timeout'да ham davom etamiz — jim qolgani crash'дан yaxshiroq. */
async function waitUntilRunning(c: Ctx): Promise<void> {
  for (let i = 0; i < 60; i++) {
    try {
      if (c.state === 'running') return;
    } catch {
      return;
    }
    await new Promise<void>((r) => setTimeout(() => r(), 10));
  }
}

function ensureCtx(): Ctx | null {
  const m = mod();
  if (!m) return null;
  if (!ctx) {
    try {
      ctx = new m.AudioContext();
    } catch {
      ctx = null;
    }
  }
  return ctx;
}

function stopCurrent(): void {
  clearFade();
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      // ignore
    }
    try {
      currentSource.disconnect();
    } catch {
      // ignore
    }
    currentSource = null;
  }
  if (currentGain) {
    try {
      currentGain.disconnect();
    } catch {
      // ignore
    }
    currentGain = null;
  }
}

export const audioController = {
  /** Trekni oldindan decode qilib keshlaydi (ijro etmaydi) — birinchi play kechikmasin. */
  async preload(trackId: string, source: number | undefined): Promise<void> {
    const m = mod();
    if (!m || source == null || buffers.has(trackId)) return;
    try {
      buffers.set(trackId, await m.decodeAudioData(source));
    } catch {
      // ignore
    }
  },

  /** Trekni decode qilib loop bilan ijro etadi. volume: 0..1. Manba yo'q → false. */
  async play(trackId: string, _name: string, source: number | undefined, volume: number): Promise<boolean> {
    const m = mod();
    if (!m || source == null) return false;
    const c = ensureCtx();
    if (!c) return false;
    isPaused = false;
    await configureSession(m);
    try {
      // resume() ni await QILMA — audio-api'да promise hech qachon hal bo'lmaydi.
      // LEKIN iOS'да resume() fon thread'ida AudioEngine grafigini quradi va agar
      // shu paytда start() chaqirilsa, ikkala thread bitta NSMutableDictionary'ga
      // yozadi (thread-safe emas) → SIGSEGV. Shuning uchun promise o'rniga
      // `state` ni pollingда kutamiz (dekodlangan trek keshda bo'lsa await yo'q edi).
      if (c.state === 'suspended') {
        try {
          c.resume();
        } catch {
          // ignore
        }
        await waitUntilRunning(c);
      }
      stopCurrent();
      currentVolume = volume;
      currentTrackGain = trackGain(trackId);

      let buffer = buffers.get(trackId);
      if (!buffer) {
        buffer = await m.decodeAudioData(source);
        buffers.set(trackId, buffer);
      }

      const gain = c.createGain();
      gain.gain.value = volume * currentTrackGain;
      const src = c.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.connect(gain);
      gain.connect(c.destination);
      src.start();

      currentSource = src;
      currentGain = gain;
      return true;
    } catch {
      return false;
    }
  },

  /** Pause'dan keyin silliq qaytarish (manba jim ishlab turadi → klik yo'q). */
  async resume(): Promise<void> {
    isPaused = false;
    try {
      if (ctx?.state === 'suspended') ctx.resume();
    } catch {
      // ignore
    }
    fadeTo(targetGain(), FADE_MS);
  },

  /** Silliq so'ndirish (manbani to'xtatmaymiz — resume tez). */
  async pause(): Promise<void> {
    isPaused = true;
    fadeTo(0, FADE_MS);
  },

  async setVolume(volume: number): Promise<void> {
    currentVolume = volume;
    clearFade();
    if (!isPaused) setGain(targetGain()); // pauzaда ovozni ochib yubormaymiz
  },

  async stop(): Promise<void> {
    isPaused = false;
    fadeTo(0, FADE_MS, stopCurrent);
  },
};
