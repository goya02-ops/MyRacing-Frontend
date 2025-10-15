import { createContext, use, useState, useMemo, type ReactNode } from 'react';
import { User } from '../types/entities';

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Memoizamos el objeto para evitar recrearlo en cada render
  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext value={value}>{children}</UserContext>;
}

export function useUser() {
  const ctx = use(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de un UserProvider');
  return ctx;
}
