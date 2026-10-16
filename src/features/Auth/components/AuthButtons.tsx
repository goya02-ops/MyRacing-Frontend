import { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import { useMinimumLoading } from '../../../hooks/useMinimumLoading';
import { Button } from '../../../components/tremor/TremorComponents.tsx';

export function AuthButtons() {
  const { user, logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const showLoading = useMinimumLoading(isLoggingOut);

  // El logout del contexto ya revoca el grant (BE #73); acá solo se muestra el
  // estado de carga mientras corre.
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (user) {
    return (
      <Button
        onClick={() => {
          void handleLogout();
        }}
        isLoading={showLoading}
        variant="secondary"
      >
        {showLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
      </Button>
    );
  }

  return null;
}
