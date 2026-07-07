// @ts-nocheck  (Deno runtime — RN tsconfig'da tekshirilmaydi)
// Mijozdagi `src/shared/lib/phone/phone.ts` bilan bir xil mantiq (Deno runtime alohida
// bo'lgani uchun RN kod bazasidan import qilib bo'lmaydi — shu sabab kichik nusxa).
const UZ_COUNTRY_CODE = '998';

export function normalizePhone(input: string): string | null {
  const cleaned = input.trim().replace(/[\s\-()]/g, '');
  const digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;

  if (digits.length === 0 || !/^\d+$/.test(digits)) return null;

  const withCountryCode = digits.length === 9 ? UZ_COUNTRY_CODE + digits : digits;

  if (withCountryCode.length !== 12 || !withCountryCode.startsWith(UZ_COUNTRY_CODE)) {
    return null;
  }

  return `+${withCountryCode}`;
}
