import { formatPhoneDisplay, isValidUzPhone, normalizePhone, onlyDigits, phonesMatch } from './phone';

describe('normalizePhone', () => {
  it('9 xonali mahalliy raqamga +998 qo\'shadi', () => {
    expect(normalizePhone('901234567')).toBe('+998901234567');
  });

  it("kod bilan kelgan raqamni + bilan qaytaradi (998...)", () => {
    expect(normalizePhone('998901234567')).toBe('+998901234567');
  });

  it("+ bilan kelgan raqamni o'zgarishsiz qaytaradi", () => {
    expect(normalizePhone('+998901234567')).toBe('+998901234567');
  });

  it("bo'shliq/tire/qavs bilan formatlangan raqamni tozalaydi", () => {
    expect(normalizePhone('90 123-45-67')).toBe('+998901234567');
    expect(normalizePhone('+998 (90) 123-45-67')).toBe('+998901234567');
  });

  it("boshqa davlat kodi bo'lsa rad etadi", () => {
    expect(normalizePhone('+79991234567')).toBeNull();
  });

  it("noto'g'ri uzunlikni rad etadi", () => {
    expect(normalizePhone('12345')).toBeNull();
    expect(normalizePhone('9012345678901')).toBeNull();
  });

  it('raqam bo\'lmagan belgilarni rad etadi', () => {
    expect(normalizePhone('90-abc-4567')).toBeNull();
  });

  it("bo'sh satrni rad etadi", () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('   ')).toBeNull();
  });
});

describe('isValidUzPhone', () => {
  it("to'g'ri raqam uchun true", () => {
    expect(isValidUzPhone('+998901234567')).toBe(true);
  });

  it("noto'g'ri raqam uchun false", () => {
    expect(isValidUzPhone('123')).toBe(false);
  });
});

describe('phonesMatch', () => {
  it('turli formatdagi bir xil raqamni mos deb topadi', () => {
    expect(phonesMatch('901234567', '+998 90 123-45-67')).toBe(true);
  });

  it("boshqa raqamni mos emas deb topadi", () => {
    expect(phonesMatch('901234567', '901234568')).toBe(false);
  });

  it('yaroqsiz raqamlarni mos emas deb topadi', () => {
    expect(phonesMatch('invalid', '901234567')).toBe(false);
  });
});

describe('formatPhoneDisplay', () => {
  it("E.164 raqamni guruhlab ko'rsatadi", () => {
    expect(formatPhoneDisplay('+998996584432')).toBe('+998 99 658 44 32');
  });

  it("noto'g'ri formatni o'zgarishsiz qaytaradi", () => {
    expect(formatPhoneDisplay('invalid')).toBe('invalid');
  });
});

describe('onlyDigits', () => {
  it('formatlangan raqamdan faqat raqamlarni qoldiradi', () => {
    expect(onlyDigits('+998 90 123-45-67')).toBe('998901234567');
    expect(onlyDigits('+998901234567')).toBe('998901234567');
    expect(onlyDigits('998901234567')).toBe('998901234567');
  });

  it("bo'sh yoki raqamsiz kirishda bo'sh satr", () => {
    expect(onlyDigits('')).toBe('');
    expect(onlyDigits('abc')).toBe('');
  });

  it('Supabase saqlagan shakl bilan mijoz normalizatsiyasi bir xil natija beradi', () => {
    expect(onlyDigits('998901234567')).toBe(onlyDigits(normalizePhone('901234567') ?? ''));
  });
});
