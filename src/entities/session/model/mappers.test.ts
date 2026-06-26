import { rowToCompletedSession } from './mappers';
import type { SessionRow } from './types';

const row: SessionRow = {
  id: 's1',
  habit_id: 'h1',
  duration_ms: 2_700_000,
  target_minutes: 45,
  completed: 1,
  started_at: 1000,
  ended_at: 2000,
  created_at: 1000,
  updated_at: 2000,
  deleted_at: null,
};

describe('rowToCompletedSession', () => {
  it("qatorni entity'ga aylantiradi, completed'ni boolean qiladi", () => {
    expect(rowToCompletedSession(row)).toEqual({
      id: 's1',
      habitId: 'h1',
      durationMs: 2_700_000,
      targetMinutes: 45,
      completed: true,
      startedAt: 1000,
      endedAt: 2000,
      createdAt: 1000,
      updatedAt: 2000,
      deletedAt: null,
    });
  });

  it('completed=0 → false', () => {
    expect(rowToCompletedSession({ ...row, completed: 0 }).completed).toBe(false);
  });
});
