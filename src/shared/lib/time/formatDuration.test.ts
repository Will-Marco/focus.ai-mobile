import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  it('1 soatdan kam: MM:SS formati', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(5_000)).toBe('00:05');
    expect(formatDuration(65_000)).toBe('01:05');
    expect(formatDuration(59 * 60_000 + 59_000)).toBe('59:59');
  });

  it("1 soat va undan ko'p: H:MM:SS formati", () => {
    expect(formatDuration(3_600_000)).toBe('1:00:00');
    expect(formatDuration(3_661_000)).toBe('1:01:01');
    expect(formatDuration(10 * 3_600_000)).toBe('10:00:00');
  });

  it('manfiy qiymat 0 ga clamp qilinadi', () => {
    expect(formatDuration(-5_000)).toBe('00:00');
  });

  it("soniyaning bo'lagini pastга yaxlitlaydi", () => {
    expect(formatDuration(1_999)).toBe('00:01');
  });
});
