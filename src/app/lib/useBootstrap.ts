import { useEffect, useState } from 'react';
import { runMigrations } from '@shared/lib/db/db';
import { useHabitStore } from '@entities/habit';
import { useSessionStore } from '@entities/session';
import { useProfileStore } from '@entities/profile';
import { useNotificationStore } from '@entities/notification';

// Ilova ishga tushishi: SQLite migratsiyalari → habit store hydrate.
// `ready` bo'lguncha UI render qilinmaydi (holat to'liq tiklanadi).
export function useBootstrap(): { ready: boolean; error: Error | null } {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hydrateHabits = useHabitStore((s) => s.hydrate);
  const hydrateSessions = useSessionStore((s) => s.hydrate);
  const hydrateProfile = useProfileStore((s) => s.hydrate);
  const hydrateNotifications = useNotificationStore((s) => s.hydrate);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await runMigrations();
        await hydrateHabits();
        hydrateSessions(); // MMKV — sinxron qaynoq sessiyalarni tiklash
        hydrateProfile(); // MMKV — profil + onboarding holati
        hydrateNotifications(); // MMKV — bildirishnoma sozlamalari
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateHabits, hydrateSessions, hydrateProfile, hydrateNotifications]);

  return { ready, error };
}
