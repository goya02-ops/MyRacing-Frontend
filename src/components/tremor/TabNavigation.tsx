// Tremor TabNavigation [v1.0.0]
import * as React from 'react';
import * as NavigationMenuPrimitives from '@radix-ui/react-navigation-menu';
import { cx, focusRing } from '../../lib/utils';

const TabNavigation = ({
  ref: forwardedRef,
  className,
  children,
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitives.Root>,
  'orientation' | 'defaultValue' | 'dir'
> & {
  ref?: React.RefObject<React.ElementRef<
    typeof NavigationMenuPrimitives.Root
  > | null>;
}) => (
  <NavigationMenuPrimitives.Root
    ref={forwardedRef}
    {...props}
    tremor-id="tremor-raw"
    asChild={false}
  >
    <NavigationMenuPrimitives.List
      className={cx(
        // base
        'flex items-center justify-start whitespace-nowrap border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        // border color
        'border-orange-500 dark:border-orange-500',
        className
      )}
    >
      {children}
    </NavigationMenuPrimitives.List>
  </NavigationMenuPrimitives.Root>
);

TabNavigation.displayName = 'TabNavigation';

const TabNavigationLink = ({
  ref: forwardedRef,
  disabled,
  className,
  children,
  onClick,
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitives.Link>,
  'onSelect' | 'asChild'
> & { disabled?: boolean } & {
  ref?: React.RefObject<React.ElementRef<
    typeof NavigationMenuPrimitives.Link
  > | null>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => (
  <NavigationMenuPrimitives.Item className="flex" aria-disabled={disabled}>
    <NavigationMenuPrimitives.Link
      aria-disabled={disabled}
      className={cx(
        'group relative flex shrink-0 select-none items-center justify-center',
        disabled ? 'pointer-events-none' : ''
      )}
      ref={forwardedRef}
      onSelect={() => {}}
      asChild
      {...props}
    >
      <button type="button" onClick={onClick}>
        <span
          className={cx(
            // base
            '-mb-px flex items-center justify-center whitespace-nowrap border-b-2 px-3 pb-2 font-medium transition-all',
            // text color por defecto
            'text-gray-50 dark:text-gray-50',
            // border por defecto
            'border-transparent',
            // hover solo para NO activos - usando has para verificar si el padre tiene data-active
            'group-has-[:not([data-active])]:group-hover:text-orange-400',
            'group-has-[:not([data-active])]:group-hover:border-orange-400',
            'group-has-[:not([data-active])]:dark:group-hover:text-orange-400',
            'group-has-[:not([data-active])]:dark:group-hover:border-orange-400',
            // Si el approach anterior no funciona, usar esto:
            'group-[[data-active]]:group-hover:!text-orange-500',
            'group-[[data-active]]:group-hover:!border-orange-500',
            // selected
            'group-data-[active]:border-orange-500 group-data-[active]:text-orange-500',
            'dark:group-data-[active]:border-orange-500 dark:group-data-[active]:text-orange-500',
            // disabled
            disabled
              ? 'pointer-events-none text-gray-300 dark:text-gray-700'
              : '',
            focusRing,
            className
          )}
        >
          {children}
        </span>
      </button>
    </NavigationMenuPrimitives.Link>
  </NavigationMenuPrimitives.Item>
);

TabNavigationLink.displayName = 'TabNavigationLink';

export { TabNavigation, TabNavigationLink };
