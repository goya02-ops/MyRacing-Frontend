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

  const activeClass = 'text-orange-500 border-orange-500 font-semibold';
  const baseClass = 'text-white';

  return (
    // ✅ ÚNICO CAMBIO: Mantenemos 'sticky' pero quitamos el fondo y el borde.
    <div className="sticky top-0 z-50 w-full">
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
                className={`${baseClass} ${
                  location.pathname === '/' ? activeClass : ''
                }`}
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
                  className={`${baseClass} ${
                    location.pathname === '/my-profile' ? activeClass : ''
                  }`}
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
                  className={`${baseClass} ${
                    location.pathname === '/admin-dashboard' ? activeClass : ''
                  }`}
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
              <Button onClick={() => navigate('/login-register')}>
                Iniciar Sesión
              </Button>
            ) : (
              <button
                onClick={logout}
                className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
