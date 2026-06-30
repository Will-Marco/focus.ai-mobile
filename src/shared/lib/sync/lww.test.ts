import { maxUpdatedAt, resolvePull, selectDirty, winner, type SyncRow } from './lww';

const row = (id: string, updated_at: number, deleted_at: number | null = null): SyncRow => ({ id, updated_at, deleted_at });

describe('winner', () => {
  it('picks the greater updated_at', () => {
    expect(winner(row('a', 10), row('a', 20))).toEqual(row('a', 20));
    expect(winner(row('a', 30), row('a', 20))).toEqual(row('a', 30));
  });
  it('prefers remote (b) on a tie for deterministic convergence', () => {
    const a = row('a', 10);
    const b = row('a', 10);
    expect(winner(a, b)).toBe(b);
  });
});

describe('selectDirty', () => {
  it('returns rows changed strictly after the cursor', () => {
    const rows = [row('a', 5), row('b', 10), row('c', 15)];
    expect(selectDirty(rows, 10).map((r) => r.id)).toEqual(['c']);
  });
  it('includes soft-deleted rows that changed', () => {
    const rows = [row('a', 20, 20)];
    expect(selectDirty(rows, 10)).toHaveLength(1);
  });
  it('returns nothing when all rows are older', () => {
    expect(selectDirty([row('a', 5)], 10)).toHaveLength(0);
  });
});

describe('resolvePull', () => {
  it('applies remote rows missing locally', () => {
    const local = [row('a', 10)];
    const remote = [row('b', 5)];
    expect(resolvePull(local, remote).map((r) => r.id)).toEqual(['b']);
  });
  it('applies remote when it is newer than local', () => {
    const local = [row('a', 10)];
    const remote = [row('a', 20)];
    expect(resolvePull(local, remote)).toEqual([row('a', 20)]);
  });
  it('skips remote when local is newer (local wins)', () => {
    const local = [row('a', 30)];
    const remote = [row('a', 20)];
    expect(resolvePull(local, remote)).toHaveLength(0);
  });
  it('applies remote on a tie (deterministic)', () => {
    const local = [row('a', 10)];
    const remote = [row('a', 10, 10)]; // remote soft-deleted, same ts
    expect(resolvePull(local, remote)).toEqual([row('a', 10, 10)]);
  });
  it('handles soft-deletes propagating from remote', () => {
    const local = [row('a', 10)];
    const remote = [row('a', 25, 25)];
    expect(resolvePull(local, remote)[0].deleted_at).toBe(25);
  });
});

describe('maxUpdatedAt', () => {
  it('returns the largest updated_at', () => {
    expect(maxUpdatedAt([row('a', 5), row('b', 30), row('c', 12)])).toBe(30);
  });
  it('returns 0 for an empty set', () => {
    expect(maxUpdatedAt([])).toBe(0);
  });
});
