import { formatJoinDate } from './formatJoinDate';

describe('formatJoinDate', () => {
  it("yil va oy nomini o'zbekcha qaytaradi", () => {
    expect(formatJoinDate(new Date(2026, 6, 7).getTime())).toBe('2026-yil iyul');
  });

  it('yanvarni ham to\'g\'ri qaytaradi (oy indeksi 0)', () => {
    expect(formatJoinDate(new Date(2025, 0, 1).getTime())).toBe('2025-yil yanvar');
  });

  it('dekabrni to\'g\'ri qaytaradi (oy indeksi 11)', () => {
    expect(formatJoinDate(new Date(2025, 11, 31).getTime())).toBe('2025-yil dekabr');
  });
});
