/* eslint-env jest */

// Unistyles native modulini test uchun mock qilamiz (light tema bilan).
jest.mock('react-native-unistyles', () => require('./jest/unistyles.mock.js'));

// LinearGradient — testда oddiy host komponent.
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// nitro-haptics — testда no-op (lazy require xato bermasin).
jest.mock('react-native-nitro-haptics', () => ({
  Haptics: { impact: jest.fn(), notification: jest.fn(), selection: jest.fn() },
}));

// nitro-sensors — testда sensor mavjud emas (hook no-op qiladi).
jest.mock('react-native-nitro-sensors', () => {
  const sensor = {
    isAvailable: false,
    isObserving: false,
    startObserving: jest.fn(),
    stopObserving: jest.fn(),
  };
  return {
    Sensors: {
      createDeviceMotion: () => sensor,
      createAccelerometer: () => sensor,
    },
    useAccelerometer: () => ({ reading: undefined, error: undefined, isAvailable: false, isObserving: false }),
    useDeviceMotion: () => ({ reading: undefined, error: undefined, isAvailable: false, isObserving: false }),
  };
});
