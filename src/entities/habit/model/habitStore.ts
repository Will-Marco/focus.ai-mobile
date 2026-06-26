import { create } from 'zustand';
import { habitRepo } from '../api/habitRepo';
import type { Habit, HabitDraft } from './types';

interface HabitState {
  habits: Habit[];
  hydrated: boolean;
  /** Ilova ochilganda SQLite'dan in-memory state'ga yuklaydi. */
  hydrate: () => Promise<void>;
  addHabit: (draft: HabitDraft) => Promise<Habit>;
  editHabit: (id: string, patch: Partial<HabitDraft>) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
}

const sortHabits = (list: Habit[]): Habit[] =>
  [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt - b.createdAt);

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  hydrated: false,

  hydrate: async () => {
    const habits = await habitRepo.list();
    set({ habits, hydrated: true });
  },

  addHabit: async (draft) => {
    const habit = await habitRepo.create(draft);
    set({ habits: sortHabits([...get().habits, habit]) });
    return habit;
  },

  editHabit: async (id, patch) => {
    await habitRepo.update(id, patch);
    set({
      habits: sortHabits(
        get().habits.map((h) =>
          h.id === id ? { ...h, ...patch, updatedAt: Date.now() } : h,
        ),
      ),
    });
  },

  removeHabit: async (id) => {
    await habitRepo.softDelete(id);
    set({ habits: get().habits.filter((h) => h.id !== id) });
  },
}));
