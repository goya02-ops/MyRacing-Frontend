import { Combination } from '../types/entities.ts';
import { CombinationCard } from './CombinationCard.tsx';

type Props = {
  combinations: Combination[];
  loading: boolean;
  setSelectedCombination: (combination: Combination) => void;
};

export function CombinationList({
  combinations,
  loading,
  setSelectedCombination,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8 place-items-center">
      {combinations.length === 0 && !loading ? (
        <p className="col-span-full text-center text-gray-500">
          No hay combinaciones disponibles para el filtro actual.
        </p>
      ) : (
        combinations.map((c) => (
          <CombinationCard
            key={c.id}
            combination={c}
            setSelectedCombination={setSelectedCombination}
          />
        ))
      )}
    </div>
  );
}
