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
        // base (sin cambios)
        'relative w-full rounded-lg border p-6 text-left shadow-xs',
        
        // ✅ CAMBIO 1: Fondo con opacidad
        // Usamos el mismo gris oscuro, pero con un 20% de opacidad.
        'bg-gray-950/20',
        
        // ✅ CAMBIO 2: La magia del efecto vidrio (desenfoca lo que está detrás)
        'backdrop-blur-lg',
        
        // ✅ CAMBIO 3: Borde sutil y semitransparente para definir los bordes
        'border-gray-700/50',
        
        className
      )}
      tremor-id="tremor-raw"
      {...props}
    />
  );
};

Card.displayName = 'Card';

export { Card, type CardProps };