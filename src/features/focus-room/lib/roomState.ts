import { GROUP_COLORS, type GroupMember, type RoomPresence } from '@entities/group';

/** userId'dan barqaror rang (presence avatar). */
export function colorFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 9973;
  return GROUP_COLORS[h % GROUP_COLORS.length];
}

/**
 * Sessiya juda uzoq "ochiq" qolgan bo'lsa (ilova crash bo'lib, holat o'chirilmagan)
 * uni fokus deb ko'rsatmaymiz. Eng uzun real sessiya ham bundan qisqa.
 */
export const STALE_FOCUS_MS = 12 * 60 * 60 * 1000;

export function isStaleFocus(p: RoomPresence, now: number): boolean {
  const elapsed = (p.accumulatedMs ?? 0) + (p.runningSince ? now - p.runningSince : 0);
  return elapsed > STALE_FOCUS_MS;
}

export interface RoomSplit {
  /** Hozir fokusda — manba serverdagi holat (ilova yopiq bo'lsa ham ko'rinadi). */
  focusing: RoomPresence[];
  /** Onlayn, lekin fokusda emas — manba Realtime presence. */
  online: RoomPresence[];
  /** Qolgan a'zolar. */
  offline: GroupMember[];
}

/**
 * Guruh a'zolarini uch toifaga ajratadi. Ikki manba birlashtiriladi:
 * `focusStates` (server — kim fokusda) va `presences` (jonli ulanish — kim onlayn).
 * Fokus ustun: fokusdagi odam bir vaqtda "onlayn" ro'yxatida takrorlanmaydi.
 */
export function splitRoomMembers(
  members: GroupMember[],
  presences: RoomPresence[],
  focusStates: RoomPresence[],
  now: number,
): RoomSplit {
  const memberIds = new Set(members.map((m) => m.userId));
  // Guruhga aloqador va eskirmagan fokus holatlari.
  const focusing = focusStates.filter((f) => memberIds.has(f.userId) && !isStaleFocus(f, now));
  const focusIds = new Set(focusing.map((f) => f.userId));

  const online = presences.filter((p) => memberIds.has(p.userId) && !focusIds.has(p.userId));
  const onlineIds = new Set(online.map((p) => p.userId));

  const offline = members.filter((m) => !focusIds.has(m.userId) && !onlineIds.has(m.userId));
  return { focusing, online, offline };
}
