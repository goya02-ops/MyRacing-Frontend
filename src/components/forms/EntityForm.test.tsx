import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import EntityForm, { type EntityFormValues } from './EntityForm';

const initial: EntityFormValues = {
  id: 1,
  denomination: 'GT3',
  abbreviation: 'GT3',
  description: 'Clase GT',
};

function renderForm(kind: 'category' | 'circuit') {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  render(
    <EntityForm kind={kind} initial={initial} onSave={onSave} onCancel={onCancel} />,
  );
  return { onSave, onCancel };
}

describe('EntityForm (BE #60: genérico category/circuit)', () => {
  afterEach(() => cleanup());

  it('usa los placeholders propios de kind=category', () => {
    renderForm('category');

    expect(
      screen.getByPlaceholderText('Ej: Turismo Carretera'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: TC')).toBeInTheDocument();
  });

  it('usa los placeholders propios de kind=circuit', () => {
    renderForm('circuit');

    expect(
      screen.getByPlaceholderText('Ej: Autódromo Juan y Oscar Gálvez'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: BA GP')).toBeInTheDocument();
  });

  it('muestra los valores iniciales en los tres campos', () => {
    renderForm('category');

    expect(screen.getByLabelText('Denominación')).toHaveValue('GT3');
    expect(screen.getByLabelText('Abreviación')).toHaveValue('GT3');
    expect(screen.getByLabelText('Descripción')).toHaveValue('Clase GT');
  });

  it('al guardar devuelve la entidad con las ediciones', () => {
    const { onSave } = renderForm('category');

    fireEvent.change(screen.getByLabelText('Denominación'), {
      target: { value: 'Turismo Nacional' },
    });
    fireEvent.submit(screen.getByText('Guardar').closest('form')!);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toMatchObject({
      id: 1,
      denomination: 'Turismo Nacional',
      abbreviation: 'GT3',
      description: 'Clase GT',
    });
  });

  it('el botón Cancelar llama a onCancel', () => {
    const { onCancel } = renderForm('circuit');

    fireEvent.click(screen.getByText('Cancelar'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
