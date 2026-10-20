import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useUser } from '../context/UserContext';
import { User } from '../types/entities';

vi.mock('../context/UserContext', () => ({
  useUser: vi.fn(),
}));

describe('ProtectedRoute', () => {
  const useUserMock = vi.mocked(useUser);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (
    ui: React.ReactElement,
    initialEntry: string = '/protected'
  ) => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/protected" element={ui} />
          <Route path="/login" element={<div>Página de Login</div>} />
          <Route path="/" element={<div>Página Home</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('caso anónimo: redirige a /login y no renderiza el contenido protegido si no hay usuario logueado', () => {
    useUserMock.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Contenido Privado</div>
      </ProtectedRoute>
    );

    // No debe renderizar el contenido protegido
    expect(screen.queryByText('Contenido Privado')).not.toBeInTheDocument();
    // Debe haber redirigido a /login
    expect(screen.getByText('Página de Login')).toBeInTheDocument();
  });

  it('caso rol insuficiente: redirige a / cuando la ruta exige admin y el usuario tiene rol común', () => {
    const regularUser: User = {
      id: 2,
      userName: 'regular_user',
      realName: 'Usuario Común',
      email: 'user@racing.com',
      type: 'common',
    };

    useUserMock.mockReturnValue({
      user: regularUser,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute requiredRole="admin">
        <div>Panel de Administración</div>
      </ProtectedRoute>
    );

    // No debe renderizar el contenido de admin
    expect(screen.queryByText('Panel de Administración')).not.toBeInTheDocument();
    // Debe haber redirigido a / (Home)
    expect(screen.getByText('Página Home')).toBeInTheDocument();
  });

  it('caso válido (admin): renderiza el contenido cuando la ruta exige admin y el usuario es admin', () => {
    const adminUser: User = {
      id: 1,
      userName: 'admin_user',
      realName: 'Administrador',
      email: 'admin@racing.com',
      type: 'admin',
    };

    useUserMock.mockReturnValue({
      user: adminUser,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute requiredRole="admin">
        <div>Panel de Administración</div>
      </ProtectedRoute>
    );

    // Debe renderizar el contenido protegido
    expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
    expect(screen.queryByText('Página Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Página de Login')).not.toBeInTheDocument();
  });

  it('caso válido (usuario normal): renderiza el contenido cuando la ruta no exige rol específico y el usuario está logueado', () => {
    const regularUser: User = {
      id: 5,
      userName: 'driver5',
      realName: 'Corredor',
      email: 'driver5@racing.com',
      type: 'common',
    };

    useUserMock.mockReturnValue({
      user: regularUser,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Mi Perfil de Piloto</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Mi Perfil de Piloto')).toBeInTheDocument();
    expect(screen.queryByText('Página de Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Página Home')).not.toBeInTheDocument();
  });

  it('caso válido (rol common explícito): renderiza el contenido cuando requiredRole coincide con common', () => {
    const regularUser: User = {
      id: 6,
      userName: 'common_user',
      realName: 'Usuario Estándar',
      email: 'common@racing.com',
      type: 'common',
    };

    useUserMock.mockReturnValue({
      user: regularUser,
      setUser: vi.fn(),
      logout: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute requiredRole="common">
        <div>Sección Común</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Sección Común')).toBeInTheDocument();
  });
});
