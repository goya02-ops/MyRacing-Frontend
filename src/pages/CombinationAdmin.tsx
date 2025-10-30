import { lazy, useCallback, useState, Suspense } from 'react';
import { Combination } from '../types/entities';
import { saveEntity } from '../services/apiMyRacing';
import useCombinationAdmin from '../hooks/useCombinationAdmin';
import { isDuplicateCombination } from '../utils/combination/duplicate';
import { normalizeCombination } from '../utils/combination/normalize';
import {
  getCategoryName,
  getCircuitName,
  getSimulatorName,
} from '../utils/combination/getters';

import {
  Card,
  Button,
  Badge,
  Divider,
} from '../components/tremor/TremorComponents';

const CombinationForm = lazy(() => import('../components/CombinationForm'));

export default function CombinationAdmin() {
  const { list, setList, editing, setEditing, simulators, loading } =
    useCombinationAdmin();
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = useCallback(
    async (combination: Combination) => {
      const normalized = normalizeCombination(combination);
      if (isDuplicateCombination(list, normalized)) {
        alert('Esta combinación ya existe con las mismas fechas.');
        return;
      }
      try {
        const saved = await saveEntity(Combination, normalized);
        setList((prev) =>
          prev.some((c) => c.id === saved.id)
            ? prev.map((c) => (c.id === saved.id ? saved : c))
            : [...prev, saved]
        );
        setEditing(null);
        setIsCreating(false);
      } catch (error) {
        console.error('Error guardando:', error);
        alert('Error al guardar la combinación');
      }
    },
    [list, setList, setEditing]
  );

  const handleNewCombination = () => {
    setEditing(new Combination());
    setIsCreating(true);
  };

  const handleEditCombination = (combination: Combination) => {
    setEditing(combination);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-400">Cargando combinaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="text-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Administrar Combinaciones</h2>
            <Badge variant="neutral">Total: {list.length}</Badge>
          </div>
          <Button onClick={handleNewCombination}>+ Nueva Combinación</Button>
        </div>

        {isCreating && editing && simulators && (
          <div className="mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                Crear Nueva Combinación
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
            <Divider className="my-6" />
          </div>
        )}

        {list.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No hay combinaciones registradas
            </p>
          </div>
        ) : (
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

            {list.map((comb) => (
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
                      variant={
                        comb.userType === 'Premium' ? 'warning' : 'default'
                      }
                    >
                      {comb.userType?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex-1 w-full md:w-auto flex justify-end">
                    <Button
                      variant={
                        editing?.id === comb.id && !isCreating
                          ? 'primary'
                          : 'ghost'
                      }
                      onClick={() =>
                        editing?.id === comb.id && !isCreating
                          ? handleCancel()
                          : handleEditCombination(comb)
                      }
                    >
                      {editing?.id === comb.id && !isCreating
                        ? 'Cancelar'
                        : 'Editar'}
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
                        <div className="text-center p-4">
                          Cargando formulario...
                        </div>
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
        )}
      </Card>
    </div>
  );
}
