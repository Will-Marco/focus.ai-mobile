import { act, renderHook } from '@testing-library/react-native';
import { usePhoneLogin } from './usePhoneLogin';
import { loginWithPhone } from './phoneAuth';

jest.mock('./phoneAuth', () => ({
  loginWithPhone: jest.fn(),
}));

const mockedLoginWithPhone = loginWithPhone as jest.MockedFunction<typeof loginWithPhone>;

describe('usePhoneLogin', () => {
  beforeEach(() => {
    mockedLoginWithPhone.mockReset();
  });

  // Regression: submit maskalangan ("90 123 45 67") yoki 998-kodli raqamni to'g'ridan-to'g'ri
  // Supabase'ga yuborardi (E.164'ga normalizatsiya qilmasdan) — signInWithPassword mos kelmagan
  // "phone" bilan doim "noto'g'ri" xato qaytarardi, garchi parol to'g'ri bo'lsa ham.
  it("maskalangan raqamni E.164'ga normalizatsiya qilib yuboradi", async () => {
    mockedLoginWithPhone.mockResolvedValue({ ok: true });
    const { result } = await renderHook(() => usePhoneLogin());

    await act(async () => {
      await result.current.submit('99 658 44 32', '123456');
    });

    expect(mockedLoginWithPhone).toHaveBeenCalledWith('+998996584432', '123456');
  });

  it('yaroqsiz raqamda tarmoqqa chaqiruv qilmasdan xato qaytaradi', async () => {
    const { result } = await renderHook(() => usePhoneLogin());

    let res;
    await act(async () => {
      res = await result.current.submit('123', 'anypass');
    });

    expect(mockedLoginWithPhone).not.toHaveBeenCalled();
    expect(res).toEqual({ ok: false, errorKey: 'auth.err.phone.invalid' });
    expect(result.current.errorKey).toBe('auth.err.phone.invalid');
  });
});
