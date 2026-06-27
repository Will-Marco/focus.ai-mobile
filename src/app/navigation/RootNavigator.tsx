import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '@screens/onboarding';
import { AuthScreen } from '@screens/auth';
import { AddHabitScreen } from '@screens/add-habit';
import { ActiveSessionScreen } from '@screens/active-session';
import { AICoachScreen } from '@screens/ai-coach';
import { NotificationsScreen } from '@screens/notifications';
import { NotificationSettingsScreen } from '@screens/notification-settings';
import { useProfileStore } from '@entities/profile';
import { useUnistyles } from 'react-native-unistyles';
import type { RootStackParamList } from '@shared/config/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const onboardingSeen = useProfileStore((s) => s.onboardingSeen);
  const profile = useProfileStore((s) => s.profile);
  const { theme } = useUnistyles();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 280,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
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
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="ActiveSession"
            component={ActiveSessionScreen}
            options={{ presentation: 'fullScreenModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="AICoach"
            component={AICoachScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
