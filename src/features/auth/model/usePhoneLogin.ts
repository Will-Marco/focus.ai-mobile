import { useState } from 'react';
import { normalizePhone } from '@shared/lib/phone/phone';
import type { AuthResult } from './auth';
import { loginWithPhone } from './phoneAuth';

/** Telefon + parol bilan kirish holati — yuklanish + xato kaliti (UI tarjima qiladi). */
export function usePhoneLogin() {
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const submit = async (rawPhone: string, password: string) => {
    setErrorKey(null);

    const phone = normalizePhone(rawPhone);
    if (!phone) {
      const res: AuthResult = { ok: false, errorKey: 'auth.err.phone.invalid' };
      setErrorKey(res.errorKey ?? null);
      return res;
    }

    setBusy(true);
    const res: AuthResult = await loginWithPhone(phone, password);
    setBusy(false);
    if (!res.ok || res.errorKey) setErrorKey(res.errorKey ?? null);
    return res;
  };

  return {
    busy,
    errorKey,
    clearError: () => setErrorKey(null),
    submit,
  };
}
