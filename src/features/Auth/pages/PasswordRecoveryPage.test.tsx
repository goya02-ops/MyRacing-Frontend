import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock de authService: reexportamos real para no romper build, pero sobrescribimos forgotPassword
vi.mock('../../../services/authService', async () => {
  const actual = await vi.importActual<typeof import('../../../services/authService')>(
    '../../../services/authService'
  );
  return {
    ...actual,
    forgotPassword: vi.fn(),
  };
});

import * as authService from '../../../services/authService';
import PasswordRecoveryPage from './PasswordRecoveryPage';

describe('PasswordRecoveryPage', () => {
  afterEach(() => {
    // Desmonta los renders acumulados entre tests (evita el error de
    // "Found multiple elements" al reutilizar queries de screen).
    cleanup();
    vi.clearAllMocks();
  });

  it('al escribir email y submit, llama a forgotPassword con ese email', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' });

    render(
      <MemoryRouter>
        <PasswordRecoveryPage />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('tu@email.com');
    const button = screen.getByRole('button', { name: /enviar instrucciones/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('si forgotPassword lanza error, muestra el mensaje de error', async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValue(new Error('X'));

    render(
      <MemoryRouter>
        <PasswordRecoveryPage />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('tu@email.com');
    const button = screen.getByRole('button', { name: /enviar instrucciones/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('X')).toBeInTheDocument();
    });
  });

  it('si forgotPassword resuelve, muestra la vista de éxito "Email enviado"', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({ message: 'ok' });

    render(
      <MemoryRouter>
        <PasswordRecoveryPage />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('tu@email.com');
    const button = screen.getByRole('button', { name: /enviar instrucciones/i });

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Email enviado')).toBeInTheDocument();
    });
  });
});
