import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Navbar } from './NavBar';
import { UserProvider } from '../context/UserContext';
import { API_BASE_URL } from '../services/apiClient';

const mockFetch = vi.fn();

function renderNavbar() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </UserProvider>
    </QueryClientProvider>,
  );
}

describe('Navbar logout (BE #73)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'access-1');
    localStorage.setItem('refreshToken', 'refresh-1');
    localStorage.setItem('user', JSON.stringify({ userName: 'piloto' }));
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

  it('el botón Cerrar Sesión revoca el grant (POST /auth/logout)', async () => {
    renderNavbar();

    await userEvent.click(
      screen.getByRole('button', { name: /cerrar sesión/i }),
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'refresh-1' }),
      });
    });
  });
});
