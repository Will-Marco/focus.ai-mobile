import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '@screens/onboarding';
import { AuthScreen } from '@screens/auth';
import { AddHabitScreen } from '@screens/add-habit';
import { ActiveSessionScreen } from '@screens/active-session';
import { useProfileStore } from '@entities/profile';
import type { RootStackParamList } from '@shared/config/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const onboardingSeen = useProfileStore((s) => s.onboardingSeen);
  const profile = useProfileStore((s) => s.profile);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboardingSeen ? (
        // 1) Birinchi ochilish — onboarding
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !profile ? (
        // 2) Onboarding ko'rilgan, lekin profil yo'q — auth (mehmon default)
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        // 3) Asosiy ilova
        <Stack.Group>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen
            name="AddHabit"
            component={AddHabitScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="ActiveSession"
            component={ActiveSessionScreen}
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
