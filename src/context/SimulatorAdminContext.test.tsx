import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import {
  SimulatorAdminProvider,
  useSimulatorAdminContext,
} from './SimulatorAdminContext.tsx';
import { Simulator } from '../types/entities';

const value = {
  simulators: [] as Simulator[],
  editingSimulator: null,
  isCreatingSimulator: false,
  activeManager: { type: null, simulator: null },
  handleEditSimulator: vi.fn(),
  handleCancelSimulator: vi.fn(),
  handleToggleManager: vi.fn(),
  handleCloseManager: vi.fn(),
};

describe('SimulatorAdminContext (BE #64)', () => {
  it('lanza si se usa fuera del provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSimulatorAdminContext())).toThrow(
      /SimulatorAdminProvider/,
    );
    spy.mockRestore();
  });

  it('entrega el value provisto dentro del provider', () => {
    const { result } = renderHook(() => useSimulatorAdminContext(), {
      wrapper: ({ children }) => (
        <SimulatorAdminProvider value={value}>{children}</SimulatorAdminProvider>
      ),
    });

    expect(result.current).toBe(value);
  });
});
