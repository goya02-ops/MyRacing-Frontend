import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { FormConfigInputs } from './FormConfigInputs';

const form = {
  lapsNumber: 10,
  obligatoryStopsQuantity: 1,
  raceIntervalMinutes: 30,
};

describe('FormConfigInputs (BE #66: objeto form único, sin renombres)', () => {
  afterEach(() => cleanup());

  it('lee los valores del objeto form', () => {
    render(<FormConfigInputs form={form} onInputChange={vi.fn()} />);

    expect(screen.getByLabelText('Número de Vueltas')).toHaveValue(10);
    expect(screen.getByLabelText('Paradas Obligatorias')).toHaveValue(1);
    expect(screen.getByLabelText('Intervalo (minutos)')).toHaveValue(30);
  });

  it('propaga el evento a onChange con el name del input', () => {
    const onInputChange = vi.fn();
    render(<FormConfigInputs form={form} onInputChange={onInputChange} />);

    fireEvent.change(screen.getByLabelText('Número de Vueltas'), {
      target: { value: '25' },
    });

    expect(onInputChange).toHaveBeenCalledTimes(1);
    expect(onInputChange.mock.calls[0][0].target.name).toBe('lapsNumber');
  });
});
