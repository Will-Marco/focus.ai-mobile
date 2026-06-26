module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['boundaries'],
  settings: {
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
    },
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app/*' },
      { type: 'screens', pattern: 'src/screens/*' },
      { type: 'widgets', pattern: 'src/widgets/*' },
      { type: 'features', pattern: 'src/features/*' },
      { type: 'entities', pattern: 'src/entities/*' },
      { type: 'shared', pattern: 'src/shared/*' },
    ],
    'boundaries/ignore': ['**/*.test.*', '**/*.spec.*'],
  },
  rules: {
    'boundaries/dependencies': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            from: ['app'],
            allow: ['screens', 'widgets', 'features', 'entities', 'shared'],
          },
          {
            from: ['screens'],
            allow: ['widgets', 'features', 'entities', 'shared'],
          },
          { from: ['widgets'], allow: ['features', 'entities', 'shared'] },
          { from: ['features'], allow: ['entities', 'shared'] },
          { from: ['entities'], allow: ['shared'] },
          { from: ['shared'], allow: ['shared'] },
        ],
      },
    ],
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'vendor/',
    'Pods/',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    '.eslintrc.js',
    '.prettierrc.js',
  ],
};
