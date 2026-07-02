import { useState } from 'react';
import { signInWithGoogle, type AuthResult } from './auth';

/** Auth holati — yuklanish + xato kaliti (UI tarjima qiladi). Faqat Google OAuth. */
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
    submitGoogle: () => run(signInWithGoogle),
  };
}
