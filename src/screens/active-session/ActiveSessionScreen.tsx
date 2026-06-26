import React from 'react';
import { Screen, ScreenHeader } from '@shared/ui';
import { SessionView } from '@features/run-session';
import type { RootScreenProps } from '@shared/config/navigation';

export function ActiveSessionScreen({ navigation, route }: RootScreenProps<'ActiveSession'>) {
  const { habitId, sessionId } = route.params;
  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="" onBack={() => navigation.goBack()} />
      <SessionView habitId={habitId} sessionId={sessionId} onClose={() => navigation.goBack()} />
    </Screen>
  );
}
