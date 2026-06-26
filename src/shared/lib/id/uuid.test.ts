import { uuid } from './uuid';

describe('uuid', () => {
  it('RFC 4122 v4 formatига mos satr qaytaradi', () => {
    expect(uuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("har chaqiruvda noyob (collision yo'q, 1000 ta)", () => {
    const set = new Set(Array.from({ length: 1000 }, () => uuid()));
    expect(set.size).toBe(1000);
  });
});
