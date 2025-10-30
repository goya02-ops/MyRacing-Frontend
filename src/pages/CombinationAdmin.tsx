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
import { useScrollToElement } from '../hooks/useScrollToElement.ts';

import {
  Card,
  Button,
  Badge,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '../components/tremor/TremorComponents';

const CombinationForm = lazy(() => import('../components/CombinationForm'));

export default function CombinationAdmin() {
  const { list, setList, editing, setEditing, simulators, loading } =
    useCombinationAdmin();
  const [isCreating, setIsCreating] = useState(false);

  const formContainerRef = useScrollToElement<HTMLDivElement>(editing);

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
        <div
          className="
          flex flex-col sm:flex-row    
          justify-between 
          items-start sm:items-center  
          mb-6                         
          gap-4 sm:gap-0               
        "
        >
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Administrar Combinaciones</h2>
            <Badge variant="neutral">Total: {list.length}</Badge>
          </div>
          <Button onClick={handleNewCombination} className="w-full sm:w-auto">
            + Nueva Combinación
          </Button>
        </div>

        <div ref={formContainerRef}>
          {isCreating && editing && simulators && (
            <div className="mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-orange-400">
                  Crear Nueva Combinación
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
              <Divider className="my-6" />
            </div>
          )}

          {!isCreating && editing && simulators && (
            <div className="mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
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
              <Divider className="my-6" />
            </div>
          )}
        </div>

        {list.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No hay combinaciones registradas
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Simulador</TableHeaderCell>
                  <TableHeaderCell>Categoría</TableHeaderCell>
                  <TableHeaderCell>Circuito</TableHeaderCell>
                  <TableHeaderCell>Desde</TableHeaderCell>
                  <TableHeaderCell>Hasta</TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Config.
                  </TableHeaderCell>
                  <TableHeaderCell className="text-center">
                    Usuario
                  </TableHeaderCell>
                  <TableHeaderCell className="text-right">
                    Acciones
                  </TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {list.map((comb) => (
                  <TableRow key={comb.id}>
                    <TableCell className="font-medium">
                      {getSimulatorName(comb)}
                    </TableCell>
                    <TableCell>{getCategoryName(comb)}</TableCell>
                    <TableCell>{getCircuitName(comb)}</TableCell>
                    <TableCell>
                      {comb.dateFrom
                        ? new Date(comb.dateFrom).toLocaleDateString('es-AR')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {comb.dateTo
                        ? new Date(comb.dateTo).toLocaleDateString('es-AR')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant="neutral"
                          title="Vueltas"
                        >{`V: ${comb.lapsNumber}`}</Badge>
                        <Badge
                          variant="neutral"
                          title="Paradas"
                        >{`P: ${comb.obligatoryStopsQuantity}`}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          comb.userType === 'Premium' ? 'warning' : 'default'
                        }
                      >
                        {comb.userType?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
