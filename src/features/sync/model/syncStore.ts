import { create } from 'zustand';
import { syncAll, type SyncResult } from './sync';

export type SyncStatus = 'idle' | 'syncing' | 'done' | 'error';

interface SyncState {
  status: SyncStatus;
  lastResult: SyncResult | null;
  lastSyncedAt: number | null;
  /** Sync ishga tushirish (bir vaqtda bitta — qayta chaqiruv e'tiborsiz). */
  runSync: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: 'idle',
  lastResult: null,
  lastSyncedAt: null,

  runSync: async () => {
    if (get().status === 'syncing') return;
    set({ status: 'syncing' });
    const result = await syncAll();
    // Sozlanmagan / mehmon — jim o'tkaziladi (xato emas), faqat haqiqiy xato 'error'.
    const silent = result.reason === 'notConfigured' || result.reason === 'notAuthed';
    set({
      status: result.ok ? 'done' : silent ? 'idle' : 'error',
      lastResult: result,
      lastSyncedAt: result.ok ? Date.now() : get().lastSyncedAt,
    });
  },
}));
