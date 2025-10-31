import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { logout as apiLogout } from '../services/authService';
import { useMinimumLoading } from '../hooks/useMinimumLoading';
import { Button } from './tremor/TremorComponents.tsx';

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

<Button
onClick={handleLogout}
isLoading={showLoading}
variant="secondary"
>

{showLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}

</Button>
);
}

return null;
}