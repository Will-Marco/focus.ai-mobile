import type { GroupMember, RoomPresence } from '@entities/group';
import { colorFromId, isStaleFocus, splitRoomMembers, STALE_FOCUS_MS } from './roomState';

// `@entities/group` public API'si groupRepo → Supabase client'ni tortadi (jest'да native
// polyfill yo'q). Bu yerda faqat rang palitrasi kerak — qolgani type-only import.
jest.mock('@entities/group', () => ({ GROUP_COLORS: ['#F2603E', '#F2A24C', '#5FD0C5'] }));

const NOW = 1_700_000_000_000;

const member = (userId: string, displayName = userId): GroupMember => ({
  groupId: 'g1',
  userId,
  displayName,
  color: '#F2603E',
  role: 'member',
  joinedAt: NOW,
});

const presence = (userId: string, over: Partial<RoomPresence> = {}): RoomPresence => ({
  userId,
  name: userId,
  color: '#F2603E',
  focusing: false,
  ...over,
});

describe('splitRoomMembers', () => {
  const members = [member('a'), member('b'), member('c')];

  it('fokusdagi a\'zo serverdagi holatдан keladi (presence shart emas)', () => {
    const focus = [presence('a', { focusing: true, habit: 'Mutolaa', runningSince: NOW - 60_000 })];
    const { focusing, online, offline } = splitRoomMembers(members, [], focus, NOW);
    expect(focusing.map((f) => f.userId)).toEqual(['a']);
    expect(online).toHaveLength(0);
    expect(offline.map((o) => o.userId)).toEqual(['b', 'c']);
  });

  it('fokusdagi odam "onlayn" ro\'yxatida takrorlanmaydi', () => {
    const focus = [presence('a', { focusing: true })];
    const pres = [presence('a'), presence('b')];
    const { focusing, online, offline } = splitRoomMembers(members, pres, focus, NOW);
    expect(focusing.map((f) => f.userId)).toEqual(['a']);
    expect(online.map((o) => o.userId)).toEqual(['b']);
    expect(offline.map((o) => o.userId)).toEqual(['c']);
  });

  it('guruhga aloqasi yo\'q holatlarni chetlab o\'tadi', () => {
    const focus = [presence('x', { focusing: true })];
    const pres = [presence('y')];
    const { focusing, online, offline } = splitRoomMembers(members, pres, focus, NOW);
    expect(focusing).toHaveLength(0);
    expect(online).toHaveLength(0);
    expect(offline).toHaveLength(3);
  });

  it('eskirgan fokus holati (crash qoldig\'i) offline hisoblanadi', () => {
    const focus = [presence('a', { focusing: true, runningSince: NOW - STALE_FOCUS_MS - 1000 })];
    const { focusing, offline } = splitRoomMembers(members, [], focus, NOW);
    expect(focusing).toHaveLength(0);
    expect(offline.map((o) => o.userId)).toContain('a');
  });

  it('pauzadagi sessiya ham fokus deb ko\'rsatiladi (runningSince null)', () => {
    const focus = [presence('a', { focusing: true, accumulatedMs: 5 * 60_000, runningSince: null })];
    const { focusing } = splitRoomMembers(members, [], focus, NOW);
    expect(focusing).toHaveLength(1);
  });

  it("hech kim yo'q bo'lsa hamma offline", () => {
    const { focusing, online, offline } = splitRoomMembers(members, [], [], NOW);
    expect(focusing).toHaveLength(0);
    expect(online).toHaveLength(0);
    expect(offline).toHaveLength(3);
  });
});

describe('isStaleFocus', () => {
  it('pauzadagi uzoq sessiya ham eskirgan deb topiladi', () => {
    expect(isStaleFocus(presence('a', { accumulatedMs: STALE_FOCUS_MS + 1, runningSince: null }), NOW)).toBe(true);
  });

  it('normal sessiya eskirgan emas', () => {
    expect(isStaleFocus(presence('a', { accumulatedMs: 0, runningSince: NOW - 25 * 60_000 }), NOW)).toBe(false);
  });
});

describe('colorFromId', () => {
  it('bir xil id — bir xil rang', () => {
    expect(colorFromId('abc')).toBe(colorFromId('abc'));
  });

  it('rang palitradan tanlanadi', () => {
    expect(colorFromId('xyz')).toMatch(/^#/);
  });
});
