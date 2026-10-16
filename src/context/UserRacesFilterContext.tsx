import { createContext, use, type ReactNode } from 'react';

interface UserRacesFilterContextType {
  minFinishPosition: number | '';
  setMinFinishPosition: (value: number | '') => void;
  raceDateFrom: string;
  setRaceDateFrom: (value: string) => void;
}

const UserRacesFilterContext = createContext<
  UserRacesFilterContextType | undefined
>(undefined);

interface UserRacesFilterProviderProps {
  children: ReactNode;
  value: UserRacesFilterContextType;
}

export function UserRacesFilterProvider({
  children,
  value,
}: UserRacesFilterProviderProps) {
  return (
    <UserRacesFilterContext value={value}>{children}</UserRacesFilterContext>
  );
}

export function useUserRacesFilter() {
  const context = use(UserRacesFilterContext);
  if (context === undefined) {
    throw new Error(
      'useUserRacesFilter debe ser usado dentro de un UserRacesFilterProvider'
    );
  }
  return context;
}
