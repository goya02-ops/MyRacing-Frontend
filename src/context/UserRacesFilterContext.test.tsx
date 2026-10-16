import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import {
  UserRacesFilterProvider,
  useUserRacesFilter,
} from './UserRacesFilterContext.tsx';

const value = {
  minFinishPosition: '' as number | '',
  setMinFinishPosition: vi.fn(),
  raceDateFrom: '',
  setRaceDateFrom: vi.fn(),
};

describe('UserRacesFilterContext (BE #65)', () => {
  it('lanza si se usa fuera del provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useUserRacesFilter())).toThrow(
      /UserRacesFilterProvider/,
    );
    spy.mockRestore();
  });

  it('entrega el value provisto dentro del provider', () => {
    const { result } = renderHook(() => useUserRacesFilter(), {
      wrapper: ({ children }) => (
        <UserRacesFilterProvider value={value}>
          {children}
        </UserRacesFilterProvider>
      ),
    });

    expect(result.current).toBe(value);
  });
});
