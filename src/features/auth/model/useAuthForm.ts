import { useState } from 'react';
import { signInWithEmail, signInWithGoogle, signUpWithEmail, type AuthResult } from './auth';

type Mode = 'signin' | 'signup';

/** Auth forma holati — yuklanish + xato kaliti (UI tarjima qiladi). */
export function useAuthForm() {
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const run = async (fn: () => Promise<AuthResult>) => {
    setBusy(true);
    setErrorKey(null);
    const res = await fn();
    setBusy(false);
    if (!res.ok || res.errorKey) setErrorKey(res.errorKey ?? null);
    return res;
  };

  return {
    busy,
    errorKey,
    clearError: () => setErrorKey(null),
    submitEmail: (mode: Mode, email: string, password: string) =>
      run(() => (mode === 'signin' ? signInWithEmail(email, password) : signUpWithEmail(email, password))),
    submitGoogle: () => run(signInWithGoogle),
  };
}
