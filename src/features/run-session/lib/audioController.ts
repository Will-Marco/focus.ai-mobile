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
import { BELL_DURATION_S, renderBellPCM } from './bell';

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

/** Bell jaranglaganда ambient shuncha marta pasayadi (ducking). */
const DUCK_FACTOR = 0.35;
const DUCK_IN_MS = 220;
const DUCK_OUT_MS = 700;

/** Bell node'lari ambient'dan mustaqil — `stop()` uni kesib tashlamaydi. */
let bellBuffer: AudioBuffer | null = null;
let ducked = false;
/** Bell tugashini kutayotgan tozalash taymeri — ketma-ket jaranglarда qayta o'rnatiladi. */
let bellTimer: ReturnType<typeof setTimeout> | null = null;

/** Karnayga ketadigan haqiqiy gain — foydalanuvchi ovozi × trek kalibrovkasi. */
function targetGain(): number {
  return currentVolume * currentTrackGain;
}

/** Ducking hisobga olingan joriy ambient gain. */
function activeGain(): number {
  return ducked ? targetGain() * DUCK_FACTOR : targetGain();
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

/** Bell PCM'ini kontekst sample rate'iда bufferga solish (bir marta). */
function makeBellBuffer(c: Ctx): AudioBuffer | null {
  try {
    const sr = typeof c.sampleRate === 'number' && c.sampleRate > 0 ? c.sampleRate : 44100;
    const pcm = renderBellPCM(sr);
    const buf = c.createBuffer(1, pcm.length, sr);
    if (typeof buf.copyToChannel === 'function') buf.copyToChannel(pcm, 0);
    else buf.getChannelData(0).set(pcm);
    return buf;
  } catch {
    return null;
  }
}

/** Bell eshitilishi uchun ambient'ni silliq pasaytiradi. */
function duckAmbient(): void {
  if (!currentGain || isPaused || ducked) return;
  ducked = true;
  fadeTo(activeGain(), DUCK_IN_MS);
}

/** Bell tugagach ambient'ni asta qaytaradi. */
function unduckAmbient(): void {
  if (!ducked) return;
  ducked = false;
  if (!currentGain || isPaused) return;
  fadeTo(targetGain(), DUCK_OUT_MS);
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
      ducked = false; // yangi trek to'liq gain bilan boshlanadi

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
    if (!isPaused) setGain(activeGain()); // pauzaда ovozni ochib yubormaymiz
  },

  /** Bell buferini oldindan hisoblaydi — jarang paytida lag bo'lmasin (~200ms sintez). */
  async preloadBell(): Promise<void> {
    const c = ensureCtx();
    if (!c || bellBuffer) return;
    bellBuffer = makeBellBuffer(c);
  },

  /**
   * Yakunlash jarangi — ambient'ni vaqtincha pasaytirib (ducking) bir marta chaladi.
   * Ambient o'ynayotgan bo'lishi shart emas; `stop()` bell'ni kesmaydi.
   */
  async playBell(volume: number): Promise<boolean> {
    const m = mod();
    if (!m) return false;
    const c = ensureCtx();
    if (!c) return false;
    await configureSession(m);
    try {
      // Ambient bilan bir xil ehtiyot: iOS'да resume() fon thread'ida grafik
      // qurayotganда start() chaqirilsa SIGSEGV bo'ladi (M13 crash tarixi).
      if (c.state === 'suspended') {
        try {
          c.resume();
        } catch {
          // ignore
        }
        await waitUntilRunning(c);
      }
      if (!bellBuffer) bellBuffer = makeBellBuffer(c);
      if (!bellBuffer) return false;

      duckAmbient();

      const gain = c.createGain();
      gain.gain.value = volume;
      const src = c.createBufferSource();
      src.buffer = bellBuffer;
      src.connect(gain);
      gain.connect(c.destination);
      src.start();

      // Oldingi bell hali tugamagan bo'lsa uning tozalashi bu jarangni duck'dan
      // erta chiqarib yubormasin.
      if (bellTimer) clearTimeout(bellTimer);
      bellTimer = setTimeout(() => {
        bellTimer = null;
        try {
          src.disconnect();
        } catch {
          // ignore
        }
        try {
          gain.disconnect();
        } catch {
          // ignore
        }
        unduckAmbient();
      }, BELL_DURATION_S * 1000 + 150);

      return true;
    } catch {
      unduckAmbient();
      return false;
    }
  },

  async stop(): Promise<void> {
    isPaused = false;
    fadeTo(0, FADE_MS, stopCurrent);
  },
};
