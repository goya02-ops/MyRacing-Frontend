import { lazy, Suspense } from 'react';
import { 
  Card, 
  Button,
  Badge,
  Divider
} from '../components/tremor/TremorComponents';

import { useCircuitAdmin } from '../hooks/useCircuitAdmin.ts';
import { CircuitRow } from '../components/CircuitRow.tsx'; // ⬅️ Nuevo

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-400">Cargando circuitos...</p>
      </div>
    );
  }

  return (
    <Card className="text-gray-200">

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Circuitos</h2>
          <Badge variant="neutral">Total: {list.length}</Badge>
        </div>
        <Button onClick={handleNewCircuit}>
          + Nuevo Circuito
        </Button>
      </div>

      {isCreating && editing && (
        <div className="mb-6">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Crear Nuevo Circuito</h3>
            <Suspense fallback={<div className="text-center p-4">Cargando formulario...</div>}>
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
      <div className="hidden md:flex text-sm font-semibold text-gray-400 pb-2 px-4">
        <div className="w-1/4">Denominación</div>
        <div className="w-1/4">Abreviatura</div>
        <div className="w-2/4">Descripción</div>
        <div className="w-1/4 text-right">Acciones</div>
      </div>

      <div className="space-y-2">
        {list.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No hay circuitos para mostrar
          </div>
        ) : (
          list.map((circuit) => (
            <CircuitRow
              key={circuit.id}
              circuit={circuit}
              editing={editing}
              isCreating={isCreating}
              handleSave={handleSave}
              handleEditCircuit={handleEditCircuit}
              handleCancel={handleCancel}
            />
          ))
        )}
      </div>
    </Card>
  );
}