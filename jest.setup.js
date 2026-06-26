/* eslint-env jest */

// Unistyles native modulini test uchun mock qilamiz (light tema bilan).
jest.mock('react-native-unistyles', () => require('./jest/unistyles.mock.js'));

// LinearGradient — testда oddiy host komponent.
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
