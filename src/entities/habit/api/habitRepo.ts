import { db } from '@shared/lib/db/db';
import { uuid } from '@shared/lib/id';
import { rowToHabit } from '../model/mappers';
import type { Habit, HabitDraft, HabitRow } from '../model/types';

// Habit doimiy manba (SQLite). Faqat I/O — biznes mantiq model/lib'da.
export const habitRepo = {
  async list(): Promise<Habit[]> {
    const { rows } = await db.execute(
      `SELECT * FROM habits
       WHERE deleted_at IS NULL
       ORDER BY sort_order ASC, created_at ASC;`,
    );
    return (rows ?? []).map((r) => rowToHabit(r as unknown as HabitRow));
  },

  async create(draft: HabitDraft): Promise<Habit> {
    const now = Date.now();
    const habit: Habit = {
      id: uuid(),
      ...draft,
      sortOrder: now, // monoton — yangi odat oxirida; keyin drag-reorder qayta yozadi
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await db.execute(
      `INSERT INTO habits
         (id, name, icon, color, type, period, target_minutes, sort_order, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
      [
        habit.id,
        habit.name,
        habit.icon,
        habit.color,
        habit.type,
        habit.period,
        habit.targetMinutes,
        habit.sortOrder,
        habit.createdAt,
        habit.updatedAt,
      ],
    );
    return habit;
  },

  async update(id: string, patch: Partial<HabitDraft>): Promise<void> {
    const fields: string[] = [];
    const values: Array<string | number | null> = [];
    const col: Record<keyof HabitDraft, string> = {
      name: 'name',
      icon: 'icon',
      color: 'color',
      type: 'type',
      period: 'period',
      targetMinutes: 'target_minutes',
    };
    (Object.keys(patch) as Array<keyof HabitDraft>).forEach((k) => {
      fields.push(`${col[k]} = ?`);
      values.push(patch[k] as string | number | null);
    });
    if (fields.length === 0) return;
    fields.push('updated_at = ?');
    values.push(Date.now());
    await db.execute(`UPDATE habits SET ${fields.join(', ')} WHERE id = ?;`, [...values, id]);
  },

  // Soft-delete (sync uchun) — yozuv qoladi, deleted_at qo'yiladi.
  async softDelete(id: string): Promise<void> {
    await db.execute('UPDATE habits SET deleted_at = ?, updated_at = ? WHERE id = ?;', [
      Date.now(),
      Date.now(),
      id,
    ]);
  },
};
