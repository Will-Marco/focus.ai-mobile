import { create } from 'zustand';
import { groupRepo } from '../api/groupRepo';
import type { GroupSummary, Invite } from './types';

interface GroupState {
  groups: GroupSummary[];
  invites: Invite[];
  loading: boolean;
  loadGroups: () => Promise<void>;
  loadInvites: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  invites: [],
  loading: false,

  loadGroups: async () => {
    set({ loading: true });
    const groups = await groupRepo.listMyGroups();
    set({ groups, loading: false });
  },

  loadInvites: async () => {
    const invites = await groupRepo.listMyInvites();
    set({ invites });
  },

  refresh: async () => {
    set({ loading: true });
    const [groups, invites] = await Promise.all([groupRepo.listMyGroups(), groupRepo.listMyInvites()]);
    set({ groups, invites, loading: false });
  },
}));
