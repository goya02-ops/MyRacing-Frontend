import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { FormDatePickers } from './FormDatePickers';

const form = { dateFrom: '2026-01-01T08:00', dateTo: '2026-01-31T18:00' };

describe('FormDatePickers (BE #66: objeto form único, sin renombres)', () => {
  afterEach(() => cleanup());

  it('lee dateFrom y dateTo del objeto form', () => {
    render(<FormDatePickers form={form} onInputChange={vi.fn()} />);

    expect(screen.getByLabelText('Fecha y Hora de Inicio')).toHaveValue(
      '2026-01-01T08:00',
    );
    expect(screen.getByLabelText('Fecha y Hora de Fin')).toHaveValue(
      '2026-01-31T18:00',
    );
  });

  it('propaga el evento a onChange con el name del input', () => {
    const onInputChange = vi.fn();
    render(<FormDatePickers form={form} onInputChange={onInputChange} />);

    fireEvent.change(screen.getByLabelText('Fecha y Hora de Fin'), {
      target: { value: '2026-02-15T10:00' },
    });

    expect(onInputChange).toHaveBeenCalledTimes(1);
    expect(onInputChange.mock.calls[0][0].target.name).toBe('dateTo');
  });
});
