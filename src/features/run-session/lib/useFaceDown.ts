import { useEffect, useRef, useState } from 'react';
import { Sensors } from 'react-native-nitro-sensors';
import {
  DEFAULT_FACE_DOWN_CONFIG,
  initialFaceDownState,
  normalizedZ,
  reduceFaceDown,
  type FaceDownState,
} from '../model/faceDown';

export interface UseFaceDownResult {
  /** Telefon barqaror yuztuban yotibdi (hold + hysteresis o'tgan). */
  faceDown: boolean;
  /** Qurilmaда device-motion sensori mavjudmi (emulyatorда ko'pincha false). */
  isAvailable: boolean;
}

/**
 * Device-motion (gravity bilan) ni imperativ kuzatib, pure `reduceFaceDown`
 * orqali yuztuban holatni aniqlaydi. Faqat holat o'zgarganда React state yangilanadi
 * (har namunada re-render YO'Q). `enabled=false` bo'lsa kuzatishni to'xtatadi.
 */
export function useFaceDown(enabled: boolean, intervalMs = 250): UseFaceDownResult {
  const [faceDown, setFaceDown] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const stateRef = useRef<FaceDownState>(initialFaceDownState);

  useEffect(() => {
    stateRef.current = initialFaceDownState;
    setFaceDown(false);

    if (!enabled) return;

    let motion: ReturnType<typeof Sensors.createDeviceMotion> | undefined;
    try {
      motion = Sensors.createDeviceMotion();
    } catch {
      setIsAvailable(false);
      return;
    }
    if (!motion.isAvailable) {
      setIsAvailable(false);
      return;
    }
    setIsAvailable(true);

    try {
      motion.startObserving(
        { intervalMs },
        (reading) => {
          const nz = normalizedZ(reading.accelerationIncludingGravity);
          const next = reduceFaceDown(stateRef.current, nz, reading.timestampMs, DEFAULT_FACE_DOWN_CONFIG);
          if (next.faceDown !== stateRef.current.faceDown) {
            setFaceDown(next.faceDown);
          }
          stateRef.current = next;
        },
        () => {
          // sensor xatosi — jim o'tkazamiz (tap fallback ishlaydi)
        },
      );
    } catch {
      setIsAvailable(false);
    }

    return () => {
      try {
        if (motion?.isObserving) motion.stopObserving();
      } catch {
        // ignore
      }
      stateRef.current = initialFaceDownState;
    };
  }, [enabled, intervalMs]);

  return { faceDown, isAvailable };
}
