import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { supabase } from '@shared/api/supabase';
import { useSyncStore } from '@features/sync';

/**
 * Avtomatik sync: ilk mount, auth o'zgarishi (SIGNED_IN), va ilova foreground'ga
 * qaytganda. Hammasi syncStore orqali (bir vaqtda bitta). Mehmon/sozlanmagan — jim.
 */
export function useAutoSync() {
  const runSync = useSyncStore((s) => s.runSync);

  useEffect(() => {
    const fire = () => runSync().catch(() => {});
    fire(); // ilk mount

    const authSub = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') fire();
    });

    const appSub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') fire();
    });

    return () => {
      authSub?.data.subscription.unsubscribe();
      appSub.remove();
    };
  }, [runSync]);
}
