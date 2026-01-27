import {useEffect, useLayoutEffect, useRef} from 'react';

interface UseIdleTimeoutOptions {
  timeout: number;
  onIdle: () => void;
  onActive?: () => void;
  enabled?: boolean;
}

/**
 * Hook that triggers a callback after the page has been hidden for a specified duration.
 * Useful for disconnecting resources when users leave the tab idle.
 */
export function useIdleTimeout({timeout, onIdle, onActive, enabled = true}: UseIdleTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);
  const onActiveRef = useRef(onActive);

  useLayoutEffect(() => {
    onIdleRef.current = onIdle;
    onActiveRef.current = onActive;
  });

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        timeoutRef.current = setTimeout(() => {
          onIdleRef.current();
        }, timeout);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        onActiveRef.current?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeout, enabled]);
}
