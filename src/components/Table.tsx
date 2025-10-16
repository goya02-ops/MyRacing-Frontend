// Tremor Table [v1.0.0]

import React from 'react';

import { cx } from '../lib/utils';

const TableRoot = ({
  ref: forwardedRef,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.RefObject<HTMLDivElement | null>;
}) => (
  <div
    ref={forwardedRef}
    // Activate if table is used in a float environment
    // className="flow-root"
  >
    <div
      // make table scrollable on mobile
      className={cx('w-full overflow-auto whitespace-nowrap', className)}
      {...props}
    >
      {children}
    </div>
  </div>
);

TableRoot.displayName = 'TableRoot';

const Table = ({
  ref: forwardedRef,
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement> & {
  ref?: React.RefObject<HTMLTableElement | null>;
}) => (
  <table
    ref={forwardedRef}
    tremor-id="tremor-raw"
    className={cx(
      // base
      'w-full caption-bottom border-b',
      // border color
      'border-gray-200 dark:border-gray-800',
      className
    )}
    {...props}
  />
);

Table.displayName = 'Table';

const TableHead = ({
  ref: forwardedRef,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement | null>;
}) => <thead ref={forwardedRef} className={cx(className)} {...props} />;

TableHead.displayName = 'TableHead';

const TableHeaderCell = ({
  ref: forwardedRef,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.RefObject<HTMLTableCellElement | null>;
}) => (
  <th
    ref={forwardedRef}
    className={cx(
      // base
      'border-b px-4 py-3.5 text-left text-sm font-semibold',
      // text color
      'text-gray-900 dark:text-gray-50',
      // border color
      'border-gray-200 dark:border-gray-800',
      className
    )}
    {...props}
  />
);

TableHeaderCell.displayName = 'TableHeaderCell';

const TableBody = ({
  ref: forwardedRef,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement | null>;
}) => (
  <tbody
    ref={forwardedRef}
    className={cx(
      // base
      'divide-y',
      // divide color
      'divide-gray-200 dark:divide-gray-800',
      className
    )}
    {...props}
  />
);

TableBody.displayName = 'TableBody';

const TableRow = ({
  ref: forwardedRef,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  ref?: React.RefObject<HTMLTableRowElement | null>;
}) => (
  <tr
    ref={forwardedRef}
    className={cx(
      '[&_td:last-child]:pr-4 [&_th:last-child]:pr-4',
      '[&_td:first-child]:pl-4 [&_th:first-child]:pl-4',
      className
    )}
    {...props}
  />
);

TableRow.displayName = 'TableRow';

const TableCell = ({
  ref: forwardedRef,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.RefObject<HTMLTableCellElement | null>;
}) => (
  <td
    ref={forwardedRef}
    className={cx(
      // base
      'p-4 text-sm',
      // text color
      'text-gray-600 dark:text-gray-400',
      className
    )}
    {...props}
  />
);

TableCell.displayName = 'TableCell';

const TableFoot = ({
  ref: forwardedRef,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.RefObject<HTMLTableSectionElement | null>;
}) => {
  return (
    <tfoot
      ref={forwardedRef}
      className={cx(
        // base
        'border-t text-left font-medium',
        // text color
        'text-gray-900 dark:text-gray-50',
        // border color
        'border-gray-200 dark:border-gray-800',
        className
      )}
      {...props}
    />
  );
};

TableFoot.displayName = 'TableFoot';

const TableCaption = ({
  ref: forwardedRef,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement> & {
  ref?: React.RefObject<HTMLTableCaptionElement | null>;
}) => (
  <caption
    ref={forwardedRef}
    className={cx(
      // base
      'mt-3 px-3 text-center text-sm',
      // text color
      'text-gray-500 dark:text-gray-500',
      className
    )}
    {...props}
  />
);

TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
};
