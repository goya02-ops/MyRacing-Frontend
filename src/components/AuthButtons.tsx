import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { logout as apiLogout } from '../services/apiMyRacing';
import { useMinimumLoading } from '../hooks/useMinimumLoading';

export function AuthButtons() {
  const { user, logout: contextLogout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const showLoading = useMinimumLoading(isLoggingOut);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      contextLogout();
      setIsLoggingOut(false);
    }
  };

  if (user) {
    return (
      <button onClick={handleLogout} disabled={showLoading}>
        {showLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
      </button>
    );
  }

  return null;
}