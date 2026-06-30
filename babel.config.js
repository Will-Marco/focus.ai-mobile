const path = require('path');

// Yo'llar __dirname'ga nisbatan absolute — Metro'ni qaysi cwd'dan ishga tushishidan
// qat'i nazar barqaror (gradle build android/ ichidan chaqirsa ham buzilmaydi).
const src = (p = '') => path.resolve(__dirname, 'src', p);

module.exports = api => {
  const isTest = api.env('test');
  api.cache.using(() => process.env.NODE_ENV);

  const plugins = [
    [
      'module-resolver',
      {
        cwd: __dirname,
        root: [src()],
        alias: {
          '@app': src('app'),
          '@screens': src('screens'),
          '@widgets': src('widgets'),
          '@features': src('features'),
          '@entities': src('entities'),
          '@shared': src('shared'),
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    ],
    // .env → `@env` import (compile-time, native rebuild shart emas). Absolute path —
    // gradle build android/ cwd'dan chaqirsa ham .env topiladi.
    [
      'module:react-native-dotenv',
      { moduleName: '@env', path: path.resolve(__dirname, '.env'), safe: false, allowUndefined: true },
    ],
  ];

  // Native-only babel plugins — jest'da o'tkazib yuboriladi (mock'lar ishlatiladi).
  if (!isTest) {
    // Unistyles 3 — StyleSheet usage'ni `src` da qayta ishlaydi.
    plugins.push(['react-native-unistyles/plugin', { root: 'src' }]);
    // Reanimated 4 — worklets plugin oxirgi bo'lishi SHART.
    plugins.push('react-native-worklets/plugin');
  }

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins,
  };
};
