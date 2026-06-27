import { formatSpent } from './formatSpent';

describe('formatSpent', () => {
  it('1 soatdan kam — faqat daqiqa', () => {
    expect(formatSpent(37 * 60_000)).toBe('37 daqiqa');
    expect(formatSpent(0)).toBe('0 daqiqa');
  });

  it(`1 soat va undan ko'p — "Xs Yd"`, () => {
    expect(formatSpent((24 * 60 + 12) * 60_000)).toBe('24s 12d');
    expect(formatSpent((2 * 60 + 40) * 60_000)).toBe('2s 40d');
  });

  it(`butun soat — faqat "Xs"`, () => {
    expect(formatSpent(60 * 60_000)).toBe('1s');
    expect(formatSpent(3 * 60 * 60_000)).toBe('3s');
  });

  it('manfiyni 0 deb oladi', () => {
    expect(formatSpent(-5000)).toBe('0 daqiqa');
  });
});
