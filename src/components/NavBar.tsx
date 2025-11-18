import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  TabNavigation,
  TabNavigationLink,
} from './tremor/TremorComponents.tsx';

import { RiMenuLine } from '@remixicon/react';

export function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-3 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 pb-2 text-xl font-bold text-white">
            <span>🏁</span>
            <span>MyRacing</span>
          </div>

          <div className="hidden md:flex justify-center">
            <TabNavigation>
              <TabNavigationLink
                asChild
                data-active={location.pathname === '/' ? '' : undefined}
              >
                <button onClick={() => handleNavigate('/')}>
                  Carreras Disponibles
                </button>
              </TabNavigationLink>

              {user && (
                <>
                  <TabNavigationLink
                    asChild
                    data-active={
                      location.pathname === '/my-profile' ? '' : undefined
                    }
                  >
                    <button onClick={() => handleNavigate('/my-profile')}>
                      Mi Perfil
                    </button>
                  </TabNavigationLink>
                  <TabNavigationLink
                    asChild
                    data-active={
                      location.pathname === '/membership-payment'
                        ? ''
                        : undefined
                    }
                  >
                    <button
                      onClick={() => handleNavigate('/membership-payment')}
                    >
                      Pagar membresía
                    </button>
                  </TabNavigationLink>
                </>
              )}

              {user?.type === 'admin' && (
                <TabNavigationLink
                  asChild
                  data-active={
                    location.pathname === '/admin-dashboard' ? '' : undefined
                  }
                >
                  <button onClick={() => handleNavigate('/admin-dashboard')}>
                    Panel de Administración
                  </button>
                </TabNavigationLink>
              )}
            </TabNavigation>
          </div>

          {/* Columna 3: Botones de Sesión y Menú Móvil */}
          <div className="flex items-center justify-end py-4">
            {/* Botón de Sesión para Escritorio */}
            {/* Oculto en pantallas pequeñas, visible a partir de 'md' */}
            <div className="hidden md:flex">
              {!user ? (
                <Button onClick={() => handleNavigate('/login-register')}>
                  Iniciar Sesión
                </Button>
              ) : (
                <Button onClick={logout}>Cerrar Sesión</Button>
              )}
            </div>

            {/* Botón de Menú y Drawer para Móvil */}
            {/* Visible en pantallas pequeñas, oculto a partir de 'md' */}
            <div className="flex md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  {/* Botón de hamburguesa */}
                  <Button variant="ghost" className="p-2">
                    <RiMenuLine className="h-6 w-6 text-white" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Menú</DrawerTitle>
                  </DrawerHeader>
                  <DrawerBody>
                    {/* Replicamos los enlaces de navegación dentro del Drawer */}
                    <nav className="flex flex-col space-y-2">
                      <DrawerClose asChild>
                        <Button
                          variant={
                            location.pathname === '/' ? 'primary' : 'ghost'
                          }
                          className="w-full justify-start"
                          onClick={() => handleNavigate('/')}
                        >
                          Carreras Disponibles
                        </Button>
                      </DrawerClose>

                      {user && (
                        <>
                          <DrawerClose asChild>
                            <Button
                              variant={
                                location.pathname === '/my-profile'
                                  ? 'primary'
                                  : 'ghost'
                              }
                              className="w-full justify-start"
                              onClick={() => handleNavigate('/my-profile')}
                            >
                              Mi Perfil
                            </Button>
                          </DrawerClose>
                          <DrawerClose asChild>
                            <Button
                              variant={
                                location.pathname === '/membership-payment'
                                  ? 'primary'
                                  : 'ghost'
                              }
                              className="w-full justify-start"
                              onClick={() =>
                                handleNavigate('/membership-payment')
                              }
                            >
                              Pagar membresía
                            </Button>
                          </DrawerClose>
                        </>
                      )}

                      {user?.type === 'admin' && (
                        <DrawerClose asChild>
                          <Button
                            variant={
                              location.pathname === '/admin-dashboard'
                                ? 'primary'
                                : 'ghost'
                            }
                            className="w-full justify-start"
                            onClick={() => handleNavigate('/admin-dashboard')}
                          >
                            Panel de Administración
                          </Button>
                        </DrawerClose>
                      )}
                    </nav>
                  </DrawerBody>
                  <DrawerFooter>
                    {/* Replicamos los botones de sesión en el pie del Drawer */}
                    <DrawerClose asChild>
                      {!user ? (
                        <Button
                          className="w-full"
                          onClick={() => handleNavigate('/login-register')}
                        >
                          Iniciar Sesión
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant="secondary"
                          onClick={logout}
                        >
                          Cerrar Sesión
                        </Button>
                      )}
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
