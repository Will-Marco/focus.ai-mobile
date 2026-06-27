import { storage } from '@shared/lib/storage/mmkv';
import type { Profile } from './types';

// Profil + onboarding holati MMKV'da (tezkor, login'siz local).
const PROFILE_KEY = 'profile';
const ONBOARDING_KEY = 'onboarding-seen';

export const profileStorage = {
  getProfile(): Profile | null {
    const raw = storage.getString(PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Profile;
    } catch {
      return null;
    }
  },

  saveProfile(profile: Profile): void {
    storage.set(PROFILE_KEY, JSON.stringify(profile));
  },

  clearProfile(): void {
    storage.remove(PROFILE_KEY);
  },

  isOnboardingSeen(): boolean {
    return storage.getBoolean(ONBOARDING_KEY) ?? false;
  },

  setOnboardingSeen(): void {
    storage.set(ONBOARDING_KEY, true);
  },
};
