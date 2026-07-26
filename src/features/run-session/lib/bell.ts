/**
 * Yakunlash jarangi (bell) — PCM sintezi, sof funksiya.
 *
 * NEGA sintez, mp3 emas: qo'ng'iroq ovozi fizik jihatdan juda sodda —
 * so'nuvchi sinus qismlarining (partial) yig'indisi. Shu sabab uni kodда
 * hosil qilish ambient treklardan farqli o'laroq sifatда yutqazmaydi, lekin
 * beradi: (a) bundle 0 KB o'smaydi, (b) litsenziya masalasi yo'q,
 * (c) ohang/davomiylik kodда sozlanadi, (d) test qilinadi.
 *
 * Model: bitta zarba, eksponensial so'nuvchi **sof sinus** (880 Hz, 1s).
 * Ustki qismlar (partial) jadvali qoldirilgan — kerak bo'lsa kosa/metall
 * tembriga qaytish uchun qator qo'shish kifoya.
 */

/** Umumiy davomiylik (soniya) — buferning uzunligi. */
export const BELL_DURATION_S = 1.0;

/** Zarbaning o'tkirligini yumshatadi (klik ham yo'q). */
const ATTACK_S = 0.012;

/** Fundamental qismning so'nish vaqt-konstantasi (soniya). */
const TAU_BASE = 0.33;

/** Yuqori qismlar qanchalik tezroq so'nadi (0 = bir xil). Katta qiymat — mayinroq. */
const DECAY_TILT = 0.8;

/** Bufer oxiridagi klikni yo'qotuvchi cosine fade — dum tabiiy so'nsin. */
const TAIL_FADE_S = 0.15;

/** Yakuniy peak (headroom qoldiramiz — ambient ustiga qo'shiladi). */
const PEAK = 0.8;

/** Qismlar: chastota nisbati + boshlang'ich amplituda.
 *  Hozir **sof sinus** (ustki qismsiz) — ustki qismlar ovozni "qo'pol" metall
 *  qilgani uchun olib tashlandi. Jadval saqlanadi: kerak bo'lsa qator qo'shiladi. */
const PARTIALS: ReadonlyArray<{ ratio: number; amp: number }> = [{ ratio: 1.0, amp: 1.0 }];

/** Zarbalar: vaqt (s), fundamental (Hz), kuch. Bitta zarba, ingichka baland ohang. */
export const STRIKES: ReadonlyArray<{ at: number; fund: number; amp: number }> = [{ at: 0, fund: 880, amp: 1.0 }];

/**
 * Bell'ning mono PCM namunalarini hosil qiladi (−1..1 oralig'ida).
 * Sof: bir xil `sampleRate` uchun har doim bir xil natija.
 */
export function renderBellPCM(sampleRate: number): Float32Array {
  const n = Math.round(BELL_DURATION_S * sampleRate);
  const out = new Float32Array(n);

  for (const strike of STRIKES) {
    const start = Math.round(strike.at * sampleRate);
    for (const p of PARTIALS) {
      const omega = 2 * Math.PI * strike.fund * p.ratio;
      const tau = TAU_BASE / (1 + DECAY_TILT * (p.ratio - 1));
      const gain = strike.amp * p.amp;
      for (let i = start; i < n; i++) {
        const t = (i - start) / sampleRate;
        const attack = t < ATTACK_S ? t / ATTACK_S : 1;
        out[i] += gain * attack * Math.exp(-t / tau) * Math.sin(omega * t);
      }
    }
  }

  // Dumdagi silliq so'nish — bufer tugaganда klik eshitilmasin.
  const fadeLen = Math.min(n, Math.round(TAIL_FADE_S * sampleRate));
  for (let i = 0; i < fadeLen; i++) {
    const idx = n - fadeLen + i;
    out[idx] *= 0.5 * (1 + Math.cos((Math.PI * i) / fadeLen));
  }

  // Peak normalizatsiya — qismlar yig'indisi 1 dan oshishi mumkin.
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.abs(out[i]);
    if (a > peak) peak = a;
  }
  if (peak > 0) {
    const k = PEAK / peak;
    for (let i = 0; i < n; i++) out[i] *= k;
  }

  return out;
}
