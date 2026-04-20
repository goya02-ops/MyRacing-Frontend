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

interface UserContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
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

  const logout = () => {
    queryClient.clear();
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const value = useMemo(() => ({ user, setUser, logout }), [user]);

  return <UserContext value={value}>{children}</UserContext>;
}

export function useUser() {
  const ctx = use(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de un UserProvider');
  return ctx;
}