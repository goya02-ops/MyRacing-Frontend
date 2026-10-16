import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SimulatorRow } from './SimulatorRow';
import {
  SimulatorAdminProvider,
  type ActiveManager,
} from '../../../context/SimulatorAdminContext.tsx';
import { Simulator } from '../../../types/entities';

// El manager es lazy: se identifica por un texto fijo.
vi.mock('../../../features/VersionManager', () => ({
  default: () => <div>VERSION MANAGER</div>,
}));

const simulator = { id: 7, name: 'iRacing', status: 'Activo' } as Simulator;

function renderRow(overrides: {
  editingSimulator?: Simulator | null;
  isCreatingSimulator?: boolean;
  activeManager?: ActiveManager;
} = {}) {
  const value = {
    simulators: [simulator],
    editingSimulator: overrides.editingSimulator ?? null,
    isCreatingSimulator: overrides.isCreatingSimulator ?? false,
    activeManager:
      overrides.activeManager ?? ({ type: null, simulator: null } as ActiveManager),
    handleEditSimulator: vi.fn(),
    handleCancelSimulator: vi.fn(),
    handleToggleManager: vi.fn(),
    handleCloseManager: vi.fn(),
  };

  const ui: ReactNode = (
    <table>
      <tbody>
        <SimulatorRow simulator={simulator} />
      </tbody>
    </table>
  );

  render(<SimulatorAdminProvider value={value}>{ui}</SimulatorAdminProvider>);
  return value;
}

describe('SimulatorRow (BE #64: contexto en lugar de props)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('Editar dispara handleEditSimulator con el simulador de la fila', async () => {
    const value = renderRow();

    await userEvent.click(screen.getByRole('button', { name: /^Editar$/ }));

    expect(value.handleEditSimulator).toHaveBeenCalledWith(simulator);
  });

  it('Ver Cat. dispara handleToggleManager con el tipo category', async () => {
    const value = renderRow();

    await userEvent.click(screen.getByRole('button', { name: /Ver Cat\./ }));

    expect(value.handleToggleManager).toHaveBeenCalledWith(simulator, 'category');
  });

  it('si esta fila se está editando, muestra Cancelar y llama handleCancelSimulator', async () => {
    const value = renderRow({ editingSimulator: simulator });

    await userEvent.click(screen.getByRole('button', { name: /Cancelar/ }));

    expect(value.handleCancelSimulator).toHaveBeenCalledTimes(1);
  });

  it('si el manager de categorías está abierto, muestra Ocultar y monta VersionManager', async () => {
    renderRow({
      activeManager: { type: 'category', simulator },
    });

    expect(screen.getByRole('button', { name: /Ocultar Cat\./ })).toBeInTheDocument();
    expect(await screen.findByText('VERSION MANAGER')).toBeInTheDocument();
  });
});
