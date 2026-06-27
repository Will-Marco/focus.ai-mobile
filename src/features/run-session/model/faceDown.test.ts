import {
  DEFAULT_FACE_DOWN_CONFIG,
  initialFaceDownState,
  normalizedZ,
  reduceFaceDown,
  type FaceDownState,
} from './faceDown';

describe('normalizedZ', () => {
  it('yuztuban (gravity -z) → ~ -1', () => {
    expect(normalizedZ({ x: 0, y: 0, z: -9.81 })).toBeCloseTo(-1, 5);
  });

  it('yuztepa (gravity +z) → ~ +1', () => {
    expect(normalizedZ({ x: 0, y: 0, z: 9.81 })).toBeCloseTo(1, 5);
  });

  it('tik (gravity y o\'qда) → ~ 0', () => {
    expect(normalizedZ({ x: 0, y: 9.81, z: 0 })).toBeCloseTo(0, 5);
  });

  it('nol vektor → 0 (NaN emas)', () => {
    expect(normalizedZ({ x: 0, y: 0, z: 0 })).toBe(0);
  });

  it('birlik shartmas — har qanday kattalikда normallashtiradi (g birligi)', () => {
    expect(normalizedZ({ x: 0, y: 0, z: -1 })).toBeCloseTo(-1, 5);
  });
});

describe('reduceFaceDown', () => {
  const cfg = DEFAULT_FACE_DOWN_CONFIG;

  it('hold tugamaguncha trigger qilmaydi', () => {
    let s: FaceDownState = initialFaceDownState;
    s = reduceFaceDown(s, -0.95, 0, cfg);
    expect(s.faceDown).toBe(false);
    s = reduceFaceDown(s, -0.95, cfg.holdMs - 1, cfg);
    expect(s.faceDown).toBe(false);
  });

  it('hold (holdMs) o\'tgach face-down', () => {
    let s: FaceDownState = initialFaceDownState;
    s = reduceFaceDown(s, -0.95, 0, cfg);
    s = reduceFaceDown(s, -0.95, cfg.holdMs, cfg);
    expect(s.faceDown).toBe(true);
  });

  it('hold davomida ko\'tarilsa candidate bekor bo\'ladi', () => {
    let s: FaceDownState = initialFaceDownState;
    s = reduceFaceDown(s, -0.95, 0, cfg);
    expect(s.candidateSince).toBe(0);
    s = reduceFaceDown(s, 0.2, 500, cfg); // ko'tarildi
    expect(s.candidateSince).toBeNull();
    s = reduceFaceDown(s, -0.95, 600, cfg); // qayta boshlandi
    expect(s.candidateSince).toBe(600);
    expect(s.faceDown).toBe(false);
  });

  it('face-down holatda — hysteresis: exitThreshold ustiga chiqmaguncha qoladi', () => {
    let s: FaceDownState = { faceDown: true, candidateSince: null };
    // enter(-0.8) va exit(-0.55) orasida — qoladi
    s = reduceFaceDown(s, -0.7, 5000, cfg);
    expect(s.faceDown).toBe(true);
  });

  it('ko\'tarilsa (exitThreshold ustiga) darhol chiqadi', () => {
    let s: FaceDownState = { faceDown: true, candidateSince: null };
    s = reduceFaceDown(s, -0.4, 5000, cfg);
    expect(s.faceDown).toBe(false);
  });

  it('idempotent emas — pure: kirish state o\'zgarmaydi', () => {
    const s0: FaceDownState = initialFaceDownState;
    reduceFaceDown(s0, -0.95, 0, cfg);
    expect(s0).toEqual({ faceDown: false, candidateSince: null });
  });
});
