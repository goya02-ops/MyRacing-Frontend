import React, { lazy, Suspense } from 'react';
import { Combination, Simulator } from '../../../types/entities';
import {
  getCategoryName,
  getCircuitName,
  getSimulatorName,
} from '../../../utils/combination/getters';
import { Button, Badge } from '../../../components/tremor/TremorComponents';

const CombinationForm = lazy(() => import('../components/CombinationForm'));

interface CombinationListProps {
  list: Combination[];
  filteredList: Combination[];
  editing: Combination | null;
  isCreating: boolean;
  simulators: Simulator[];
  handleEditCombination: (combination: Combination) => void;
  handleCancel: () => void;
  handleSave: (combination: Combination) => void;
}

const CombinationList: React.FC<CombinationListProps> = ({
  filteredList,
  editing,
  isCreating,
  simulators,
  handleEditCombination,
  handleCancel,
  handleSave,
  list, // solo se usa para el check de list.length
}) => {
  if (list.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎮</div>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          No hay combinaciones registradas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="hidden md:flex text-sm font-semibold text-gray-400 pb-2 px-4 border-b border-gray-700/50">
        <div className="flex-[2]">Simulador</div>
        <div className="flex-[2]">Categoría</div>
        <div className="flex-[2]">Circuito</div>
        <div className="flex-1">Desde</div>
        <div className="flex-1">Hasta</div>
        <div className="flex-1 text-center">Config.</div>
        <div className="flex-1 text-center">Usuario</div>
        <div className="flex-1 text-right">Acciones</div>
      </div>

      {filteredList.map((comb) => (
        <div key={comb.id} className="space-y-2">
          <div className="flex flex-col md:flex-row items-start md:items-center py-4 px-4 hover:bg-gray-900/50 rounded-lg border-b border-gray-700/50">
            <div className="flex-[2] w-full md:w-auto mb-2 md:mb-0 font-medium">
              {getSimulatorName(comb)}
            </div>
            <div className="flex-[2] w-full md:w-auto mb-2 md:mb-0">
              {getCategoryName(comb)}
            </div>
            <div className="flex-[2] w-full md:w-auto mb-2 md:mb-0">
              {getCircuitName(comb)}
            </div>
            <div className="flex-1 w-full md:w-auto mb-2 md:mb-0">
              {comb.dateFrom
                ? new Date(comb.dateFrom).toLocaleDateString('es-AR')
                : 'N/A'}
            </div>
            <div className="flex-1 w-full md:w-auto mb-2 md:mb-0">
              {comb.dateTo
                ? new Date(comb.dateTo).toLocaleDateString('es-AR')
                : 'N/A'}
            </div>

            <div className="flex-1 w-full md:w-auto mb-2 md:mb-0 flex md:flex-col md:items-center gap-1">
              <Badge
                variant="neutral"
                title="Vueltas"
              >{`V: ${comb.lapsNumber}`}</Badge>
              <Badge
                variant="neutral"
                title="Paradas"
              >{`P: ${comb.obligatoryStopsQuantity}`}</Badge>
            </div>
            <div className="flex-1 w-full md:w-auto mb-2 md:mb-0 flex md:justify-center">
              <Badge
                variant={comb.userType === 'Premium' ? 'warning' : 'default'}
              >
                {comb.userType?.toUpperCase()}
              </Badge>
            </div>

            <div className="flex-1 w-full md:w-auto flex justify-end">
              <Button
                variant={
                  editing?.id === comb.id && !isCreating ? 'primary' : 'ghost'
                }
                onClick={() =>
                  editing?.id === comb.id && !isCreating
                    ? handleCancel()
                    : handleEditCombination(comb)
                }
              >
                {editing?.id === comb.id && !isCreating ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </div>

          {editing?.id === comb.id && !isCreating && simulators && (
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-2">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                Editar Combinación
              </h3>
              <Suspense
                fallback={
                  <div className="text-center p-4">Cargando formulario...</div>
                }
              >
                <CombinationForm
                  initial={editing as Combination}
                  simulators={simulators}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </Suspense>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CombinationList;
