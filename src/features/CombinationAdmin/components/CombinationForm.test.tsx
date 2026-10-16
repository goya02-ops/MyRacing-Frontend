import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import CombinationForm from './CombinationForm';
import {
  CombinationAdminProvider,
  type CombinationAdminContextType,
} from '../../../context/CombinationAdminContext';
import {
  combinationFixture,
  makeCombinationAdminContextValue,
} from '../../../test/fixtures/combinationAdmin';

vi.mock('../../../services/apiService.ts', () => ({
  fetchOne: vi.fn().mockResolvedValue({ categories: [], circuits: [] }),
}));

function renderForm(
  overrides: Partial<CombinationAdminContextType> = {},
) {
  const value = makeCombinationAdminContextValue(overrides);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <CombinationAdminProvider value={value}>
        <CombinationForm />
      </CombinationAdminProvider>
    </QueryClientProvider>
  );

  return { value };
}

describe('CombinationForm (BE #66: sin props, form/onChange únicos)', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('renderiza todas las secciones del formulario', () => {
    renderForm({ editing: combinationFixture() });

    expect(screen.getByLabelText('1. Simulador')).toBeInTheDocument();
    expect(screen.getByLabelText('2. Categoría')).toBeInTheDocument();
    expect(screen.getByLabelText('3. Circuito')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha y Hora de Inicio')).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha y Hora de Fin')).toBeInTheDocument();
    expect(screen.getByLabelText('Número de Vueltas')).toBeInTheDocument();
    expect(screen.getByLabelText('Paradas Obligatorias')).toBeInTheDocument();
    expect(screen.getByLabelText('Intervalo (minutos)')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de Usuario')).toBeInTheDocument();
  });

  it('al enviar llama a handleSave del contexto con el estado del form', () => {
    const { value } = renderForm({ editing: combinationFixture() });

    const laps = screen.getByLabelText('Número de Vueltas');
    fireEvent.change(laps, { target: { value: '25' } });
    fireEvent.submit(screen.getByText('Guardar').closest('form')!);

    expect(vi.mocked(value.handleSave)).toHaveBeenCalledTimes(1);
    const saved = vi.mocked(value.handleSave).mock.calls[0][0];
    expect(saved.lapsNumber).toBe(25);
    expect(saved.dateFrom).toBe('2026-01-01T08:00');
    expect(saved.userType).toBe('Común');
  });

  it('al pulsar Cancelar llama a handleCancel del contexto', () => {
    const { value } = renderForm({ editing: combinationFixture() });

    fireEvent.click(screen.getByText('Cancelar'));

    expect(value.handleCancel).toHaveBeenCalledTimes(1);
  });

  it('el select de tipo de usuario renueva el form vía handleSelectChange', async () => {
    const { value } = renderForm({ editing: combinationFixture() });

    await userEvent.click(screen.getByLabelText('Tipo de Usuario'));
    await userEvent.click(screen.getByRole('option', { name: 'Premium' }));
    fireEvent.submit(screen.getByText('Guardar').closest('form')!);

    expect(vi.mocked(value.handleSave)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(value.handleSave).mock.calls[0][0].userType).toBe(
      'Premium',
    );
  });
});
