import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import CombinationList from './CombinationList';
import { CombinationAdminProvider } from '../../../context/CombinationAdminContext';
import {
  makeCombinationAdminContextValue,
} from '../../../test/fixtures/combinationAdmin';
import type { CombinationAdminContextType } from '../../../context/CombinationAdminContext';

vi.mock('../components/CombinationForm', () => ({
  default: () => <div>COMBINATION FORM</div>,
}));

function renderList(
  overrides: Partial<CombinationAdminContextType> = {},
) {
  const value = makeCombinationAdminContextValue(overrides);
  render(
    <CombinationAdminProvider value={value}>
      <CombinationList />
    </CombinationAdminProvider>
  );
  return { value };
}

describe('CombinationList (BE #66: sin props, lee del contexto)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('renderiza las filas del contexto sin recibir ninguna prop', () => {
    renderList();

    expect(screen.getByText('rFactor 2')).toBeInTheDocument();
    expect(screen.getByText('GT3')).toBeInTheDocument();
    expect(screen.getByText('Interlagos')).toBeInTheDocument();
    expect(screen.getByText('V: 10')).toBeInTheDocument();
    expect(screen.getByText('P: 1')).toBeInTheDocument();
    expect(screen.getByText('COMÚN')).toBeInTheDocument();
  });

  it('al pulsar Editar llama a handleEditCombination del contexto', () => {
    const { value } = renderList();

    fireEvent.click(screen.getByText('Editar'));

    expect(value.handleEditCombination).toHaveBeenCalledWith(
      value.filteredList[0],
    );
  });

  it('cuando la fila está en edición, muestra Cancelar y el formulario', async () => {
    const combination = makeCombinationAdminContextValue().filteredList[0];
    renderList({ editing: combination, isCreating: false });

    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Editar Combinación')).toBeInTheDocument();
    expect(await screen.findByText('COMBINATION FORM')).toBeInTheDocument();
  });

  it('en modo creación no expande el formulario en las filas', () => {
    const combination = makeCombinationAdminContextValue().filteredList[0];
    renderList({ editing: combination, isCreating: true });

    expect(screen.queryByText('Editar Combinación')).not.toBeInTheDocument();
    expect(screen.getAllByText('Editar')).toHaveLength(1);
  });

  it('al pulsar Cancelar en la fila en edición llama a handleCancel', () => {
    const combination = makeCombinationAdminContextValue().filteredList[0];
    const { value } = renderList({ editing: combination, isCreating: false });

    fireEvent.click(screen.getByText('Cancelar'));

    expect(value.handleCancel).toHaveBeenCalledTimes(1);
  });
});
