import { create } from 'zustand';
import { TRACKS, trackSource } from '../config/tracks';
import { audioController } from '../lib/audioController';

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
  selectTrack: (id: string) => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  stop: () => void;
  preloadAll: () => void;
}

const nameOf = (id: string): string => TRACKS.find((t) => t.id === id)?.name ?? id;

export const useAudioStore = create<AudioState>((set, get) => ({
  trackId: 'lofi',
  playing: false,
  volume: 40,
  started: false,

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
}));
