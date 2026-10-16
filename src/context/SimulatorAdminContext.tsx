import { createContext, use, type ReactNode } from 'react';
import { Simulator } from '../types/entities.ts';

export type ActiveManagerType = 'category' | 'circuit';

export interface ActiveManager {
  type: ActiveManagerType | null;
  simulator: Simulator | null;
}

// Estado y handlers de SimulatorAdmin que la cadena (lista -> fila -> manager)
// necesita, expuestos por contexto para no taladrar props sin uso intermedio.
interface SimulatorAdminContextType {
  simulators: Simulator[];
  editingSimulator: Simulator | null;
  isCreatingSimulator: boolean;
  activeManager: ActiveManager;
  handleEditSimulator: (simulator: Simulator) => void;
  handleCancelSimulator: () => void;
  handleToggleManager: (simulator: Simulator, type: ActiveManagerType) => void;
  handleCloseManager: () => void;
}

const SimulatorAdminContext = createContext<
  SimulatorAdminContextType | undefined
>(undefined);

interface SimulatorAdminProviderProps {
  children: ReactNode;
  value: SimulatorAdminContextType;
}

export function SimulatorAdminProvider({
  children,
  value,
}: SimulatorAdminProviderProps) {
  return (
    <SimulatorAdminContext value={value}>{children}</SimulatorAdminContext>
  );
}

export function useSimulatorAdminContext() {
  const context = use(SimulatorAdminContext);
  if (context === undefined) {
    throw new Error(
      'useSimulatorAdminContext debe ser usado dentro de un SimulatorAdminProvider'
    );
  }
  return context;
}
