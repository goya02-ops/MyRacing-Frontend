import { useEffect, useState } from 'react';

export function useMinimumLoading(loading: boolean, minDuration = 300) {
  const [visibleLoading, setVisibleLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (loading) {
      // arranca el loading inmediatamente
      setVisibleLoading(true);
      setStartTime(Date.now());
    } else if (startTime) {
      const elapsed = Date.now() - startTime;
      const remaining = minDuration - elapsed;

      if (remaining > 0) {
        // mantenemos el loading hasta cumplir los 300ms
        timer = setTimeout(() => setVisibleLoading(false), remaining);
      } else {
        setVisibleLoading(false);
      }
    }

    return () => clearTimeout(timer);
  }, [loading, minDuration, startTime]);

  return visibleLoading;
}
