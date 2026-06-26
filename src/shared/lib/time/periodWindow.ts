// Davriy odat progress oynasi. Pure: berilgan `now` uchun joriy davrning
// [from, to) chegarasini (local vaqt) qaytaradi. Progress = shu oynadagi
// to'plangan vaqt / maqsad. Chegaralar: daily 00:00, weekly dushanba, monthly 1-kun.
export type Period = 'daily' | 'weekly' | 'monthly';

export interface Window {
  from: number;
  to: number;
}

export function periodWindow(period: Period, now: number): Window {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0); // kun boshiga (local)

  switch (period) {
    case 'daily': {
      const from = d.getTime();
      const toDate = new Date(from);
      toDate.setDate(toDate.getDate() + 1);
      return { from, to: toDate.getTime() };
    }
    case 'weekly': {
      // Dushanba = hafta boshi. getDay(): 0=yakshanba … 6=shanba.
      const offset = (d.getDay() + 6) % 7; // dushanbadan o'tgan kunlar
      d.setDate(d.getDate() - offset);
      const from = d.getTime();
      const toDate = new Date(from);
      toDate.setDate(toDate.getDate() + 7);
      return { from, to: toDate.getTime() };
    }
    case 'monthly': {
      const from = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const to = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      return { from, to };
    }
  }
}
