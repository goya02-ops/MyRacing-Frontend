// Tremor Card [v1.0.0]

import React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cx } from '../../lib/utils.ts';

interface CardProps extends React.ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
}

const Card = ({
  ref,
  className,
  asChild,
  ...props
}: CardProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const Component = asChild ? Slot : 'div';
  return (
    <Component
      ref={ref}
      className={cx(
        // base
        'relative w-full rounded-lg border p-6 text-left shadow-xs',
        // background color
        'bg-neutral-800 ',
        // border color
        'border-b-sky-950 dark:border-gray-900',
        className
      )}
      tremor-id="tremor-raw"
      {...props}
    />
  );
};

Card.displayName = 'Card';

export { Card, type CardProps };
