import React from 'react';
import { useTranslation } from 'react-i18next';
import { Screen, ScreenHeader } from '@shared/ui';
import { useHabitStore } from '@entities/habit';
import { CreateHabitForm } from '@features/create-habit';
import type { RootScreenProps } from '@shared/config/navigation';

export function AddHabitScreen({ navigation, route }: RootScreenProps<'AddHabit'>) {
  const { t } = useTranslation();
  const habitId = route.params?.habitId;
  const initial = useHabitStore((s) => s.habits.find((h) => h.id === habitId));

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader
        title={initial ? t('addHabit.edit') : t('addHabit.title')}
        onBack={() => navigation.goBack()}
      />
      <CreateHabitForm initial={initial} onDone={() => navigation.goBack()} />
    </Screen>
  );
}
