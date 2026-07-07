// @ts-nocheck  (Deno runtime — RN tsconfig'da tekshirilmaydi)
/** Kriptografik tasodifiy token (192-bit, 48 hex belgi) — deeplink/registratsiya identifikatori. */
export function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
