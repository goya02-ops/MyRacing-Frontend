import {
  createContext,
  use,
  useState,
  useMemo,
  type ReactNode,
  useEffect,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '../types/entities';
import { logout as revokeSession } from '../services/authService';

interface UserContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !stored || stored === 'undefined') return null;
    try {
      return Object.assign(new User(), JSON.parse(stored));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // BE #73: revoca el grant en el backend (best-effort) antes de limpiar la
  // sesión local. Todos los caminos de logout pasan por aquí.
  const logout = async () => {
    try {
      await revokeSession();
    } finally {
      queryClient.clear();
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, setUser, logout }), [user]);

  return <UserContext value={value}>{children}</UserContext>;
}

export function useUser() {
  const ctx = use(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de un UserProvider');
  return ctx;
}