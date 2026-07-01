// Team / Focus Rooms — guruh entity tiplari. Online (Supabase); core offline qoladi.

export type MemberRole = 'owner' | 'member';
export type InviteStatus = 'pending' | 'accepted' | 'rejected';
export type ActivityType = 'started' | 'completed' | 'joined';

export interface Group {
  id: string;
  name: string;
  color: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  displayName: string;
  color: string;
  role: MemberRole;
  joinedAt: number;
}

export interface Invite {
  id: string;
  groupId: string;
  inviterId: string;
  inviteeEmail: string;
  status: InviteStatus;
  createdAt: number;
  /** join orqali to'ldiriladi (UI'da guruh nomi). */
  groupName?: string;
}

export interface GroupActivity {
  id: string;
  groupId: string;
  userId: string;
  type: ActivityType;
  text: string;
  color: string;
  createdAt: number;
}

/**
 * Realtime presence — kim hozir online/fokusda (jadvalda emas, kanal payload'ida).
 * Sessiya boshlanganда track qilinadi, tugaganда yangilanadi.
 */
export interface RoomPresence {
  userId: string;
  name: string;
  color: string;
  /** fokusda bo'lsa odat nomi. */
  habit?: string;
  /** pauzalarда to'plangan vaqt (ms) — timer formulasi (accumulatedMs + running delta). */
  accumulatedMs?: number;
  /** running bo'lsa boshlangan epoch-ms; PAUZAда null → timer to'xtaydi. */
  runningSince?: number | null;
  /** sessiya maqsadi (ms). */
  targetMs?: number;
  /** bugungi YAKUNLANGAN jami fokus (barcha odatlar, ms) — joriy sessiya bunga qo'shiladi. */
  todayBaseMs?: number;
  focusing: boolean;
}

// Guruh + qisqa meta (ro'yxat kartasi uchun).
export interface GroupSummary extends Group {
  memberCount: number;
}

// Guruh ranglari paleti (yaratishда tanlanadi).
export const GROUP_COLORS = ['#F2A24C', '#5FD0C5', '#EC5C7D', '#9A8CF0', '#F2603E', '#9bd07f'] as const;
