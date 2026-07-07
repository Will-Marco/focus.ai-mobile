const MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

/** "2026-yil iyul" — profil/hisob yaratilgan sanani o'qiladigan shaklda ko'rsatadi. */
export function formatJoinDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-yil ${MONTHS[d.getMonth()]}`;
}
