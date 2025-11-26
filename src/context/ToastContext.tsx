import React, { createContext, use, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type CalloutVariant = 'default' | 'error' | 'success' | 'warning';

interface ToastMessage {
  id: number;
  title: string;
  message: string;
  variant: CalloutVariant;
}

interface ToastContextType {
  showToast: (title: string, message: string, variant: CalloutVariant) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastContainerProps {
  messages: ToastMessage[];
}

import { Callout } from '../components/tremor/Callout.tsx'; 

const ToastContainer: React.FC<ToastContainerProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  const getTremorColor = (variant: CalloutVariant) => {
    switch (variant) {
      case 'success': return 'green';
      case 'error': return 'rose';
      case 'warning': return 'amber';
      default: return 'gray';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-3 max-w-sm w-full pointer-events-none">
      {messages.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Callout
            title={toast.title}
            color={getTremorColor(toast.variant)}
            className="shadow-lg"
          >
            {toast.message}
          </Callout>
        </div>
      ))}
    </div>
  );
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const TIMEOUT = 5000; // 5 segundos

  const showToast = useCallback((title: string, message: string, variant: CalloutVariant = 'default') => {
    const id = Date.now();
    const newToast: ToastMessage = { id, title, message, variant };

    setToasts((prev) => [newToast, ...prev]);

    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, TIMEOUT);
  }, []);

  return (
    <ToastContext value={{ showToast }}>
      {children}
      <ToastContainer messages={toasts} />
    </ToastContext>
  );
};

export const useToast = () => {
  const context = use(ToastContext);
  if (context === undefined) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};