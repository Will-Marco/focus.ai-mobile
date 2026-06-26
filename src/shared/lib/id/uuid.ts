// RFC 4122 v4 UUID — sync uchun global-unique ID (Hermes'da crypto.randomUUID yo'q).
// Math.random yetarli: collision ehtimoli amaliy jihatdan nol, server emas mijoz.
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    // 'y' variant bit'lari: 8–11 oralig'i ((r & 3) | 8 ekvivalenti, bitwise'siz).
    const v = c === 'x' ? r : (r % 4) + 8;
    return v.toString(16);
  });
}
