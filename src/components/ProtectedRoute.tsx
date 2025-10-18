// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

type Props = {
  children: React.ReactNode;
  requiredRole?: 'Admin' | 'User'; // podés extender con más roles
};

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { user } = useUser();

  if (!user) {
    // No está logueado
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.type !== requiredRole) {
    // Está logueado pero no tiene el rol correcto
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
