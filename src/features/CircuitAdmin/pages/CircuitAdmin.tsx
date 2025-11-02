import { lazy, Suspense } from 'react';
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

import { useCircuitAdmin } from '../hooks/useCircuitAdmin.ts';
import { CircuitRow } from '../components/CircuitRow.tsx';
import Spinner from '../../../components/Spinner.tsx';

const CircuitForm = lazy(() => import('../components/CircuitForm'));

export default function CircuitAdmin() {
  const {
    list,
    editing,
    isCreating,
    loading,
    handleSave,
    handleNewCircuit,
    handleEditCircuit,
    handleCancel,
  } = useCircuitAdmin();

  const formContainerRef = useScrollToElement<HTMLDivElement>(editing);

  if (loading) {
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
        {isCreating && editing && (
          <div className="mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                Crear Nuevo Circuito
              </h3>
              <Suspense
                fallback={
                  <div className="text-center p-4">Cargando formulario...</div>
                }
              >
                <CircuitForm
                  initial={editing}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </Suspense>
            </div>
            <Divider className="my-6" />
          </div>
        )}

        {!isCreating && editing && (
          <div className="mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                Editar Circuito: {editing.denomination}
              </h3>
              <Suspense
                fallback={
                  <div className="text-center p-4">Cargando formulario...</div>
                }
              >
                <CircuitForm
                  initial={editing}
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
