import { useEffect, useRef, useState } from 'react';

export function useMinimumLoading(loading: boolean, minDuration = 300) {
  const [visibleLoading, setVisibleLoading] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (loading) {
      // arranca el loading y registra el inicio (ref, sin re-render)
      startTimeRef.current = Date.now();
      timer = setTimeout(() => setVisibleLoading(true), 0);
    } else if (startTimeRef.current !== null) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = minDuration - elapsed;

      // mantenemos el loading hasta cumplir el mínimo, de forma diferida
      timer = setTimeout(
        () => setVisibleLoading(false),
        remaining > 0 ? remaining : 0
      );
    }

    return () => clearTimeout(timer);
  }, [loading, minDuration]);

  return visibleLoading;
}
