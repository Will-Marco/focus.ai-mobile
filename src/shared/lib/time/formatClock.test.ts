import { formatClock } from './formatClock';

describe('formatClock', () => {
  it('soatsiz MM:SS', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(65_000)).toBe('01:05');
    expect(formatClock(59 * 60_000 + 59_000)).toBe('59:59');
  });

  it('soat bilan H:MM:SS', () => {
    expect(formatClock(3_600_000)).toBe('1:00:00');
    expect(formatClock(3_661_000)).toBe('1:01:01');
  });

  it('manfiyni 0 deb oladi', () => {
    expect(formatClock(-5000)).toBe('00:00');
  });
});
