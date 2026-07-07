import { create } from 'zustand';
import { profileStorage } from './profileStorage';
import { GUEST_NAME, type Profile } from './types';

interface ProfileState {
  profile: Profile | null;
  onboardingSeen: boolean;
  hydrate: () => void;
  completeOnboarding: () => void;
  /** Mehmon sifatida davom etish (default yo'l). */
  continueAsGuest: (name?: string) => void;
  /** M8: Supabase auth ulanganda registered profil yaratiladi (Telegram → phone). */
  registerLocal: (name: string, email: string | null, phone?: string | null) => void;
  updateName: (name: string) => void;
  signOut: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  onboardingSeen: false,

  hydrate: () =>
    set({
      profile: profileStorage.getProfile(),
      onboardingSeen: profileStorage.isOnboardingSeen(),
    }),

  completeOnboarding: () => {
    profileStorage.setOnboardingSeen();
    set({ onboardingSeen: true });
  },

  continueAsGuest: (name) => {
    const profile: Profile = {
      name: name?.trim() || GUEST_NAME,
      email: null,
      phone: null,
      authMode: 'guest',
      createdAt: Date.now(),
    };
    profileStorage.saveProfile(profile);
    set({ profile });
  },

  registerLocal: (name, email, phone = null) => {
    const profile: Profile = {
      name: name.trim() || GUEST_NAME,
      email,
      phone,
      authMode: 'registered',
      createdAt: Date.now(),
    };
    profileStorage.saveProfile(profile);
    set({ profile });
  },

  updateName: (name) => {
    const current = get().profile;
    if (!current) return;
    const profile = { ...current, name: name.trim() || GUEST_NAME };
    profileStorage.saveProfile(profile);
    set({ profile });
  },

  signOut: () => {
    profileStorage.clearProfile();
    set({ profile: null });
  },
}));
