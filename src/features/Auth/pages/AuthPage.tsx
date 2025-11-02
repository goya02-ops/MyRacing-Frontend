// import React from 'react';
import { useAuthPageLogic } from '../hooks/useAuthPageLogic.ts';

import { AuthFormPanel } from '../components/AuthFormPanel.tsx';
import { AuthOverlay } from '../components/AuthOverlay.tsx';

export default function AuthPage() {
  const {
    isActive,
    setIsActive,
    loginLogic,
    signInLogic,
    handleLoginSubmit,
    handleSignInSubmit,
  } = useAuthPageLogic();

  return (
    <div className="w-full flex items-center justify-center py-8">
      <div className="relative mx-auto h-auto min-h-[600px] w-full max-w-[820px] overflow-hidden">
        {/* 2. PANEL DE REGISTRO (SIGN UP) */}
        <AuthFormPanel
          type="signup"
          isActive={isActive}
          logic={{
            ...signInLogic,
            onSubmit: handleSignInSubmit,
          }}
        />

        {/* 3. PANEL DE LOGIN (SIGN IN) */}
        <AuthFormPanel
          type="login"
          isActive={isActive}
          logic={{
            ...loginLogic,
            onSubmit: handleLoginSubmit,
            successMessage: loginLogic.error.includes('Registro exitoso')
              ? loginLogic.error
              : undefined,
          }}
        />

        {/* 4. OVERLAY ANIMADO */}
        <AuthOverlay isActive={isActive} setIsActive={setIsActive} />
      </div>
    </div>
  );
}
