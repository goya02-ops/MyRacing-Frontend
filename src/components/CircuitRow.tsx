// src/components/CircuitRow.tsx

import { lazy, Suspense } from 'react';
import { Circuit } from '../types/entities.ts';
import { Button } from './tremor/TremorComponents'; // Ajusta la ruta a tus componentes Tremor

// Cargamos el formulario de forma diferida
const CircuitForm = lazy(() => import('./CircuitForm'));

interface CircuitRowProps {
  // Datos y estado que vienen del hook
  circuit: Circuit;
  editing: Circuit | null;
  isCreating: boolean;
  
  // Handlers que vienen del hook
  handleSave: (circuit: Circuit) => Promise<void>;
  handleEditCircuit: (circuit: Circuit) => void;
  handleCancel: () => void;
}

export const CircuitRow: React.FC<CircuitRowProps> = ({
  circuit,
  editing,
  isCreating,
  handleSave,
  handleEditCircuit,
  handleCancel,
}) => {
  
  const isThisRowEditing = editing?.id === circuit.id && !isCreating;

  return (
    <div className="space-y-2">
    
      <div className="flex flex-col md:flex-row items-start md:items-center py-4 px-4 hover:bg-gray-900/50 rounded-lg border-b border-gray-700/50">
        <div className="w-full md:w-1/4 mb-2 md:mb-0 font-medium">{circuit.denomination}</div>
        <div className="w-full md:w-1/4 mb-2 md:mb-0">{circuit.abbreviation}</div>
        <div className="w-full md:w-2/4 mb-2 md:mb-0 truncate">{circuit.description}</div>
        <div className="w-full md:w-1/4 flex justify-end">

          <Button
            variant={isThisRowEditing ? 'primary' : 'ghost'}
            onClick={() => isThisRowEditing ? handleCancel() : handleEditCircuit(circuit)}
          >
            {isThisRowEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </div>

      {isThisRowEditing && (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-2">
          <h3 className="text-lg font-semibold mb-4 text-orange-400">Editar Circuito</h3>
          <Suspense fallback={<div className="text-center p-4">Cargando formulario...</div>}>
            <CircuitForm
              initial={editing as Circuit}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
};