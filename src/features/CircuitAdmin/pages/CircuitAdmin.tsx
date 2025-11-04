// src/features/CircuitAdmin/pages/CircuitAdmin.tsx

import { lazy, Suspense, useState, useCallback } from 'react';
import { Circuit } from '../../../types/entities'; // Importamos la entidad
// Hooks conceptuales de TanStack Query (se implementarán a continuación)
import { useEntityQuery } from '../../../hooks/useEntityQuery.ts';
import { useEntityMutation } from '../../../hooks/useEntityMutation.ts';

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
} from '../../../components/tremor/TremorComponents';
import { useScrollToElement } from '../../../hooks/useScrollToElement.ts';
import { CircuitRow } from '../components/CircuitRow.tsx';
import Spinner from '../../../components/Spinner.tsx';

const CircuitForm = lazy(() => import('../components/CircuitForm'));

export default function CircuitAdmin() {
  const { list, isLoading } = useEntityQuery(Circuit);

  const { saveEntity } = useEntityMutation(Circuit);

  const [editing, setEditing] = useState<Circuit | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const formContainerRef = useScrollToElement<HTMLDivElement>(editing);

  const handleCancel = useCallback(() => {
    setEditing(null);
    setIsCreating(false);
  }, []);

  const handleSave = useCallback(
    async (circuit: Circuit) => {
      try {
        await saveEntity(circuit);
        handleCancel();
      } catch (error: any) {
        console.error('Error al guardar circuito:', error);
        alert(`Error al guardar: ${error.message || String(error)}`);
      }
    },
    [saveEntity, handleCancel]
  );

  const handleNewCircuit = useCallback(() => {
    setEditing(new Circuit());
    setIsCreating(true);
  }, []);

  const handleEditCircuit = useCallback((circuit: Circuit) => {
    setEditing({ ...circuit });
    setIsCreating(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner>Cargando circuitos...</Spinner>
      </div>
    );
  }

  return (
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
          <h2 className="text-xl font-semibold">Circuito</h2>
          <Badge variant="neutral">Total: {list.length}</Badge>
        </div>
        <Button onClick={handleNewCircuit} className="w-full sm:w-auto">
          + Nuevo Circuito
        </Button>
      </div>

      <div ref={formContainerRef}>
        {(isCreating || editing) && (
          <div className="mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                {isCreating
                  ? 'Crear Nuevo Circuito'
                  : `Editar Circuito: ${editing?.denomination}`}
              </h3>
              <Suspense
                fallback={
                  <div className="text-center p-4">Cargando formulario...</div>
                }
              >
                <CircuitForm
                  initial={editing!}
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
        <div className="text-center py-12 text-gray-400">
          No hay circuitos para mostrar
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Denominación</TableHeaderCell>
                <TableHeaderCell>Abreviatura</TableHeaderCell>
                <TableHeaderCell>Descripción</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Acciones
                </TableHeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {list.map((circuit) => (
                <CircuitRow
                  key={circuit.id}
                  circuit={circuit}
                  editing={editing}
                  isCreating={isCreating}
                  handleEditCircuit={handleEditCircuit}
                  handleCancel={handleCancel}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
