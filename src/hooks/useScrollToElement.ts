import { useEffect, useRef } from 'react';

const defaultOptions: ScrollIntoViewOptions = {
  behavior: 'smooth',
  block: 'nearest',
};

export function useScrollToElement<T extends HTMLElement>(
  trigger: any,
  options: ScrollIntoViewOptions = defaultOptions
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (trigger && elementRef.current) {
      elementRef.current.scrollIntoView(options);
    }
  }, [trigger, options]);

  return elementRef;
}
