import { rowToHabit } from './mappers';
import type { HabitRow } from './types';

const baseRow: HabitRow = {
  id: 'h1',
  name: 'Mutolaa',
  icon: 'book',
  color: 'amber',
  type: 'cumulative',
  period: null,
  target_minutes: 600,
  sort_order: 0,
  created_at: 1000,
  updated_at: 2000,
  deleted_at: null,
};

describe('rowToHabit', () => {
  it("snake_case qatorni Habit entity'ga aylantiradi", () => {
    expect(rowToHabit(baseRow)).toEqual({
      id: 'h1',
      name: 'Mutolaa',
      icon: 'book',
      color: 'amber',
      type: 'cumulative',
      period: null,
      targetMinutes: 600,
      sortOrder: 0,
      createdAt: 1000,
      updatedAt: 2000,
      deletedAt: null,
    });
  });

  it('recurring odat period va deleted_at ni saqlaydi', () => {
    const h = rowToHabit({
      ...baseRow,
      type: 'recurring',
      period: 'weekly',
      deleted_at: 5000,
    });
    expect(h.period).toBe('weekly');
    expect(h.deletedAt).toBe(5000);
  });
});
