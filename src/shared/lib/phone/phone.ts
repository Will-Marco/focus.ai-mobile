// O'zbekiston telefon raqamlarini E.164 (+998XXXXXXXXX) shakliga normalizatsiya qiladi.
// Qabul qilinadigan kirish shakllari: "901234567", "998901234567", "+998901234567",
// bo'shliq/tire/qavs bilan ("90 123 45 67") — hammasi bir xil natijaga keladi.
const UZ_COUNTRY_CODE = '998';

function stripFormatting(input: string): string {
  return input.replace(/[\s\-()]/g, '');
}

export function normalizePhone(input: string): string | null {
  const cleaned = stripFormatting(input.trim());
  const digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;

  if (digits.length === 0 || !/^\d+$/.test(digits)) return null;

  const withCountryCode = digits.length === 9 ? UZ_COUNTRY_CODE + digits : digits;

  if (withCountryCode.length !== 12 || !withCountryCode.startsWith(UZ_COUNTRY_CODE)) {
    return null;
  }

  return `+${withCountryCode}`;
}

/**
 * Faqat raqamlarni qoldiradi: "+998 90 123-45-67" → "998901234567".
 * Supabase `auth.users.phone` ni "+" siz saqlaydi, mijoz esa "+998…" bilan
 * normallashtiradi — solishtirish shu shaklда qilinadi (format farqi yo'qoladi).
 */
export function onlyDigits(input: string): string {
  return input.replace(/\D/g, '');
}

export function isValidUzPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}

/** Ikki xil formatda kelgan raqam bir xil odamnikimi (Telegram kontakt vs app input). */
export function phonesMatch(a: string, b: string): boolean {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  return na !== null && na === nb;
}

/** E.164 raqamni o'qiladigan shaklda ko'rsatadi: "+998996584432" → "+998 99 658 44 32". */
export function formatPhoneDisplay(e164: string): string {
  const digits = e164.startsWith('+') ? e164.slice(1) : e164;
  if (digits.length !== 12 || !digits.startsWith(UZ_COUNTRY_CODE)) return e164;

  const local = digits.slice(UZ_COUNTRY_CODE.length);
  return `+${UZ_COUNTRY_CODE} ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
}
