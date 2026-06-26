import { useEffect, useState } from 'react';
import {
  elapsedMs,
  isComplete,
  progress as calcProgress,
  useSessionStore,
  type ActiveSession,
} from '@entities/session';

export interface SessionTimer {
  session: ActiveSession | undefined;
  elapsed: number;
  progress: number;
  complete: boolean;
  running: boolean;
}

// Sessiya jonli holatini kuzatadi. Tick faqat running paytida (250ms — ring
// silliq to'ladi, battery tejaladi). Vaqt timestamp'dan, setInterval drift'siz.
export function useSessionTimer(sessionId: string | undefined): SessionTimer {
  const session = useSessionStore((s) =>
    sessionId ? s.active.find((x) => x.id === sessionId) : undefined,
  );
  const running = session?.runningSince != null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = session ? elapsedMs(session, now) : 0;
  return {
    session,
    elapsed,
    progress: session ? calcProgress(elapsed, session.targetMin) : 0,
    complete: session ? isComplete(elapsed, session.targetMin) : false,
    running: !!running,
  };
}
