import { lazy, useState, useEffect, Suspense } from 'react';
import { Circuit } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/apiMyRacing.ts';
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
import { useScrollToElement } from '../hooks/useScrollToElement.ts';

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

  const formContainerRef = useScrollToElement<HTMLDivElement>(editing);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-400">Cargando circuitos...</p>
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
                <TableRow key={circuit.id}>
                  <TableCell className="font-medium">
                    {circuit.denomination}
                  </TableCell>
                  <TableCell>{circuit.abbreviation}</TableCell>
                  <TableCell className="truncate max-w-xs">
                    {circuit.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={
                        editing?.id === circuit.id && !isCreating
                          ? 'primary'
                          : 'ghost'
                      }
                      onClick={() =>
                        editing?.id === circuit.id && !isCreating
                          ? handleCancel()
                          : handleEditCircuit(circuit)
                      }
                    >
                      {editing?.id === circuit.id && !isCreating
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
  );
}
