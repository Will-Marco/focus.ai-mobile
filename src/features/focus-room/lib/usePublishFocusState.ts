import { useEffect, useRef } from 'react';
import { sessionRepo, useSessionStore } from '@entities/session';
import { useHabitStore } from '@entities/habit';
import { useProfileStore } from '@entities/profile';
import { isSupabaseConfigured } from '@shared/config/env';
import { addDays, startOfDay } from '@shared/lib/time/day';
import { focusStateRepo } from '../api/focusStateRepo';

/**
 * O'z fokus holatimni serverга yozib turadi — **app qatlamida bir marta**.
 *
 * NEGA app qatlamida: guruh ekrani ochiq bo'lishiga bog'lab qo'yilsa, sessiya
 * ekranida yoki Away rejimida turgan odam guruhdoshlariga ko'rinmay qoladi —
 * ya'ni eng tabiiy holat ishlamaydi. Yozuv sessiya boshlanishi/pauza/yakunда
 * bo'ladi (sekundlik timer emas): ko'ruvchi qolgan vaqtni `runningSince` dan
 * o'zi hisoblaydi, shuning uchun tez-tez yozish shart emas.
 */
export function usePublishFocusState(): void {
  const active = useSessionStore((s) => s.active);
  const habits = useHabitStore((s) => s.habits);
  const name = useProfileStore((s) => s.profile?.name) ?? 'Men';
  const isRegistered = useProfileStore((s) => s.profile?.authMode === 'registered');

  const fg = active.find((s) => s.isForeground) ?? active[0] ?? null;
  const habitName = fg ? habits.find((h) => h.id === fg.habitId)?.name : undefined;

  // Oxirgi yozilgan holat — bir xil qiymatni qayta-qayta yubormaslik uchun.
  const lastRef = useRef<string>('');

  useEffect(() => {
    if (!isSupabaseConfigured || !isRegistered) return;
    let cancelled = false;

    (async () => {
      if (!fg) {
        if (lastRef.current === 'none') return;
        lastRef.current = 'none';
        await focusStateRepo.clear();
        return;
      }
      const key = `${fg.id}:${fg.accumulatedMs}:${fg.runningSince ?? 'p'}:${habitName ?? ''}`;
      if (lastRef.current === key || cancelled) return;
      lastRef.current = key;

      // Bugungi yakunlangan jami fokus — guruhdoshlar "bugun jami" ni ko'radi.
      const from = startOfDay(Date.now());
      const todayBaseMs = await sessionRepo.sumAllDurationMs(from, addDays(from, 1)).catch(() => 0);
      if (cancelled) return;

      await focusStateRepo.publish({
        displayName: name,
        habit: habitName,
        accumulatedMs: fg.accumulatedMs,
        runningSince: fg.runningSince,
        targetMs: fg.targetMin * 60000,
        todayBaseMs,
      });
    })().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [fg, habitName, name, isRegistered]);
}
