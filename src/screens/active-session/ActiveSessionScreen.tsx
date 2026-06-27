import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { RadialBackground } from '@shared/ui';
import { SessionView } from '@features/run-session';
import type { RootScreenProps } from '@shared/config/navigation';

export function ActiveSessionScreen({ navigation, route }: RootScreenProps<'ActiveSession'>) {
  const { habitId, sessionId } = route.params;
  const { theme } = useUnistyles();

  return (
    <View style={styles.root}>
      <RadialBackground colors={[...theme.colors.sessionBg]} positions={[0, 0.46, 1]} />
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <SessionView habitId={habitId} sessionId={sessionId} onClose={() => navigation.goBack()} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  root: { flex: 1 },
}));
