import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useUnistyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardScreen } from '@screens/dashboard';
import { StatsScreen } from '@screens/stats';
import { TeamScreen } from '@screens/team';
import { ProfileScreen } from '@screens/profile';
import { HomeIcon, StatsIcon, TeamIcon, ProfileIcon } from '@shared/ui';
import type { TabParamList } from '@shared/config/navigation';

const Tab = createBottomTabNavigator<TabParamList>();

type TabIconArgs = { color: string; size: number };

const renderHomeIcon = ({ color, size }: TabIconArgs) => <HomeIcon color={color} size={size} />;
const renderStatsIcon = ({ color, size }: TabIconArgs) => <StatsIcon color={color} size={size} />;
const renderTeamIcon = ({ color, size }: TabIconArgs) => <TeamIcon color={color} size={size} />;
const renderProfileIcon = ({ color, size }: TabIconArgs) => (
  <ProfileIcon color={color} size={size} />
);

export function TabNavigator() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const screenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    // tab almashinuvi — gorizontal siljish + fade (v7 bottom-tabs)
    animation: 'shift',
    // scene konteyner foni — transition paytida ortdan chaqnashning oldini oladi (dark fix)
    sceneStyle: { backgroundColor: theme.colors.background },
    tabBarActiveTintColor: theme.colors.tabActive,
    tabBarInactiveTintColor: theme.colors.tabInactive,
    tabBarStyle: {
      backgroundColor: theme.colors.backgroundElevated,
      borderTopColor: theme.colors.border,
      // tizim pastki paneli (gesture bar / home indicator) uchun joy ajratamiz
      height: 64 + insets.bottom,
      paddingTop: 6,
      paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
    },
    tabBarLabelStyle: {
      fontFamily: theme.fontFamily.semibold,
      fontSize: 10,
    },
  };

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: t('tabs.dashboard'), tabBarIcon: renderHomeIcon }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: t('tabs.stats'), tabBarIcon: renderStatsIcon }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{ title: t('tabs.team'), tabBarIcon: renderTeamIcon }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('tabs.profile'), tabBarIcon: renderProfileIcon }}
      />
    </Tab.Navigator>
  );
}
