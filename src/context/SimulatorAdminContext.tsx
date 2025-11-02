import { createContext, use, type ReactNode } from 'react';
import { Category, Circuit } from '../types/entities.ts';

type HandleSaveEntityFunc = <T extends { id?: number }>(
  entityClass: new () => T,
  entity: T,
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  onSuccess: () => void,
  duplicateCheck?: (entity: T) => boolean
) => Promise<void>;

interface SimulatorAdminContextType {
  categories: Category[];
  circuits: Circuit[];
  handleSaveEntity: HandleSaveEntityFunc;
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
