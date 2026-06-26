/**
 * Focus AI — root component
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { AppProviders } from '@app/providers/AppProviders';
import { RootNavigator } from '@app/navigation/RootNavigator';
import { runMigrations } from '@shared/lib/db/db';

function App() {
  useEffect(() => {
    runMigrations().catch(e => console.warn('migration error', e));
  }, []);

  return (
    <AppProviders>
      <StatusBar />
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
