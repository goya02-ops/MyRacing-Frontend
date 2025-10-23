import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLoginForm } from '../hooks/useLoginForm';
import { useSignIn } from '../hooks/useSignInForm';

// Importamos TUS componentes de formulario
import { LoginForm } from '../components/LoginForm';
import { SignInForm } from '../components/SignInForm';

import { Button } from '../components/tremor/TremorComponents';
import {
  RiGoogleFill,
  RiFacebookFill,
  RiGithubFill,
  RiLinkedinFill,
} from '@remixicon/react';

// --- Icono de Red Social (Helper) ---
const SocialIcon = ({ icon: Icon }: { icon: React.ElementType }) => (
  <a
    href="#"
    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700/50 text-gray-400 transition-all hover:border-orange-500/50 hover:text-orange-400"
  >
    <Icon className="h-5 w-5" />
  </a>
);

// --- Componente Principal de la Página ---
export default function AuthPage() {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [successMessage, setSuccessMessage] = useState('');

  // --- Lógica de Login ---
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const login = useLoginForm({
    setLoading: setLoginLoading,
    setError: setLoginError,
    onSuccess: (data) => {
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.data);
      navigate('/');
    },
  });

  // --- Lógica de Registro ---
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState('');
  const signIn = useSignIn({
    setLoading: setSignInLoading,
    setError: setSignInError,
    onSuccess: () => {
      setSuccessMessage('¡Registro exitoso! Por favor, inicia sesión.');
      setIsActive(false);
      setLoginError('');
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setSuccessMessage('');
    login.handleSubmit(e);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSuccessMessage('');
    signIn.handleSubmit(e);
  };

  // --- Clases de Animación y Estilo ---
  const formContainerBase =
    'absolute top-0 h-full w-1/2 transition-all duration-600 ease-in-out';
    
  const formPanelTransparentStyles = 
    'rounded-l-2xl bg-gray-950/20 backdrop-blur-lg border border-gray-700/50';

  const overlayContainerBase =
    'absolute top-0 left-1/2 z-50 h-full w-1/2 overflow-hidden transition-all duration-600 ease-in-out rounded-r-2xl'; 
  const overlayBase =
    'relative -left-full h-full w-[200%] transition-all duration-600 ease-in-out';
  const overlayPanelBase =
    'absolute top-0 flex h-full w-1/2 flex-col items-center justify-center gap-4 px-10 text-center';

  return (
    <div className="relative mx-auto h-auto min-h-[600px] w-full max-w-[820px] overflow-hidden">
      
      {/* --- Formulario de Registro (Sign Up) --- */}
      <div
        className={`${formContainerBase} left-0 ${formPanelTransparentStyles}
          ${isActive 
            ? 'translate-x-full opacity-100 z-20' // Visible y encima cuando está activo
            : 'translate-x-0 opacity-0 z-10'   // Oculto a la izquierda por defecto
          }
        `}
      >
        <div className="flex h-full flex-col items-center justify-center gap-4 px-10">
          <h1 className="text-3xl font-bold text-gray-100">Crear Cuenta</h1>
          <div className="my-2 flex gap-4">
            <SocialIcon icon={RiGoogleFill} />
            <SocialIcon icon={RiFacebookFill} />
            <SocialIcon icon={RiGithubFill} />
            <SocialIcon icon={RiLinkedinFill} />
          </div>
          <span className="text-sm text-gray-400">
            o usa tu email para registrarte
          </span>
          <SignInForm
            form={signIn.form}
            onChange={signIn.handleChange}
            onSubmit={handleSignInSubmit}
            loading={signInLoading}
            error={signInError}
          />
        </div>
      </div>

      {/* --- Formulario de Inicio de Sesión (Sign In) --- */}
      <div
        className={`${formContainerBase} left-0 ${formPanelTransparentStyles}
          ${isActive 
            ? 'translate-x-full opacity-0 z-10' // Oculto y detrás cuando Sign Up está activo
            : 'translate-x-0 opacity-100 z-20' // Visible y encima por defecto
          }
        `}
      >
        <div className="flex h-full flex-col items-center justify-center gap-4 px-10">
          <h1 className="text-3xl font-bold text-gray-100">Iniciar Sesión</h1>
          <div className="my-2 flex gap-4">
            <SocialIcon icon={RiGoogleFill} />
            <SocialIcon icon={RiFacebookFill} />
            <SocialIcon icon={RiGithubFill} />
            <SocialIcon icon={RiLinkedinFill} />
          </div>
          <span className="text-sm text-gray-400">
            o usa tu email y contraseña
          </span>
          <LoginForm
            form={login.form}
            onChange={login.handleChange}
            onSubmit={handleLoginSubmit}
            loading={loginLoading}
            error={loginError || successMessage}
            errorClassName={
              successMessage ? 'text-green-400' : 'text-red-600'
            }
          />
        </div>
      </div>

      {/* --- Contenedor del Overlay Deslizante --- */}
      {/* z-index alto para estar siempre encima */}
      <div 
        className={`${overlayContainerBase} z-50 
          ${isActive ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        <div
          className={`${overlayBase} bg-gradient-to-r from-orange-500 to-orange-700 
            ${isActive ? 'translate-x-1/2' : 'translate-x-0'}
          `}
        >
          {/* Panel Izquierdo (Muestra "Welcome Back!") */}
          <div
            className={`${overlayPanelBase} 
              ${isActive ? 'translate-x-0' : '-translate-x-1/4'}
            `}
          >
            <h1 className="text-3xl font-bold">¡Bienvenido de Nuevo!</h1>
            <p className="text-sm">
              Para seguir conectado, por favor inicia sesión con tu
              información personal
            </p>
            <Button
              variant="secondary"
              className="mt-2 px-10"
              onClick={() => setIsActive(false)}
            >
              Sign In
            </Button>
          </div>

          {/* Panel Derecho (Muestra "Hello, Friend!") */}
          <div
            className={`${overlayPanelBase} right-0 
              ${isActive ? 'translate-x-1/4' : 'translate-x-0'}
            `}
          >
            <h1 className="text-3xl font-bold">¡Hola, Amigo!</h1>
            <p className="text-sm">
              Ingresa tus datos personales y comienza tu viaje con nosotros
            </p>
            <Button
              variant="secondary"
              className="mt-2 px-10"
              onClick={() => setIsActive(true)}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}