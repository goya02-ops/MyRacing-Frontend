import React from 'react';
import { Button } from './tremor/TremorComponents';

interface AuthOverlayProps {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
}

const overlayContainerBaseClasses =
  'absolute top-0 left-1/2 h-full w-1/2 overflow-hidden bg-gray-900 transition-transform duration-600 ease-in-out z-40';
const overlayPanelWrapperClasses =
  'relative -left-full h-full w-[200%] bg-gradient-to-r from-orange-500 to-orange-700 transition-transform duration-600 ease-in-out';
const overlayContentPanelClasses =
  'absolute top-0 flex h-full w-1/2 flex-col items-start justify-center gap-4 px-10 text-left transition-transform duration-600 ease-in-out';
const overlayContentPanelRightClasses =
  'absolute top-0 flex h-full w-1/2 flex-col items-end justify-center gap-4 px-10 text-right transition-transform duration-600 ease-in-out';

export const AuthOverlay: React.FC<AuthOverlayProps> = ({ isActive, setIsActive }) => (
  <div
    className={`${overlayContainerBaseClasses} ${
      isActive
        ? '-translate-x-full rounded-l-2xl'
        : 'translate-x-0 rounded-r-2xl'
    }`}
  >
    <div
      className={`${overlayPanelWrapperClasses} ${
        isActive ? 'translate-x-1/2' : 'translate-x-0'
      }`}
    >
      {/* Panel izquierdo del overlay (Login) */}
      <div
        className={`${overlayContentPanelClasses} ${
          isActive ? 'translate-x-0' : '-translate-x-[20%]'
        }`}
      >
        <h1 className="text-4xl font-extrabold text-gray-100">
          <span className="text-5xl font-merriweather font-black text-black">
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

      {/* Panel derecho del overlay (Registro) */}
      <div
        className={`${overlayContentPanelRightClasses} right-0 ${
          isActive ? 'translate-x-[20%]' : 'translate-x-0'
        }`}
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
);