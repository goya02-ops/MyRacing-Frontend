import { Card, Divider } from './tremor/TremorComponents.tsx';
import { Combination } from '../types/entities.ts';
import {
  getCategoryName,
  getCircuitName,
  getSimulatorName,
} from '../utils/combination/getters.ts';
import { Badge } from './tremor/Badge.tsx';

type Props = {
  combination: Combination;
  setSelectedCombination: (combination: Combination) => void;
};

export function CombinationCard({
  combination,
  setSelectedCombination,
}: Props) {
  return (
    <Card
      key={combination.id}
      className="bg-neutral-800 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => setSelectedCombination(combination)}
    >
      <div className="flex justify-between items-start mb-3">
        <Badge variant="success">{combination.userType.toUpperCase()}</Badge>
        <p className="text-xs text-gray-500">
          {new Date(combination.dateFrom).toLocaleDateString()} -{' '}
          {new Date(combination.dateTo).toLocaleDateString()}
        </p>
      </div>

      <p className="text-xl font-semibold mt-1 mb-1 text-white">
        {getCategoryName(combination)}
      </p>
      <p className="text-sm mb-4 text-white">
        {getCircuitName(combination)} ({getSimulatorName(combination)})
      </p>

      <Divider>Detalles</Divider>
      <div className="flex justify-center mt-4 gap-10 flex-wrap">
        <div>
          <p className="font-medium text-l text-white">
            🏁 {combination.lapsNumber} VUELTAS
          </p>
        </div>
        <div>
          <p className="font-medium text-l text-white">
            🛑 {combination.obligatoryStopsQuantity} PARADA(S)
          </p>
        </div>
      </div>
    </Card>
  );
}
