import { lazy, useState, useEffect, Suspense } from 'react';
import { Circuit } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/apiMyRacing.ts';
import { 
  Card, 
  Button,
  Badge,
  Divider
} from '../components/tremor/TremorComponents';

const CircuitForm = lazy(() => import('../components/CircuitForm'));

export default function CircuitAdmin() {
  const [list, setList] = useState<Circuit[]>([]);
  const [editing, setEditing] = useState<Circuit | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEntities(Circuit)
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (circuit: Circuit) => {
    const saved = await saveEntity(Circuit, circuit);
    setList((prev) =>
      prev.some((c) => c.id === saved.id)
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [...prev, saved]
    );
    setEditing(null);
    setIsCreating(false);
  };

  const handleNewCircuit = () => {
    setEditing(new Circuit());
    setIsCreating(true);
  };

  const handleEditCircuit = (circuit: Circuit) => {
    setEditing(circuit);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setIsCreating(false);
  };

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
            <div key={circuit.id} className="space-y-2">
              
              <div className="flex flex-col md:flex-row items-start md:items-center py-4 px-4 hover:bg-gray-900/50 rounded-lg border-b border-gray-700/50">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 font-medium">{circuit.denomination}</div>
                <div className="w-full md:w-1/4 mb-2 md:mb-0">{circuit.abbreviation}</div>
                <div className="w-full md:w-2/4 mb-2 md:mb-0 truncate">{circuit.description}</div>
                <div className="w-full md:w-1/4 flex justify-end">
                  <Button
                    variant={editing?.id === circuit.id && !isCreating ? 'primary' : 'ghost'}
                    onClick={() => editing?.id === circuit.id && !isCreating ? handleCancel() : handleEditCircuit(circuit)}
                  >
                    {editing?.id === circuit.id && !isCreating ? 'Cancelar' : 'Editar'}
                  </Button>
                </div>
              </div>

              
              {editing?.id === circuit.id && !isCreating && (
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
          ))
        )}
      </div>
    </Card>
  );
}