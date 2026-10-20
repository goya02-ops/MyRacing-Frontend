import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider, useUser } from './UserContext';
import { User } from '../types/entities';

function createWrapper(queryClient?: QueryClient) {
  const qc =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <UserProvider>{children}</UserProvider>
    </QueryClientProvider>
  );

  return { queryClient: qc, wrapper };
}

describe('UserContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('inicialización del estado', () => {
    it('inicia logueado como instancia de User si hay user y accessToken válidos en localStorage', () => {
      const storedUser = {
        id: 1,
        userName: 'pilot_pro',
        realName: 'Juan Fangio',
        email: 'juan@racing.com',
        type: 'admin',
      };

      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('user', JSON.stringify(storedUser));

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).not.toBeNull();
      expect(result.current.user).toBeInstanceOf(User);
      expect(result.current.user?.id).toBe(1);
      expect(result.current.user?.userName).toBe('pilot_pro');
      expect(result.current.user?.email).toBe('juan@racing.com');
      expect(result.current.user?.type).toBe('admin');
    });

    it('inicia deslogueado (user: null) cuando no hay accessToken en localStorage', () => {
      const storedUser = { id: 2, userName: 'guest' };
      localStorage.setItem('user', JSON.stringify(storedUser));
      // Sin accessToken en localStorage

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).toBeNull();
    });

    it('inicia deslogueado (user: null) cuando no hay user en localStorage', () => {
      localStorage.setItem('accessToken', 'mock-access-token');
      // Sin user en localStorage

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).toBeNull();
    });

    it('inicia deslogueado cuando localStorage está completamente vacío', () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).toBeNull();
    });

    it('inicia deslogueado cuando el valor de user en localStorage es "undefined"', () => {
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('user', 'undefined');

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).toBeNull();
    });

    it('inicia deslogueado y captura el error si el JSON de user es inválido', () => {
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('user', '{ json-invalido-sin-cerrar');

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).toBeNull();
    });
  });

  describe('actualización de usuario con setUser', () => {
    it('actualiza el usuario en memoria y lo sincroniza en localStorage', () => {
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();

      const newUser: User = {
        id: 10,
        userName: 'checo',
        realName: 'Sergio Perez',
        email: 'checo@redbull.com',
        type: 'premium',
      };

      act(() => {
        result.current.setUser(newUser);
      });

      expect(result.current.user).toEqual(newUser);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(newUser));
    });

    it('remueve el usuario de localStorage cuando se setea null', () => {
      const storedUser = { id: 3, userName: 'driver3' };
      localStorage.setItem('accessToken', 'token');
      localStorage.setItem('user', JSON.stringify(storedUser));

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).not.toBeNull();

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('cierre de sesión con logout', () => {
    it('limpia el estado del usuario, vacía localStorage y resetea la caché de queries', () => {
      const initialUser = {
        id: 5,
        userName: 'ayrton',
        email: 'ayrton@senna.br',
      };

      localStorage.setItem('accessToken', 'access-xyz');
      localStorage.setItem('refreshToken', 'refresh-xyz');
      localStorage.setItem('user', JSON.stringify(initialUser));

      const { queryClient, wrapper } = createWrapper();
      const clearQueriesSpy = vi.spyOn(queryClient, 'clear');

      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).not.toBeNull();

      act(() => {
        result.current.logout();
      });

      // El usuario pasa a null
      expect(result.current.user).toBeNull();

      // Se limpian los tokens y datos de usuario en localStorage
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();

      // La caché de react-query es limpiada
      expect(clearQueriesSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('validación de uso fuera del Provider', () => {
    it('arroja un error descriptivo si useUser se utiliza fuera de UserProvider', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useUser());
      }).toThrow('useUser debe usarse dentro de un UserProvider');

      consoleErrorSpy.mockRestore();
    });
  });
});
