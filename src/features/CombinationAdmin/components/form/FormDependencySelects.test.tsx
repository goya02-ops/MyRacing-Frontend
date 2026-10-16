import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormDependencySelects } from './FormDependencySelects';
import { CombinationAdminProvider } from '../../../../context/CombinationAdminContext';
import {
  combinationFixture,
  makeCombinationAdminContextValue,
} from '../../../../test/fixtures/combinationAdmin';
import type { CombinationAdminContextType } from '../../../../context/CombinationAdminContext';
import type {
  Category,
  CategoryVersion,
  Circuit,
  CircuitVersion,
  Combination,
} from '../../../../types/entities';

const categoryVersions: CategoryVersion[] = [
  {
    id: 10,
    status: 'Activa',
    category: {
      denomination: 'GT3',
      abbreviation: 'GT3',
      description: '',
    } as Category,
  } as CategoryVersion,
];

const circuitVersions: CircuitVersion[] = [
  {
    id: 20,
    status: 'Activa',
    circuit: {
      denomination: 'Interlagos',
      abbreviation: 'INT',
      description: '',
    } as Circuit,
  } as CircuitVersion,
];

function renderSelects(
  overrides: Partial<CombinationAdminContextType> = {},
  selectedSimulator: number | undefined = undefined,
  form: Combination = combinationFixture(),
) {
  const value = makeCombinationAdminContextValue(overrides);
  const props = {
    form,
    selectedSimulator,
    categoryVersions,
    circuitVersions,
    loadingVersions: false,
    onSimulatorChange: vi.fn(),
    onSelectChange: vi.fn(),
  };

  render(
    <CombinationAdminProvider value={value}>
      <FormDependencySelects {...props} />
    </CombinationAdminProvider>
  );

  return props;
}

describe('FormDependencySelects (BE #66: simulators desde el contexto)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('renderiza los simuladores del contexto y muestra el id de versión del form', () => {
    renderSelects();

    expect(screen.getByLabelText('1. Simulador')).toHaveTextContent(
      'Seleccione un simulador',
    );
    expect(screen.getByLabelText('2. Categoría')).toHaveTextContent(
      'GT3 (GT3) - Activa',
    );
    expect(screen.getByLabelText('3. Circuito')).toHaveTextContent(
      'Interlagos',
    );
  });

  it('las versiones quedan deshabilitadas sin simulador seleccionado', () => {
    renderSelects();

    expect(screen.getByLabelText('2. Categoría')).toBeDisabled();
    expect(screen.getByLabelText('3. Circuito')).toBeDisabled();
  });

  it('las versiones se habilitan con simulador y notifican el cambio', async () => {
    const props = renderSelects(
      {},
      1,
      combinationFixture({ categoryVersion: undefined }),
    );

    const category = screen.getByLabelText('2. Categoría');
    expect(category).toBeEnabled();

    await userEvent.click(category);
    await userEvent.click(
      screen.getByRole('option', { name: 'GT3 (GT3) - Activa' }),
    );

    expect(props.onSelectChange).toHaveBeenCalledWith('categoryVersion', '10');
  });

  it('el cambio de simulador se propaga', async () => {
    const props = renderSelects();

    await userEvent.click(screen.getByLabelText('1. Simulador'));
    await userEvent.click(screen.getByRole('option', { name: 'rFactor 2' }));

    expect(props.onSimulatorChange).toHaveBeenCalledWith('1');
  });

  it('el simulador queda deshabilitado mientras cargan las dependencias', () => {
    renderSelects({ loadingDependencies: true });

    expect(screen.getByLabelText('1. Simulador')).toBeDisabled();
  });
});
