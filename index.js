/**
 * @format
 */

import '@shared/theme/unistyles';
import '@shared/config/i18n';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
