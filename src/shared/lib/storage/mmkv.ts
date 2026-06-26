import { createMMKV } from 'react-native-mmkv';

// Tezkor key-value: tema afzalligi, qaynoq taymer holati va boshqalar.
// MMKV v4 — factory API (`new MMKV()` emas).
export const storage = createMMKV({ id: 'focus-ai' });
