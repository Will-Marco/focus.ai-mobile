import { validateHabitDraft, type HabitFormInput } from './validate';

const valid: HabitFormInput = {
  name: '  Mutolaa  ',
  icon: 'book',
  color: 'amber',
  period: 'daily',
  targetCount: 1,
};

describe('validateHabitDraft', () => {
  it("to'g'ri kirritmani trim qilib HabitDraft qaytaradi", () => {
    const res = validateHabitDraft(valid);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.draft.name).toBe('Mutolaa');
      expect(res.draft.targetCount).toBe(1);
      expect(res.draft.period).toBe('daily');
    }
  });

  it('haftalik davr saqlanadi', () => {
    const res = validateHabitDraft({ ...valid, period: 'weekly', targetCount: 3 });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.draft.period).toBe('weekly');
  });

  it("bo'sh nom — xato", () => {
    const res = validateHabitDraft({ ...valid, name: '   ' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.name).toBeDefined();
  });

  it('50 belgidan uzun nom — xato', () => {
    const res = validateHabitDraft({ ...valid, name: 'a'.repeat(51) });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.name).toBeDefined();
  });

  it('kunlik uchun targetCount 0 — xato (min 1)', () => {
    const res = validateHabitDraft({ ...valid, period: 'daily', targetCount: 0 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.targetCount).toBeDefined();
  });

  it('kunlik uchun targetCount 6 — xato (max 5)', () => {
    const res = validateHabitDraft({ ...valid, period: 'daily', targetCount: 6 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.targetCount).toBeDefined();
  });

  it('haftalik uchun targetCount 14 — OK (max)', () => {
    const res = validateHabitDraft({ ...valid, period: 'weekly', targetCount: 14 });
    expect(res.ok).toBe(true);
  });

  it('haftalik uchun targetCount 15 — xato (max 14)', () => {
    const res = validateHabitDraft({ ...valid, period: 'weekly', targetCount: 15 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.targetCount).toBeDefined();
  });

  it('oylik uchun targetCount 60 — OK (max)', () => {
    const res = validateHabitDraft({ ...valid, period: 'monthly', targetCount: 60 });
    expect(res.ok).toBe(true);
  });

  it('oylik uchun targetCount 61 — xato (max 60)', () => {
    const res = validateHabitDraft({ ...valid, period: 'monthly', targetCount: 61 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.targetCount).toBeDefined();
  });

  it('butun son bo\'lmagan targetCount — xato', () => {
    const res = validateHabitDraft({ ...valid, targetCount: 1.5 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.targetCount).toBeDefined();
  });
});
