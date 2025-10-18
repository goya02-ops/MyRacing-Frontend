import {
  createContext,
  use,
  useState,
  useMemo,
  type ReactNode,
  useEffect,
} from 'react';
import { User } from '../types/entities';

interface UserContextType {
  user: User | null;
  setUser: (u: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Persistencia en localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(Object.assign(new User(), JSON.parse(stored)));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const logout = () => setUser(null);

  // Memoizamos el objeto para evitar recrearlo en cada render
  const value = useMemo(() => ({ user, setUser, logout }), [user]);

  return <UserContext value={value}>{children}</UserContext>;
}

export function useUser() {
  const ctx = use(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de un UserProvider');
  return ctx;
}
