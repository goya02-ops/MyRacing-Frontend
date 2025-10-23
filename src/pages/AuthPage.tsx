import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLoginForm } from '../hooks/useLoginForm';
import { useSignIn } from '../hooks/useSignInForm';
import { LoginForm } from '../components/LoginForm';
import { SignInForm } from '../components/SignInForm';
import { Button } from '../components/tremor/TremorComponents';
import {
  RiGoogleFill,
  RiFacebookFill,
  RiGithubFill,
  RiLinkedinFill,
} from '@remixicon/react';


const SocialIcon = ({ icon: Icon }: { icon: React.ElementType }) => (
  <a
    href="#"
    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700/50 text-gray-400 transition-all hover:border-orange-500/50 hover:text-orange-400"
  >
    <Icon className="h-5 w-5" />
  </a>
);


export default function AuthPage() {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [successMessage, setSuccessMessage] = useState('');

  
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

 

  
  const formPanelBaseClasses =
    'absolute top-0 h-full w-1/2 flex flex-col items-center justify-center px-10 bg-gray-950/20 backdrop-blur-lg border border-gray-700/50 transition-all duration-600 ease-in-out';

 
  const overlayContainerBaseClasses =
    'absolute top-0 left-1/2 h-full w-1/2 overflow-hidden bg-gray-900 transition-transform duration-600 ease-in-out z-40';

  // Wrapper Naranja del Overlay (el que se mueve dentro del contenedor)
  const overlayPanelWrapperClasses =
    'relative -left-full h-full w-[200%] bg-gradient-to-r from-orange-500 to-orange-700 transition-transform duration-600 ease-in-out';

  // Paneles de Contenido dentro del Overlay Naranja
  const overlayContentPanelClasses =
    'absolute top-0 flex h-full w-1/2 flex-col items-start justify-center gap-4 px-10 text-left transition-transform duration-600 ease-in-out';


   const overlayContentPanelRightClasses =
  'absolute top-0 flex h-full w-1/2 flex-col items-end justify-center gap-4 px-10 text-right transition-transform duration-600 ease-in-out';

  return (
    <div className="relative mx-auto h-auto min-h-[600px] w-full max-w-[820px] overflow-hidden">

 
      <div
        className={`${formPanelBaseClasses} left-0 z-10
          ${isActive ? 'translate-x-full rounded-r-2xl' : 'translate-x-0 rounded-l-2xl'} 
        `}
        style={{ pointerEvents: isActive ? 'auto' : 'none', opacity: isActive ? 1 : 0 }} 
      >
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

     
      <div
        className={`${formPanelBaseClasses} left-0 z-20
          ${isActive ? 'translate-x-full rounded-r-2xl' : 'translate-x-0 rounded-l-2xl'}
        `}
         style={{ pointerEvents: !isActive ? 'auto' : 'none', opacity: !isActive ? 1 : 0 }} // Usamos opacity para el fade
      >
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

     
      <div
        className={`${overlayContainerBaseClasses}
          ${isActive ? '-translate-x-full rounded-l-2xl' : 'translate-x-0 rounded-r-2xl'}
        `}
      >
      
        <div
          className={`${overlayPanelWrapperClasses}
            ${isActive ? 'translate-x-1/2' : 'translate-x-0'}
          `}
        >
         
          <div
            className={`${overlayContentPanelClasses}
              ${isActive ? 'translate-x-0' : '-translate-x-[20%]'} 
              text-left
            `}
          >
            <h1 className="text-4xl font-extrabold text-gray-100">
  <span className="text-5xl font-merriweather font-black text-black ">
    Hola!
  </span>
  <br />
  te esperábamos!
</h1>
            <p className="text-sm">
              Para seguir conectado, por favor inicia sesión con tu
              información personal
            </p>
           
            <Button
              variant="ghost"
              
              className="mt-2 px-10 bg-gray-950/70 backdrop-blur-lg border border-gray-700/50 hover:border-white hover:bg-transparent" 
              onClick={() => setIsActive(false)}
            >
              Sign In
            </Button>
          </div>

          
            <div
              className={`${overlayContentPanelRightClasses} right-0
                ${isActive ? 'translate-x-[20%]' : 'translate-x-0'}
              `}
            >
            <h1 className="text-4xl font-extrabold text-gray-100"> 
              ¡Hola, <br />
              <span className="text-5xl font-merriweather font-black text-black"> 
                Bienvenido!
              </span>
            </h1>
            <p className="text-sm text-white">
              Ingresa tus datos personales y comienza tu viaje con nosotros
            </p>
            
            <Button
              variant="ghost"
             
              className="mt-2 px-10 bg-gray-950/70 backdrop-blur-lg border border-gray-700/50 hover:border-white hover:bg-transparent" 
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