module.exports = api => {
  const isTest = api.env('test');
  api.cache.using(() => process.env.NODE_ENV);

  const plugins = [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@app': './src/app',
          '@screens': './src/screens',
          '@widgets': './src/widgets',
          '@features': './src/features',
          '@entities': './src/entities',
          '@shared': './src/shared',
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
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
