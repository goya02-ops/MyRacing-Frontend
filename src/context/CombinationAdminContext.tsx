import { createContext, use, type ReactNode } from 'react';
import {
  Simulator,
  Category,
  Circuit,
  Combination,
} from '../types/entities';

export interface CombinationAdminContextType {
  simulators: Simulator[];
  categories: Category[];
  circuits: Circuit[];
  loadingDependencies: boolean;
  list: Combination[];
  filteredList: Combination[];
  editing: Combination | null;
  isCreating: boolean;
  handleSave: (combination: Combination) => void;
  handleCancel: () => void;
  handleEditCombination: (combination: Combination) => void;
}

const CombinationAdminContext = createContext<
  CombinationAdminContextType | undefined
>(undefined);

interface CombinationAdminProviderProps {
  children: ReactNode;
  value: CombinationAdminContextType;
}

export function CombinationAdminProvider({
  children,
  value,
}: CombinationAdminProviderProps) {
  return (
    <CombinationAdminContext value={value}>{children}</CombinationAdminContext>
  );
}

export function useCombinationAdminContext() {
  const context = use(CombinationAdminContext);
  if (context === undefined) {
    throw new Error(
      'useCombinationAdminContext debe ser usado dentro de un CombinationAdminProvider'
    );
  }
  return context;
}
