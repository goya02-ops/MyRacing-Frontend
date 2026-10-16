import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import VersionManager from './index';
import {
  SimulatorAdminProvider,
  type ActiveManager,
} from '../../context/SimulatorAdminContext.tsx';
import { Simulator } from '../../types/entities';

vi.mock('./hooks/useVersionManagerLogic', () => ({
  useVersionManagerLogic: () => ({
    categoryVersions: [],
    circuitVersions: [],
    editingVersion: null,
    isCreatingVersion: false,
    title: 'Categorías',
    isCategory: true,
    loading: false,
    isSaving: false,
    handleNewVersion: vi.fn(),
    handleEditVersion: vi.fn(),
    handleCancelVersion: vi.fn(),
    onSaveCategoryVersion: vi.fn(),
    onSaveCircuitVersion: vi.fn(),
  }),
}));

vi.mock('../SimulatorAdmin/hooks/useVersionDependencies', () => ({
  useVersionDependencies: () => ({
    categories: [],
    circuits: [],
    loadingDependencies: false,
  }),
}));

const simulator = { id: 7, name: 'iRacing', status: 'Activo' } as Simulator;

function renderManager(activeManager: ActiveManager) {
  const value = {
    simulators: [simulator],
    editingSimulator: null,
    isCreatingSimulator: false,
    activeManager,
    handleEditSimulator: vi.fn(),
    handleCancelSimulator: vi.fn(),
    handleToggleManager: vi.fn(),
    handleCloseManager: vi.fn(),
  };

  const { container } = render(
    <SimulatorAdminProvider value={value}>
      <VersionManager />
    </SimulatorAdminProvider>,
  );
  return { value, container };
}

describe('VersionManager (BE #64: contexto en lugar de props)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('sin simulador activo no renderiza nada', () => {
    const { container } = renderManager({ type: 'category', simulator: null });
    expect(container).toBeEmptyDOMElement();
  });

  it('Cerrar delega en handleCloseManager del contexto', async () => {
    const { value } = renderManager({ type: 'category', simulator });

    await userEvent.click(screen.getByRole('button', { name: /Cerrar/ }));

    expect(value.handleCloseManager).toHaveBeenCalledTimes(1);
  });
});
