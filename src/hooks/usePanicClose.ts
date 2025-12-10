import { useEffect, useRef, useCallback } from 'react';

export const usePanicClose = (onPanic: () => void) => {
  const escPressCount = useRef(0);
  const escTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      escPressCount.current += 1;

      if (escTimeout.current) {
        clearTimeout(escTimeout.current);
      }

      if (escPressCount.current >= 2) {
        escPressCount.current = 0;
        onPanic();
        // Clear everything and redirect
        sessionStorage.clear();
        localStorage.removeItem('shareroom_username');
        window.location.href = 'https://www.google.com';
      } else {
        escTimeout.current = setTimeout(() => {
          escPressCount.current = 0;
        }, 500);
      }
    }
  }, [onPanic]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (escTimeout.current) {
        clearTimeout(escTimeout.current);
      }
    };
  }, [handleKeyDown]);
};
