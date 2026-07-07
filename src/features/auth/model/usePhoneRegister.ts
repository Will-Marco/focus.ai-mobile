import { useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { normalizePhone } from '@shared/lib/phone/phone';
import { checkRegisterStatus, registerCompletePhone, registerInitPhone } from './phoneAuth';

const POLL_INTERVAL_MS = 2500;

export type PhoneRegisterStep = 'form' | 'waiting' | 'done';

/**
 * Telefon + parol ro'yxatdan o'tish, Telegram bot orqali tasdiqlash bilan.
 * form → (register-init) → waiting (deeplink + polling) → (register-complete) → done.
 */
export function usePhoneRegister() {
  const [step, setStep] = useState<PhoneRegisterStep>('form');
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [botDeeplink, setBotDeeplink] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  const startPolling = (token: string, phone: string, password: string) => {
    pollRef.current = setInterval(async () => {
      const status = await checkRegisterStatus(token);
      if (status.expired) {
        stopPolling();
        setErrorKey('auth.err.phone.expired');
        setStep('form');
        return;
      }
      if (!status.verified) return;

      stopPolling();
      const res = await registerCompletePhone(token, phone, password);
      if (!res.ok) {
        setErrorKey(res.errorKey ?? 'auth.err.phone.generic');
        setStep('form');
        return;
      }
      setStep('done');
    }, POLL_INTERVAL_MS);
  };

  const submit = async (rawPhone: string, password: string, confirmPassword: string) => {
    setErrorKey(null);

    const phone = normalizePhone(rawPhone);
    if (!phone) return setErrorKey('auth.err.phone.invalid');
    if (password.length < 6) return setErrorKey('auth.err.phone.weakPassword');
    if (password !== confirmPassword) return setErrorKey('auth.err.phone.mismatch');

    setBusy(true);
    const res = await registerInitPhone(phone);
    setBusy(false);

    if (!res.ok || !res.registerToken || !res.botDeeplink) {
      setErrorKey(res.errorKey ?? 'auth.err.phone.generic');
      return;
    }

    setBotDeeplink(res.botDeeplink);
    setStep('waiting');
    startPolling(res.registerToken, phone, password);
  };

  const openBot = () => {
    if (botDeeplink) Linking.openURL(botDeeplink).catch(() => setErrorKey('auth.err.phone.generic'));
  };

  const cancel = () => {
    stopPolling();
    setStep('form');
    setErrorKey(null);
    setBotDeeplink(null);
  };

  return { step, busy, errorKey, botDeeplink, submit, openBot, cancel, clearError: () => setErrorKey(null) };
}
