import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { SignInForm } from '../components/SignInForm';
import { AuthSocialIcons } from '../components/AuthSocialIcons';

interface AuthFormPanelProps {
  type: 'login' | 'signup';
  isActive: boolean;
  logic: {
    form: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error: string;
    successMessage?: string;
  };
}

const formPanelBaseClasses =
  'absolute top-0 h-full w-1/2 flex flex-col items-center justify-center px-10 bg-gray-950/20 backdrop-blur-lg border border-gray-700/50 transition-all duration-600 ease-in-out';

export const AuthFormPanel: React.FC<AuthFormPanelProps> = ({
  type,
  isActive,
  logic,
}) => {
  const isLogin = type === 'login';
  const showSuccess = !isLogin && !!logic.successMessage;

  // Lógica de animación para el panel
  const animationClasses = `${formPanelBaseClasses} left-0 z-${
    isLogin ? 20 : 10
  } ${
    isActive ? 'translate-x-full rounded-r-2xl' : 'translate-x-0 rounded-l-2xl'
  }`;

  // Lógica de visibilidad
  const visibilityStyle = {
    pointerEvents: (isLogin ? !isActive : isActive) ? 'auto' : 'none',
    opacity: (isLogin ? !isActive : isActive) ? 1 : 0,
  } as React.CSSProperties; // Asertar como CSSProperties

  return (
    <div className={animationClasses} style={visibilityStyle}>
      <h1 className="text-3xl font-bold text-gray-100">
        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
      </h1>
      <AuthSocialIcons />
      <span className="text-sm text-gray-400">
        o usa tu email {isLogin ? 'y contraseña' : 'para registrarte'}
      </span>

      {isLogin ? (
        <LoginForm
          form={logic.form}
          onChange={logic.onChange}
          onSubmit={logic.onSubmit}
          loading={logic.loading}
          error={logic.error}
          errorClassName={showSuccess ? 'text-green-400' : 'text-red-600'}
        />
      ) : (
        <SignInForm
          form={logic.form}
          onChange={logic.onChange}
          onSubmit={logic.onSubmit}
          loading={logic.loading}
          error={logic.error}
        />
      )}
    </div>
  );
};
