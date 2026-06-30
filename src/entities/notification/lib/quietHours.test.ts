import { formatHm, isInQuietRange, parseHm } from './quietHours';

describe('parseHm', () => {
  it('parses HH:MM into minutes', () => {
    expect(parseHm('00:00')).toBe(0);
    expect(parseHm('07:30')).toBe(450);
    expect(parseHm('23:59')).toBe(1439);
  });
  it('returns 0 for invalid input', () => {
    expect(parseHm('')).toBe(0);
    expect(parseHm('25:00')).toBe(0);
    expect(parseHm('12:60')).toBe(0);
    expect(parseHm('abc')).toBe(0);
  });
});

describe('formatHm', () => {
  it('formats minutes into HH:MM', () => {
    expect(formatHm(0)).toBe('00:00');
    expect(formatHm(450)).toBe('07:30');
    expect(formatHm(1439)).toBe('23:59');
  });
  it('wraps around the day', () => {
    expect(formatHm(1440)).toBe('00:00');
    expect(formatHm(-60)).toBe('23:00');
  });
});

describe('isInQuietRange', () => {
  it('handles a normal same-day range [start, end)', () => {
    expect(isInQuietRange(parseHm('14:00'), parseHm('13:00'), parseHm('15:00'))).toBe(true);
    expect(isInQuietRange(parseHm('13:00'), parseHm('13:00'), parseHm('15:00'))).toBe(true); // boundary start inclusive
    expect(isInQuietRange(parseHm('15:00'), parseHm('13:00'), parseHm('15:00'))).toBe(false); // boundary end exclusive
    expect(isInQuietRange(parseHm('12:00'), parseHm('13:00'), parseHm('15:00'))).toBe(false);
  });

  it('handles an overnight range (start > end)', () => {
    const start = parseHm('22:00');
    const end = parseHm('07:00');
    expect(isInQuietRange(parseHm('23:30'), start, end)).toBe(true); // late night
    expect(isInQuietRange(parseHm('03:00'), start, end)).toBe(true); // early morning
    expect(isInQuietRange(parseHm('22:00'), start, end)).toBe(true); // boundary start
    expect(isInQuietRange(parseHm('07:00'), start, end)).toBe(false); // boundary end
    expect(isInQuietRange(parseHm('12:00'), start, end)).toBe(false); // midday
    expect(isInQuietRange(parseHm('21:59'), start, end)).toBe(false); // just before
  });

  it('treats start == end as an empty range', () => {
    expect(isInQuietRange(parseHm('00:00'), parseHm('09:00'), parseHm('09:00'))).toBe(false);
    expect(isInQuietRange(parseHm('09:00'), parseHm('09:00'), parseHm('09:00'))).toBe(false);
  });
});
