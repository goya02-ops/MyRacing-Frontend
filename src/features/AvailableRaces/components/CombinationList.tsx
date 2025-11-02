import { Combination } from '../../../types/entities.ts';
import { CombinationCard } from './CombinationCard.tsx';

type Props = {
  combinations: Combination[];
  setSelectedCombination: (combination: Combination) => void;
};

export function CombinationList({
  combinations,
  setSelectedCombination,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-8">
        {combinations.map((c) => (
          <button key={c.id} onClick={() => setSelectedCombination(c)}>
            <CombinationCard combination={c} nextRace={null} />
          </button>
        ))}
      </div>
    </>
  );
}
