/**
 * Audio Fon treklari — metadata (AudioSheet + sessiya chip baham ko'radi) + lokal manbalar.
 *
 * OFFLINE: audio fayllar app ichiga jamlanadi (`src/shared/assets/audio/<id>.mp3`).
 * Fayllar qo'shilgach `AUDIO_SOURCES` dagi mos `require` qatorini oching — qolgani avtomatik.
 * Manba yo'q trek ham tanlanadi (UI), lekin jim qoladi (controller no-op).
 */
export interface TrackDef {
  id: string;
  name: string;
  color: string;
  /** SVG ikonka path. */
  d: string;
}

export const TRACKS: TrackDef[] = [
  { id: 'rain', name: "Yomg'ir", color: '#5FD0C5', d: 'M16 13a4 4 0 10-3.7-6 5 5 0 10-3.3 9h7M8 19l-1 2M12 19l-1 2M16 19l-1 2' },
  { id: 'lofi', name: 'Lo-fi', color: '#9A8CF0', d: 'M9 18V6l10-2v12M9 18a3 3 0 11-6 0 3 3 0 016 0zM19 16a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'ocean', name: 'Okean', color: '#3B9EF2', d: 'M2 7c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 13c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2' },
  { id: 'forest', name: "O'rmon", color: '#7FB069', d: 'M12 2L7 11h3l-3 6h10l-3-6h3zM12 17v5' },
  { id: 'fire', name: "O'choq", color: '#F2603E', d: 'M12 2c1 3-1 4.5-2 6.5s.5 4 2.5 4 3-2.5 1.5-5.5c2.5 1.5 4 4.5 4 7.5a6 6 0 11-12 0c0-3 2-5.5 3-7.5' },
  { id: 'white', name: 'Oq shovqin', color: '#F2C879', d: 'M4 12h2l2-7 4 18 3-14 2 6 3-3' },
];

/**
 * Lokal audio manbalar (Metro `require` — asset id raqami). Fayl qo'shilgach qatorni oching.
 * `require(...)` (number) to'g'ridan-to'g'ri audio-api `decodeAudioData`ga beriladi.
 * Loop uchun ~30–120s seamless ambient kifoya (AudioBufferSourceNode.loop = true).
 */
export const AUDIO_SOURCES: Partial<Record<string, number>> = {
  rain: require('../../../shared/assets/audio/rain.mp3'),
  lofi: require('../../../shared/assets/audio/lofi.mp3'),
  ocean: require('../../../shared/assets/audio/ocean.mp3'),
  forest: require('../../../shared/assets/audio/forest.mp3'),
  fire: require('../../../shared/assets/audio/fire.mp3'),
  white: require('../../../shared/assets/audio/white.mp3'),
};

export function trackSource(id: string): number | undefined {
  return AUDIO_SOURCES[id];
}
