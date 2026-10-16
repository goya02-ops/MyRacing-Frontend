import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RaceFilterPanel from './RaceFilterPanel';
import { UserRacesFilterProvider } from '../../../context/UserRacesFilterContext.tsx';

function renderPanel(
  overrides: Partial<{ minFinishPosition: number | ''; raceDateFrom: string }> = {},
) {
  const value = {
    minFinishPosition: overrides.minFinishPosition ?? '',
    setMinFinishPosition: vi.fn(),
    raceDateFrom: overrides.raceDateFrom ?? '',
    setRaceDateFrom: vi.fn(),
  };

  const view = render(
    <UserRacesFilterProvider value={value}>
      <RaceFilterPanel />
    </UserRacesFilterProvider>,
  );
  return { value, container: view.container };
}

describe('RaceFilterPanel (BE #65: consume filtro via contexto)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('al cambiar la posición máxima, llama a setMinFinishPosition con número', async () => {
    const { value } = renderPanel();

    await userEvent.selectOptions(screen.getByRole('combobox'), '1');

    expect(value.setMinFinishPosition).toHaveBeenCalledWith(1);
  });

  it('al cambiar la fecha, llama a setRaceDateFrom', () => {
    const { value, container } = renderPanel();

    const input = container.querySelector('input[type="date"]')!;
    fireEvent.change(input, { target: { value: '2026-01-01' } });

    expect(value.setRaceDateFrom).toHaveBeenCalledWith('2026-01-01');
  });

  it('el botón de limpiar fecha llama a setRaceDateFrom("") cuando hay fecha', async () => {
    const { value } = renderPanel({ raceDateFrom: '2026-01-01' });

    await userEvent.click(screen.getByLabelText('Limpiar filtro de fecha'));

    expect(value.setRaceDateFrom).toHaveBeenCalledWith('');
  });
});
