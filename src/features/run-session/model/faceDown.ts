/**
 * Face-down (yuztuban) detektor — pure logic, TDD.
 *
 * Manba: device-motion `accelerationIncludingGravity` (gravity bilan). Telefon
 * yuztuban yotsa gravity ekranga qaraydi → normallashtirilgan z ≈ -1.
 * Hysteresis (enter/exit) + hold (tasodifiy tebranishlarni filtrlaydi).
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface FaceDownConfig {
  /** Face-down KIRISH chegarasi (normallashtirilgan z, ekran past). */
  enterThreshold: number;
  /** CHIQISH chegarasi (hysteresis — kirishdan yuqori, jittersiz). */
  exitThreshold: number;
  /** Trigger oldidan barqaror ushlab turish (ms). */
  holdMs: number;
}

export const DEFAULT_FACE_DOWN_CONFIG: FaceDownConfig = {
  enterThreshold: -0.8,
  exitThreshold: -0.55,
  holdMs: 1200,
};

export interface FaceDownState {
  faceDown: boolean;
  /** enterThreshold ostida birinchi marta ko'rilgan vaqt (ms), yoki null. */
  candidateSince: number | null;
}

export const initialFaceDownState: FaceDownState = {
  faceDown: false,
  candidateSince: null,
};

/** Vektorning normallashtirilgan z komponenti (z / |v|); nol vektorда 0. */
export function normalizedZ(v: Vec3): number {
  const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (mag === 0) return 0;
  return v.z / mag;
}

/**
 * Pure reducer — normallashtirilgan z namunasini `nowMs` vaqtда qabul qilib
 * yangi holatni qaytaradi. Kirish holatini o'zgartirmaydi.
 */
export function reduceFaceDown(
  state: FaceDownState,
  nz: number,
  nowMs: number,
  cfg: FaceDownConfig = DEFAULT_FACE_DOWN_CONFIG,
): FaceDownState {
  if (!state.faceDown) {
    if (nz <= cfg.enterThreshold) {
      const since = state.candidateSince ?? nowMs;
      if (nowMs - since >= cfg.holdMs) {
        return { faceDown: true, candidateSince: null };
      }
      return { faceDown: false, candidateSince: since };
    }
    // chegaradan chiqdi — candidate bekor
    return state.candidateSince === null ? state : { ...state, candidateSince: null };
  }

  // face-down holatда — faqat exitThreshold ustiga chiqsa chiqadi (hysteresis)
  if (nz >= cfg.exitThreshold) {
    return { faceDown: false, candidateSince: null };
  }
  return state;
}
