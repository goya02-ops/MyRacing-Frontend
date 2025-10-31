import { lazy, Suspense } from 'react';
import { useScrollToElement } from '../hooks/useScrollToElement';
import { useSimulatorLogic } from '../hooks/useSimulatorLogic'; 
import { useVersionManagerLogic } from '../hooks/useVersionManagerLogic';
import { Simulator, CategoryVersion, CircuitVersion } from '../types/entities'; 
import {
  Card, Button, Badge, Divider, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell,
} from '../components/tremor/TremorComponents';

const SimulatorForm = lazy(() => import('../components/SimulatorForm'));
const CategoryVersionForm = lazy(() => import('../components/CategoryVersionForm'));
const CircuitVersionForm = lazy(() => import('../components/CircuitVersionForm'));

const VersionManager: React.FC<any> = ({
  activeManager, categories, circuits, onClose,
  categoryVersions, circuitVersions, editingVersion, isCreatingVersion,
  handleNewVersion, handleEditVersion, handleCancelVersion, 
  onSaveCategoryVersion, onSaveCircuitVersion
}) => {
  if (!activeManager.simulator) return null;

  const isCategory = activeManager.type === 'category';
  const title = isCategory ? 'Categorías' : 'Circuitos';

  return (
    <div className="bg-gray-900/50 p-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
        <h3 className="text-lg font-semibold">
          Versiones de {title} para <span className="text-orange-400">{activeManager.simulator.name}</span>
        </h3>
        <Button onClick={handleNewVersion} className="w-full sm:w-auto">
          + Nueva Versión
        </Button>
      </div>

      {/* FORMULARIO DE EDICIÓN/CREACIÓN */}
      {editingVersion && (
        <div className="mb-4">
          <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-md font-semibold mb-3 text-orange-400">
                {isCreatingVersion ? 'Crear' : 'Editar'} Versión
              </h4>
              {isCategory ? (
                <CategoryVersionForm
                  initial={editingVersion as CategoryVersion}
                  categories={categories}
                  simulators={[activeManager.simulator!]}
                  onSave={onSaveCategoryVersion}
                  onCancel={handleCancelVersion}
                />
              ) : (
                <CircuitVersionForm
                  initial={editingVersion as CircuitVersion}
                  circuits={circuits}
                  simulators={[activeManager.simulator!]}
                  onSave={onSaveCircuitVersion}
                  onCancel={handleCancelVersion}
                />
              )}
            </div>
            <Divider className="my-4" />
          </Suspense>
        </div>
      )}

      {/* TABLA DE VERSIONES */}
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Denominación</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Usamos las versiones cargadas por el hook anidado */}
            {(isCategory ? categoryVersions : circuitVersions).map((v: any) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">
                  {(isCategory ? v.category?.denomination : v.circuit?.denomination) || 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={v.status === 'Activo' ? 'success' : 'error'}>{v.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant={editingVersion?.id === v.id && !isCreatingVersion ? 'primary' : 'ghost'}
                    onClick={() => editingVersion?.id === v.id && !isCreatingVersion ? handleCancelVersion() : handleEditVersion(v)}
                  >
                    {editingVersion?.id === v.id && !isCreatingVersion ? 'Cancelar' : 'Editar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Divider className="my-4" />
      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};


export default function SimulatorAdmin() {
  const {
    simulators, editingSimulator, isCreatingSimulator, activeManager,
    categories, circuits, loading,
    handleNewSimulator, handleEditSimulator, handleCancelSimulator, handleSaveSimulator,
    setActiveManager, handleSaveEntity 
  } = useSimulatorLogic();

  const versionLogic = useVersionManagerLogic(activeManager, categories, circuits, handleSaveEntity);

  const formContainerRef = useScrollToElement<HTMLDivElement>(editingSimulator);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-400">
        Cargando simuladores...
      </div>
    );
  }

  return (
    <Card className="text-gray-200">
      {/* HEADER Y BOTONES DEL ADMIN PRINCIPAL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Simuladores</h2>
          <Badge variant="neutral">Total: {simulators.length}</Badge>
        </div>
        <Button onClick={handleNewSimulator} className="w-full sm:w-auto">+ Nuevo Simulador</Button>
      </div>

      {/* FORMULARIO DE SIMULADOR */}
      <div ref={formContainerRef}>
        {(isCreatingSimulator || editingSimulator) && (
          <div className="mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                {isCreatingSimulator ? 'Crear Nuevo' : `Editar Simulador: ${editingSimulator?.name}`}
              </h3>
              <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
                <SimulatorForm
                  initial={editingSimulator as Simulator}
                  onCancel={handleCancelSimulator}
                  onSave={handleSaveSimulator} 
                />
              </Suspense>
            </div>
            <Divider className="my-6" />
          </div>
        )}
      </div>

      {/* TABLA DE SIMULADORES */}
      <div className="overflow-x-auto">
        <Table>
          {/* ... (TableHead) ... */}
          <TableBody>
            {simulators.map((s) => (
              <Suspense key={s.id} fallback={<TableRow><TableCell colSpan={3}>Cargando...</TableCell></TableRow>}>
                <TableRow>
                  <TableCell className="font-semibold">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'Activo' ? 'success' : 'error'}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* BOTONES DE ACCIÓN PARA CADA FILA */}
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Button
                        variant={editingSimulator?.id === s.id && !isCreatingSimulator ? 'primary' : 'ghost'}
                        onClick={() => editingSimulator?.id === s.id && !isCreatingSimulator ? handleCancelSimulator() : handleEditSimulator(s)}
                      >
                        {editingSimulator?.id === s.id && !isCreatingSimulator ? 'Cancelar' : 'Editar'}
                      </Button>

                      {/* Botón Ver Cat. */}
                      <Button
                        variant={activeManager.simulator?.id === s.id && activeManager.type === 'category' ? 'primary' : 'ghost'}
                        onClick={() => {
                          if (editingSimulator) handleCancelSimulator();
                          setActiveManager(
                            activeManager.simulator?.id === s.id && activeManager.type === 'category'
                              ? { type: null, simulator: null }
                              : { type: 'category', simulator: s }
                          );
                        }}
                      >
                        {activeManager.simulator?.id === s.id && activeManager.type === 'category' ? 'Ocultar' : 'Ver'} Cat.
                      </Button>

                      {/* Botón Ver Circ. */}
                      <Button
                        variant={activeManager.simulator?.id === s.id && activeManager.type === 'circuit' ? 'primary' : 'ghost'}
                        onClick={() => {
                          if (editingSimulator) handleCancelSimulator();
                          setActiveManager(
                            activeManager.simulator?.id === s.id && activeManager.type === 'circuit'
                              ? { type: null, simulator: null }
                              : { type: 'circuit', simulator: s }
                          );
                        }}
                      >
                        {activeManager.simulator?.id === s.id && activeManager.type === 'circuit' ? 'Ocultar' : 'Ver'} Circ.
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* MANAGER ANIDADO (RENDERIZADO CONDICIONAL) */}
                {activeManager.simulator?.id === s.id && !editingSimulator && (
                  <TableRow key={`${s.id}-manager`}>
                    <TableCell colSpan={3} className="p-0">
                      <VersionManager
                        activeManager={activeManager}
                        categories={categories}
                        circuits={circuits}
                        handleSaveEntity={handleSaveEntity} 
                        onClose={() => setActiveManager({ type: null, simulator: null })}
                        
                        categoryVersions={versionLogic.categoryVersions}
                        circuitVersions={versionLogic.circuitVersions}
                        editingVersion={versionLogic.editingVersion}
                        isCreatingVersion={versionLogic.isCreatingVersion}
                        handleNewVersion={versionLogic.handleNewVersion}
                        handleEditVersion={versionLogic.handleEditVersion}
                        handleCancelVersion={versionLogic.handleCancelVersion}
                        onSaveCategoryVersion={versionLogic.onSaveCategoryVersion}
                        onSaveCircuitVersion={versionLogic.onSaveCircuitVersion}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </Suspense>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
