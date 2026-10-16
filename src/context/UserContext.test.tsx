import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { UserProvider, useUser } from './UserContext';
import { API_BASE_URL } from '../services/apiClient';

// fetch mockeado: el logout real hace un POST best-effort a /auth/logout.
const mockFetch = vi.fn();

function Consumer() {
  const { user, logout } = useUser();
  return (
    <div>
      <span data-testid="user">{user ? user.userName : 'anon'}</span>
      <button
        onClick={() => {
          void logout();
        }}
      >
        Salir
      </button>
    </div>
  );
}

function renderWithProviders() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Consumer />
      </UserProvider>
    </QueryClientProvider>,
  );
}

describe('UserContext logout (BE #73)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    } as unknown as Response);
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('revoca el grant: POST /auth/logout con el refresh guardado y limpia la sesión', async () => {
    localStorage.setItem('accessToken', 'access-1');
    localStorage.setItem('refreshToken', 'refresh-1');
    localStorage.setItem('user', JSON.stringify({ userName: 'piloto' }));

    renderWithProviders();
    expect(screen.getByTestId('user')).toHaveTextContent('piloto');

    await userEvent.click(screen.getByRole('button', { name: 'Salir' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'refresh-1' }),
      });
    });

    expect(screen.getByTestId('user')).toHaveTextContent('anon');
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('sin refresh guardado limpia la sesión igual (sin POST)', async () => {
    localStorage.setItem('accessToken', 'access-1');
    localStorage.setItem('user', JSON.stringify({ userName: 'piloto' }));

    renderWithProviders();

    await userEvent.click(screen.getByRole('button', { name: 'Salir' }));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('anon');
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
