import { create } from 'zustand';
import { storage } from '@shared/lib/storage/mmkv';
import { TRACKS, trackSource } from '../config/tracks';
import { audioController } from '../lib/audioController';

/** Yakunlash jarangining balandligi — ambient slayderiga bog'liq emas (doim eshitilsin). */
const BELL_VOLUME = 0.7;

const BELL_KEY = 'session-bell-enabled';

/**
 * Audio Fon holati — AudioSheet va sessiya chip baham ko'radi. Sheet yopilganда
 * ham fon davom etadi (controller singleton). volume 0..100 (UI), controller 0..1.
 */
interface AudioState {
  trackId: string;
  playing: boolean;
  volume: number;
  /** Hech bo'lmaganda bir marta ijro boshlanganmi (resume vs play). */
  started: boolean;
  /** Maqsadga yetganда jarang chalinsinmi (MMKV'да saqlanadi). */
  bellEnabled: boolean;
  selectTrack: (id: string) => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  stop: () => void;
  preloadAll: () => void;
  toggleBell: () => void;
  /** Bell buferini oldindan tayyorlash (sessiya boshida). */
  primeBell: () => void;
  /** Sessiya maqsadga yetganда — bir marta jarang (o'chirilgan bo'lsa jim). */
  playCompletionBell: () => void;
}

const nameOf = (id: string): string => TRACKS.find((t) => t.id === id)?.name ?? id;

export const useAudioStore = create<AudioState>((set, get) => ({
  trackId: 'lofi',
  playing: false,
  volume: 40,
  started: false,
  bellEnabled: storage.getBoolean(BELL_KEY) ?? true,

  selectTrack: (id) => {
    set({ trackId: id, playing: true, started: true });
    audioController.play(id, nameOf(id), trackSource(id), get().volume / 100);
  },

  togglePlay: () => {
    const next = !get().playing;
    set({ playing: next });
    if (next) {
      if (get().started) {
        audioController.resume();
      } else {
        const { trackId, volume } = get();
        set({ started: true });
        audioController.play(trackId, nameOf(trackId), trackSource(trackId), volume / 100);
      }
    } else {
      audioController.pause();
    }
  },

  setVolume: (v) => {
    set({ volume: v });
    audioController.setVolume(v / 100);
  },

  stop: () => {
    set({ playing: false, started: false });
    audioController.stop();
  },

  /** Sheet ochilganда treklarni fonда ketma-ket decode qilib keshlaydi (kechikishni kamaytiradi). */
  preloadAll: () => {
    (async () => {
      for (const t of TRACKS) {
        await audioController.preload(t.id, trackSource(t.id));
      }
    })();
  },

  toggleBell: () => {
    const next = !get().bellEnabled;
    storage.set(BELL_KEY, next);
    set({ bellEnabled: next });
    // Yoqilganда darhol namuna chalamiz — qanday ovoz ekani sozlash paytiда bilinsin.
    if (next) audioController.playBell(BELL_VOLUME);
  },

  primeBell: () => {
    if (get().bellEnabled) audioController.preloadBell();
  },

  playCompletionBell: () => {
    if (!get().bellEnabled) return;
    audioController.playBell(BELL_VOLUME);
  },
}));
