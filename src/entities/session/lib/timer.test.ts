import {
  elapsedMs,
  isComplete,
  isRunning,
  msToMinutes,
  pauseSession,
  progress,
  remainingMs,
  resumeSession,
} from './timer';
import type { ActiveSession } from '../model/types';

const base: ActiveSession = {
  id: 's1',
  habitId: 'h1',
  targetMin: 45,
  accumulatedMs: 0,
  runningSince: 1_000_000,
  isForeground: true,
  startedAt: 1_000_000,
};

describe('elapsedMs', () => {
  it('running: accumulated + (now - runningSince)', () => {
    expect(elapsedMs({ ...base, accumulatedMs: 5_000, runningSince: 1_000_000 }, 1_003_000)).toBe(
      8_000,
    );
  });

  it('pauza (runningSince=null): faqat accumulated', () => {
    expect(elapsedMs({ ...base, accumulatedMs: 8_000, runningSince: null }, 9_999_999)).toBe(8_000);
  });

  it('hech qachon manfiy emas (soat orqaga ketsa ham)', () => {
    expect(elapsedMs({ ...base, accumulatedMs: 0, runningSince: 5_000 }, 4_000)).toBe(0);
  });
});

describe('pauseSession / resumeSession', () => {
  it("pause: o'tgan vaqtni accumulated ga ko'chiradi, runningSince=null", () => {
    const s = pauseSession({ ...base, accumulatedMs: 2_000, runningSince: 1_000_000 }, 1_005_000);
    expect(s.accumulatedMs).toBe(7_000);
    expect(s.runningSince).toBeNull();
  });

  it("pause idempotent: allaqachon pauzada bo'lsa o'zgarmaydi", () => {
    const paused = { ...base, accumulatedMs: 7_000, runningSince: null };
    expect(pauseSession(paused, 9_000)).toEqual(paused);
  });

  it('resume: runningSince=now, accumulated saqlanadi', () => {
    const s = resumeSession({ ...base, accumulatedMs: 7_000, runningSince: null }, 2_000_000);
    expect(s.runningSince).toBe(2_000_000);
    expect(s.accumulatedMs).toBe(7_000);
  });

  it("resume idempotent: allaqachon running bo'lsa o'zgarmaydi", () => {
    const running = { ...base, runningSince: 1_000_000 };
    expect(resumeSession(running, 5_000_000)).toEqual(running);
  });
});

describe('isRunning', () => {
  it('runningSince bor → true, null → false', () => {
    expect(isRunning(base)).toBe(true);
    expect(isRunning({ ...base, runningSince: null })).toBe(false);
  });
});

describe('progress', () => {
  it("elapsed / target, 0..1 oralig'ida", () => {
    expect(progress(45 * 60_000 * 0.5, 45)).toBeCloseTo(0.5);
  });

  it('maqsaddan oshsa 1 ga clamp (vizual oshmaydi)', () => {
    expect(progress(100 * 60_000, 45)).toBe(1);
  });

  it("target 0 bo'lsa 0 qaytaradi (nolga bo'lish yo'q)", () => {
    expect(progress(1000, 0)).toBe(0);
  });
});

describe('isComplete / remainingMs', () => {
  it('elapsed >= target → complete', () => {
    expect(isComplete(45 * 60_000, 45)).toBe(true);
    expect(isComplete(45 * 60_000 - 1, 45)).toBe(false);
  });

  it('qolgan vaqt, manfiy emas', () => {
    expect(remainingMs(10 * 60_000, 45)).toBe(35 * 60_000);
    expect(remainingMs(50 * 60_000, 45)).toBe(0);
  });
});

describe('msToMinutes', () => {
  it('eng yaqin daqiqaga yaxlitlaydi (finish uchun)', () => {
    expect(msToMinutes(89_000)).toBe(1); // 1.48 daq → 1
    expect(msToMinutes(90_000)).toBe(2); // 1.5 daq → 2
  });
});
