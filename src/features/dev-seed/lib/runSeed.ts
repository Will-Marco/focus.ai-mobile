import { db } from '@shared/lib/db/db';
import { habitRepo, useHabitStore } from '@entities/habit';
import { sessionRepo } from '@entities/session';
import { useProfileStore } from '@entities/profile';
import { DEMO_HABITS, generateSessions, type GenerateOptions } from '../model/generate';

/**
 * Demo ma'lumotni local DB'ga yozadi — skrinshot/demo video uchun.
 *
 * ⚠️ FAQAT DEV. Mavjud odat va sessiyalarni **butunlay o'chiradi**, keyin
 * generatordan kelgan tarixni yozadi. Chaqiruvchi (`DevSeedButton`) `__DEV__`
 * bilan himoyalangan, ya'ni release bundle'да bu yo'l umuman ochilmaydi.
 */
export async function runSeed(name = 'Aziz', opts: GenerateOptions = {}): Promise<{ habits: number; sessions: number }> {
  if (!__DEV__) throw new Error('runSeed faqat dev rejimda ishlaydi');

  // Toza boshlash — takroriy seed ma'lumotni ikkilantirmasin.
  await db.execute('DELETE FROM sessions;');
  await db.execute('DELETE FROM habits;');

  const ids: string[] = [];
  for (const draft of DEMO_HABITS) {
    const habit = await habitRepo.create(draft);
    ids.push(habit.id);
  }

  const sessions = generateSessions(ids, Date.now(), opts);
  for (const draft of sessions) {
    await sessionRepo.insert(draft);
  }

  // Store'larni DB bilan qayta moslashtiramiz (UI darhol yangilanadi).
  await useHabitStore.getState().hydrate();
  useProfileStore.getState().updateName(name);

  return { habits: ids.length, sessions: sessions.length };
}
