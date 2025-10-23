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
};

export function CombinationCard({ combination }: Props) {
  return (
    <Card
      key={combination.id}
 className="cursor-pointer hover:shadow-lg transition-shadow duration-200 h-full flex flex-col justify-between p-4 text-gray-200"    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <Badge variant="success">{combination.userType.toUpperCase()}</Badge>
        <p className="text-xs md:text-sm text-gray-500">
          {new Date(combination.dateFrom).toLocaleDateString()} -{' '}
          {new Date(combination.dateTo).toLocaleDateString()}
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-lg md:text-xl font-semibold mt-1 mb-1 text-white text-center">
          {getCategoryName(combination)}
        </p>
        <p className="text-sm md:text-base mb-4 text-white text-center">
          {getCircuitName(combination)} ({getSimulatorName(combination)})
        </p>
      </div>

      {/* Footer */}
      <div>
        <Divider>Detalles</Divider>
        <div className="flex justify-center mt-4 gap-10 flex-wrap">
          <div>
            <p className="font-medium text-sm md:text-lg text-white">
              🏁 {combination.lapsNumber} VUELTAS
            </p>
          </div>
          <div>
            <p className="font-medium text-sm md:text-lg text-white">
              🛑 {combination.obligatoryStopsQuantity} PARADA(S)
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
