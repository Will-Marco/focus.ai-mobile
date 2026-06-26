import { validateHabitDraft, type HabitFormInput } from './validate';

const valid: HabitFormInput = {
  name: '  Mutolaa  ',
  icon: 'book',
  color: 'amber',
  type: 'cumulative',
  period: null,
  targetHours: 10,
};

describe('validateHabitDraft', () => {
  it("to'g'ri kirritmani trim qilib HabitDraft qaytaradi (soat → daqiqa)", () => {
    const res = validateHabitDraft(valid);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.draft.name).toBe('Mutolaa');
      expect(res.draft.targetMinutes).toBe(600);
      expect(res.draft.period).toBeNull();
    }
  });

  it('recurring odat uchun period saqlanadi', () => {
    const res = validateHabitDraft({
      ...valid,
      type: 'recurring',
      period: 'weekly',
    });
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

  it('target 0.1 soatdan kam — xato', () => {
    const res = validateHabitDraft({ ...valid, targetHours: 0 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.targetHours).toBeDefined();
  });

  it("target 1000 soatdan ko'p — xato", () => {
    const res = validateHabitDraft({ ...valid, targetHours: 1001 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.targetHours).toBeDefined();
  });

  it("recurring, lekin period yo'q — xato", () => {
    const res = validateHabitDraft({ ...valid, type: 'recurring', period: null });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.period).toBeDefined();
  });

  it("cumulative odat period'ni majburan null qiladi", () => {
    const res = validateHabitDraft({
      ...valid,
      type: 'cumulative',
      period: 'daily',
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.draft.period).toBeNull();
  });
});
