import type { Combination, Simulator } from '../../../types/entities.ts';
import { Button } from '../../../components/tremor/TremorComponents.tsx';

type Props = {
  selectedSimulator: Simulator | null;
  setSelectedSimulator: (Simulator: Simulator | null) => void;
  simulatorsWithRaces: Simulator[];

  setSelectedCombination: (combination: Combination | null) => void;
};

export function SimulatorFilterButtons({
  selectedSimulator,
  setSelectedSimulator,
  simulatorsWithRaces,
  setSelectedCombination,
}: Props) {
  return (
    <>
      <Button
        variant={selectedSimulator === null ? 'primary' : 'ghost'}
        onClick={() => {
          setSelectedSimulator(null);
          setSelectedCombination(null);
        }}
      >
        Mostrar Todos
      </Button>
      {simulatorsWithRaces.map((sim) => (
        <Button
          key={sim.id}
          variant={selectedSimulator?.id === sim.id ? 'primary' : 'ghost'}
          onClick={() => {
            setSelectedCombination(null);
            setSelectedSimulator(sim);
          }}
        >
          {sim.name}
        </Button>
      ))}
    </>
  );
}
