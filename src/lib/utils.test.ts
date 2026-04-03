import { describe, expect, it } from 'vitest';
import { cx } from './utils';

describe('cx', () => {
  it('merges conflicting tailwind utilities via tailwind-merge', () => {
    expect(cx('px-2', 'px-4')).toBe('px-4');
  });
});
