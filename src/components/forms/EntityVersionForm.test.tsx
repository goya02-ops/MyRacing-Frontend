import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EntityVersionForm, {
  type EntityVersionKind,
  type EntityVersionValues,
} from './EntityVersionForm';
import { Category, Circuit, Simulator } from '../../types/entities';

const categories = [
  { id: 10, denomination: 'GT3', abbreviation: 'GT3' } as Category,
];
const circuits = [
  { id: 20, denomination: 'Interlagos', abbreviation: 'INT' } as Circuit,
];

const simulator = { id: 1, name: 'rFactor 2' } as Simulator;

function renderForm(
  kind: EntityVersionKind,
  overrides: Partial<{
    initial: EntityVersionValues;
    isSaving: boolean;
  }> = {},
) {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  const initial: EntityVersionValues =
    kind === 'category'
      ? { id: 5, status: 'Activo', simulator, category: categories[0] }
      : { id: 5, status: 'Activo', simulator, circuit: circuits[0] };

  render(
    <EntityVersionForm
      kind={kind}
      initial={overrides.initial ?? initial}
      options={kind === 'category' ? categories : circuits}
      onSave={onSave}
      onCancel={onCancel}
      isSaving={overrides.isSaving}
    />,
  );

  return { onSave, onCancel };
}

describe('EntityVersionForm (BE #60: genérico category/circuit)', () => {
  afterEach(() => cleanup());

  it('kind=category etiqueta el enlace como Categoría', () => {
    renderForm('category');

    expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
    expect(screen.queryByLabelText('Circuito')).not.toBeInTheDocument();
  });

  it('kind=circuit etiqueta el enlace como Circuito', () => {
    renderForm('circuit');

    expect(screen.getByLabelText('Circuito')).toBeInTheDocument();
    expect(screen.queryByLabelText('Categoría')).not.toBeInTheDocument();
  });

  it('muestra la opción recibida como valor seleccionado del enlace', () => {
    renderForm('category');

    expect(screen.getByLabelText('Categoría')).toHaveTextContent('GT3 (GT3)');
  });

  it('muestra el nombre del simulador en un input de solo lectura', () => {
    renderForm('category');

    const simulatorInput = screen.getByLabelText('Simulador');
    expect(simulatorInput).toHaveValue('rFactor 2');
    expect(simulatorInput).toBeDisabled();
    expect(simulatorInput).toHaveAttribute('readonly');
  });

  it('al cambiar el enlace guarda el id como número', async () => {
    const { onSave } = renderForm('category', {
      initial: { id: 5, status: 'Activo', simulator },
    });

    await userEvent.click(screen.getByLabelText('Categoría'));
    await userEvent.click(screen.getByRole('option', { name: 'GT3 (GT3)' }));
    fireEvent.submit(screen.getByText('Guardar').closest('form')!);

    expect(onSave.mock.calls[0][0]).toMatchObject({
      id: 5,
      status: 'Activo',
      category: 10,
    });
  });

  it('al cambiar el estado se refleja en el guardado', async () => {
    const { onSave } = renderForm('circuit');

    await userEvent.click(screen.getByLabelText('Estado'));
    await userEvent.click(screen.getByRole('option', { name: 'Inactivo' }));
    fireEvent.submit(screen.getByText('Guardar').closest('form')!);

    expect(onSave.mock.calls[0][0]).toMatchObject({
      status: 'Inactivo',
      circuit: circuits[0],
    });
  });

  it('con isSaving deshabilita los controles y cambia el texto del botón', () => {
    renderForm('category', { isSaving: true });

    expect(screen.getByText('Guardando...')).toBeDisabled();
    expect(screen.getByText('Cancelar')).toBeDisabled();
    expect(screen.getByLabelText('Categoría')).toBeDisabled();
    expect(screen.getByLabelText('Estado')).toBeDisabled();
  });

  it('el botón Cancelar llama a onCancel', () => {
    const { onCancel } = renderForm('category');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
