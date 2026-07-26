import { BELL_DURATION_S, renderBellPCM, STRIKES } from './bell';

const SR = 44100;

/** [from, to) oralig'idagi RMS. */
function rms(pcm: Float32Array, from: number, to: number): number {
  let sum = 0;
  for (let i = from; i < to; i++) sum += pcm[i] * pcm[i];
  return Math.sqrt(sum / Math.max(1, to - from));
}

describe('renderBellPCM', () => {
  it("sample rate'ga qarab to'g'ri uzunlik beradi", () => {
    expect(renderBellPCM(SR)).toHaveLength(Math.round(BELL_DURATION_S * SR));
    expect(renderBellPCM(48000)).toHaveLength(Math.round(BELL_DURATION_S * 48000));
  });

  it('clipping qilmaydi, lekin jim ham emas', () => {
    const pcm = renderBellPCM(SR);
    let peak = 0;
    for (let i = 0; i < pcm.length; i++) peak = Math.max(peak, Math.abs(pcm[i]));
    expect(peak).toBeLessThanOrEqual(1);
    expect(peak).toBeGreaterThan(0.5);
  });

  it('NaN/Infinity chiqarmaydi', () => {
    const pcm = renderBellPCM(SR);
    for (let i = 0; i < pcm.length; i++) expect(Number.isFinite(pcm[i])).toBe(true);
  });

  it("boshi va oxiri nolda — klik yo'q", () => {
    const pcm = renderBellPCM(SR);
    expect(Math.abs(pcm[0])).toBeLessThan(1e-6);
    expect(Math.abs(pcm[pcm.length - 1])).toBeLessThan(1e-6);
  });

  it("so'nadi: boshidagi energiya oxiridagidan ancha katta", () => {
    const pcm = renderBellPCM(SR);
    const head = rms(pcm, 0, Math.round(0.1 * SR));
    const tail = rms(pcm, pcm.length - Math.round(0.1 * SR), pcm.length);
    expect(head).toBeGreaterThan(tail * 10);
  });

  it('bitta zarba — energiya faqat kamayib boradi', () => {
    expect(STRIKES).toHaveLength(1);
    const pcm = renderBellPCM(SR);
    const win = Math.round(0.25 * SR);
    let prev = Infinity;
    for (let from = 0; from + win <= pcm.length; from += win) {
      const cur = rms(pcm, from, from + win);
      expect(cur).toBeLessThan(prev);
      prev = cur;
    }
  });

  it('deterministik — bir xil kirish, bir xil natija', () => {
    const a = renderBellPCM(SR);
    const b = renderBellPCM(SR);
    expect(a[1000]).toBe(b[1000]);
    expect(a[50_000]).toBe(b[50_000]);
  });
});
