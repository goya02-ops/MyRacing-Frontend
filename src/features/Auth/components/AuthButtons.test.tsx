import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthButtons } from './AuthButtons';
import { logout as apiLogout } from '../../../services/authService';
import { User } from '../../../types/entities';

const contextLogout = vi.hoisted(() => vi.fn());
const auth = vi.hoisted(() => ({ user: null as User | null }));

vi.mock('../../../context/UserContext', () => ({
  useUser: () => ({
    user: auth.user,
    setUser: vi.fn(),
    logout: contextLogout,
  }),
}));

vi.mock('../../../services/authService', () => ({
  logout: vi.fn(),
}));

// El loading diferido se reemplaza por identidad para no depender de timers.
vi.mock('../../../hooks/useMinimumLoading', () => ({
  useMinimumLoading: (loading: boolean) => loading,
}));

const mockApiLogout = vi.mocked(apiLogout);

describe('AuthButtons (BE #55)', () => {
  beforeEach(() => {
    contextLogout.mockClear();
    mockApiLogout.mockReset();
    auth.user = { id: 1, userName: 'piloto' } as User;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('al hacer click en Cerrar Sesión cierra la sesión (botón vivo)', async () => {
    mockApiLogout.mockResolvedValue(undefined);

    render(<AuthButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /cerrar sesión/i }),
    );

    await waitFor(() => {
      expect(mockApiLogout).toHaveBeenCalledTimes(1);
    });
    expect(contextLogout).toHaveBeenCalledTimes(1);
  });

  it('sin usuario no renderiza el botón', () => {
    auth.user = null;

    render(<AuthButtons />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
