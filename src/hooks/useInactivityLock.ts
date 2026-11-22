import { useEffect, useRef } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes default

export function useInactivityLock(timeoutMs: number = INACTIVITY_TIMEOUT_MS) {
  const isUnlocked = useFinanceStore((state) => state.isUnlocked);
  const lockApp = useFinanceStore((state) => state.lockApp);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    // Only monitor inactivity when the app is actively unlocked
    if (!isUnlocked) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        // Double check time delta
        if (Date.now() - lastActivityRef.current >= timeoutMs) {
          lockApp();
        }
      }, timeoutMs);
    };

    // Throttle event listening to avoid excessive timer resets
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    const handleActivity = () => {
      if (!throttleTimer) {
        resetTimer();
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
        }, 1000); // 1s throttle
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Start initial timer
    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (throttleTimer) {
        clearTimeout(throttleTimer);
        throttleTimer = null;
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isUnlocked, timeoutMs, lockApp]);
}
