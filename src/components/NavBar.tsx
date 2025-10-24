import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Button,
  TabNavigation,
  TabNavigationLink,
} from './tremor/TremorComponents.tsx';

export function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === '/login-register';

  return (
    <div className="top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-3 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 pb-2 text-xl font-bold text-white">
            <span>🏁</span>
            <span>MyRacing</span>
          </div>

          <div className="flex justify-center">
            <TabNavigation>
              <TabNavigationLink
                asChild
                data-active={location.pathname === '/' ? '' : undefined}
              >
                <button onClick={() => navigate('/')}>
                  Carreras Disponibles
                </button>
              </TabNavigationLink>

              {user && (
                <TabNavigationLink
                  asChild
                  data-active={
                    location.pathname === '/my-profile' ? '' : undefined
                  }
                >
                  <button onClick={() => navigate('/my-profile')}>
                    Mi Perfil
                  </button>
                </TabNavigationLink>
              )}

              {user?.type === 'admin' && (
                <TabNavigationLink
                  asChild
                  data-active={
                    location.pathname === '/admin-dashboard' ? '' : undefined
                  }
                >
                  <button onClick={() => navigate('/admin-dashboard')}>
                    Panel de Administración
                  </button>
                </TabNavigationLink>
              )}
            </TabNavigation>
          </div>

          <div className="flex items-center justify-end py-4">
            {!user ? (
              <Button onClick={() => navigate('/login-register')} variant="ghost"
              className={isActive ? 'bg-orange-700 hover:bg-orange-700' : ""}
              
              >
                Iniciar Sesión
              </Button>
            ) : (
              <Button onClick={logout} variant="ghost">Cerrar Sesión</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
