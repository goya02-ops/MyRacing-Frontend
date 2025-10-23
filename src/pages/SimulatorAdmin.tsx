import { lazy, useState, useEffect, Suspense } from 'react';
import { Simulator, CategoryVersion, CircuitVersion, Category, Circuit } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/apiMyRacing.ts';

import { 
  Card, 
  Button,
  Badge,
  Divider
} from '../components/tremor/TremorComponents';

const SimulatorForm = lazy(() => import('../components/SimulatorForm'));
const CategoryVersionForm = lazy(() => import('../components/CategoryVersionForm'));
const CircuitVersionForm = lazy(() => import('../components/CircuitVersionForm'));

type ActiveManager = {
  type: 'category' | 'circuit' | null;
  simulator: Simulator | null;
};

interface VersionManagerProps {
  activeManager: ActiveManager;
  categoryVersions: CategoryVersion[];
  circuitVersions: CircuitVersion[];
  categories: Category[];
  circuits: Circuit[];
  setCategoryVersions: React.Dispatch<React.SetStateAction<CategoryVersion[]>>;
  setCircuitVersions: React.Dispatch<React.SetStateAction<CircuitVersion[]>>;
  handleSaveEntity: <T extends { id?: number }>(
    entityClass: new () => T, entity: T, setter: React.Dispatch<React.SetStateAction<T[]>>, onSuccess: () => void, duplicateCheck?: (entity: T) => boolean
  ) => Promise<void>;
  onClose: () => void;
}

export default function SimulatorAdmin() {
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [editingSimulator, setEditingSimulator] = useState<Simulator | null>(null);
  const [isCreatingSimulator, setIsCreatingSimulator] = useState(false);
  const [activeManager, setActiveManager] = useState<ActiveManager>({ type: null, simulator: null });
  const [categoryVersions, setCategoryVersions] = useState<CategoryVersion[]>([]);
  const [circuitVersions, setCircuitVersions] = useState<CircuitVersion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEntities(Simulator).then(setSimulators).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeManager.simulator) return;
    const fetchVersions = async () => {
      try {
        if (activeManager.type === 'category') {
          const allVersions = await fetchEntities(CategoryVersion);
          setCategoryVersions(allVersions.filter(v => getRelationId(v, 'simulator') === activeManager.simulator?.id));
        } else if (activeManager.type === 'circuit') {
          const allVersions = await fetchEntities(CircuitVersion);
          setCircuitVersions(allVersions.filter(v => getRelationId(v, 'simulator') === activeManager.simulator?.id));
        }
      } catch (error) { console.error('Error fetching versions:', error); }
    };
    fetchVersions();
  }, [activeManager]);

  useEffect(() => {
    const shouldFetch = (activeManager.type !== null) && categories.length === 0 && circuits.length === 0;
    if (!shouldFetch) return;
    const fetchFormData = async () => {
      try {
        setCategories(await fetchEntities(Category));
        setCircuits(await fetchEntities(Circuit));
      } catch (error) { console.error('Error fetching form data:', error); }
    };
    fetchFormData();
  }, [activeManager.type, categories, circuits]);

  const getRelationId = (entity: any, relationName: string): number | null => {
    const relation = entity[relationName];
    if (relation === null || relation === undefined) return null;
    return typeof relation === 'object' ? relation.id : relation;
  };

  const handleSaveEntity = async <T extends { id?: number }>(
    entityClass: new () => T, entity: T, setter: React.Dispatch<React.SetStateAction<T[]>>, onSuccess: () => void, duplicateCheck?: (entity: T) => boolean
  ) => {
    if (duplicateCheck && duplicateCheck(entity)) { alert('Esta combinación ya existe.'); return; }
    const entityToSave = { ...entity };
    for (const key in entityToSave) {
        const value = entityToSave[key as keyof T];
        if (typeof value === 'object' && value !== null && 'id' in value) { (entityToSave as any)[key] = (value as any).id; }
    }
    try {
      const saved = await saveEntity(entityClass, entityToSave as T);
      const hydratedSaved: any = { ...saved };
      if ('category' in saved) { hydratedSaved.category = categories.find(c => c.id === getRelationId(saved, 'category')) || (saved as any).category; }
      if ('circuit' in saved) { hydratedSaved.circuit = circuits.find(c => c.id === getRelationId(saved, 'circuit')) || (saved as any).circuit; }
      if ('simulator' in saved) { hydratedSaved.simulator = simulators.find(s => s.id === getRelationId(saved, 'simulator')) || (saved as any).simulator; }
      setter(prev => {
        const existingIndex = prev.findIndex(item => item.id === saved.id);
        if (existingIndex > -1) {
          const newArray = [...prev]; newArray[existingIndex] = hydratedSaved as T; return newArray;
        } else { return [...prev, hydratedSaved as T]; }
      });
      onSuccess();
    } catch (error) { console.error('Error guardando:', error); alert(`Error al guardar: ${error}`); }
  };

  const handleNewSimulator = () => {
    setEditingSimulator(new Simulator());
    setIsCreatingSimulator(true);
    setActiveManager({ type: null, simulator: null });
  };

  const handleEditSimulator = (sim: Simulator) => {
    setEditingSimulator(sim);
    setIsCreatingSimulator(false);
    setActiveManager({ type: null, simulator: null });
  };

  const handleCancelSimulator = () => {
    setEditingSimulator(null);
    setIsCreatingSimulator(false);
  };

  const handleSaveSimulator = (sim: Simulator) => {
    handleSaveEntity(Simulator, sim, setSimulators, () => {
      setEditingSimulator(null);
      setIsCreatingSimulator(false);
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20 text-gray-400">Cargando simuladores...</div>;
  }
  
  return (
    <Card className="text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Simuladores</h2>
          <Badge variant="neutral">Total: {simulators.length}</Badge>
        </div>
        <Button onClick={handleNewSimulator}>+ Nuevo Simulador</Button>
      </div>

      {isCreatingSimulator && editingSimulator && (
        <div className="mb-6">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Crear Nuevo Simulador</h3>
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
      
      <div className="space-y-4">
        {simulators.map((s) => (
          <div key={s.id} className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center py-4 border-b border-gray-700/50">
              <div className="w-full md:w-1/3 mb-2 md:mb-0 font-semibold">{s.name}</div>
              <div className="w-full md:w-1/6 mb-2 md:mb-0">
                <Badge variant={s.status === 'Activo' ? 'success' : 'error'}>
                  {s.status}
                </Badge>
              </div>
              <div className="w-full md:w-1/2 flex justify-end gap-2 flex-wrap">
                <Button 
                  variant={editingSimulator?.id === s.id && !isCreatingSimulator ? 'primary' : 'ghost'}
                  onClick={() => editingSimulator?.id === s.id && !isCreatingSimulator ? handleCancelSimulator() : handleEditSimulator(s)}
                >
                  {editingSimulator?.id === s.id && !isCreatingSimulator ? 'Cancelar Edición' : 'Editar'}
                </Button>
                
                {/* ✅ CORREGIDO: Sin disabled, cierra edición al abrir */}
                <Button 
                  variant={activeManager.simulator?.id === s.id && activeManager.type === 'category' ? 'primary' : 'ghost'}
                  onClick={() => {
                    if (editingSimulator) {
                      handleCancelSimulator();
                    }
                    setActiveManager(
                      activeManager.simulator?.id === s.id && activeManager.type === 'category'
                        ? { type: null, simulator: null }
                        : { type: 'category', simulator: s }
                    );
                  }}
                >
                  {activeManager.simulator?.id === s.id && activeManager.type === 'category' ? 'Ocultar' : 'Ver'} Categorías
                </Button>
                
                {/* ✅ CORREGIDO: Sin disabled, cierra edición al abrir */}
                <Button 
                  variant={activeManager.simulator?.id === s.id && activeManager.type === 'circuit' ? 'primary' : 'ghost'}
                  onClick={() => {
                    if (editingSimulator) {
                      handleCancelSimulator();
                    }
                    setActiveManager(
                      activeManager.simulator?.id === s.id && activeManager.type === 'circuit'
                        ? { type: null, simulator: null }
                        : { type: 'circuit', simulator: s }
                    );
                  }}
                >
                  {activeManager.simulator?.id === s.id && activeManager.type === 'circuit' ? 'Ocultar' : 'Ver'} Circuitos
                </Button>
              </div>
            </div>

            {editingSimulator?.id === s.id && !isCreatingSimulator && (
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-2">
                <h3 className="text-lg font-semibold mb-4 text-orange-400">Editar Simulador</h3>
                <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
                  <SimulatorForm 
                    initial={editingSimulator as Simulator} 
                    onCancel={handleCancelSimulator} 
                    onSave={handleSaveSimulator} 
                  />
                </Suspense>
              </div>
            )}

            {activeManager.simulator?.id === s.id && !editingSimulator && (
              <VersionManager
                activeManager={activeManager}
                categoryVersions={categoryVersions}
                circuitVersions={circuitVersions}
                categories={categories}
                circuits={circuits}
                setCategoryVersions={setCategoryVersions}
                setCircuitVersions={setCircuitVersions}
                handleSaveEntity={handleSaveEntity}
                onClose={() => setActiveManager({ type: null, simulator: null })}
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

const VersionManager: React.FC<VersionManagerProps> = ({
  activeManager, categoryVersions, circuitVersions, categories, circuits, setCategoryVersions, setCircuitVersions, handleSaveEntity, onClose
}) => {
  const [editingVersion, setEditingVersion] = useState<CategoryVersion | CircuitVersion | null>(null);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  
  if (!activeManager.simulator) return null;
  
  const isCategory = activeManager.type === 'category';
  const title = isCategory ? 'Categorías' : 'Circuitos';

  const getRelationId = (entity: any, relationName: string): number | null => {
    const relation = entity[relationName];
    if (relation === null || relation === undefined) return null;
    return typeof relation === 'object' ? relation.id : relation;
  };

  const handleNewVersion = () => {
    const newVersion = isCategory ? new CategoryVersion() : new CircuitVersion();
    newVersion.simulator = activeManager.simulator!;
    setEditingVersion(newVersion);
    setIsCreatingVersion(true);
  };

  const handleEditVersion = (version: CategoryVersion | CircuitVersion) => {
    setEditingVersion(version);
    setIsCreatingVersion(false);
  };

  const handleCancelVersion = () => {
    setEditingVersion(null);
    setIsCreatingVersion(false);
  };

  const onSaveCategoryVersion = (v: CategoryVersion) => {
    const isDuplicate = (version: CategoryVersion): boolean => {
      return categoryVersions.some(item =>
        getRelationId(item, 'category') === getRelationId(version, 'category') &&
        getRelationId(item, 'simulator') === getRelationId(version, 'simulator') &&
        item.id !== version.id
      );
    };
    handleSaveEntity(CategoryVersion, v, setCategoryVersions, handleCancelVersion, isDuplicate);
  };

  const onSaveCircuitVersion = (v: CircuitVersion) => {
    const isDuplicate = (version: CircuitVersion): boolean => {
      return circuitVersions.some(item =>
        getRelationId(item, 'circuit') === getRelationId(version, 'circuit') &&
        getRelationId(item, 'simulator') === getRelationId(version, 'simulator') &&
        item.id !== version.id
      );
    };
    handleSaveEntity(CircuitVersion, v, setCircuitVersions, handleCancelVersion, isDuplicate);
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Versiones de {title} para <span className="text-orange-400">{activeManager.simulator.name}</span>
        </h3>
        <Button onClick={handleNewVersion}>+ Nueva Versión</Button>
      </div>

      {isCreatingVersion && editingVersion && (
        <div className="mb-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-md font-semibold mb-3 text-orange-400">Crear Nueva Versión</h4>
            <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
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
            </Suspense>
          </div>
          <Divider className="my-4" />
        </div>
      )}
      
      <div className="space-y-2">
        {(isCategory ? categoryVersions : circuitVersions).map((v: any) => (
          <div key={v.id} className="space-y-2">
            <div className="flex items-center py-3 border-b border-gray-700/50">
              <div className="flex-1 font-medium">{(isCategory ? v.category?.denomination : v.circuit?.denomination) || 'N/A'}</div>
              <div className="w-1/4">
                <Badge variant={v.status === 'Activo' ? 'success' : 'error'}>{v.status}</Badge>
              </div>
              <div className="flex justify-end">
                <Button 
                  variant={editingVersion?.id === v.id && !isCreatingVersion ? 'primary' : 'ghost'} 
                  onClick={() => editingVersion?.id === v.id && !isCreatingVersion ? handleCancelVersion() : handleEditVersion(v)}
                >
                  {editingVersion?.id === v.id && !isCreatingVersion ? 'Cancelar' : 'Editar'}
                </Button>
              </div>
            </div>

            {editingVersion?.id === v.id && !isCreatingVersion && (
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-2">
                <h4 className="text-md font-semibold mb-3 text-orange-400">Editar Versión</h4>
                <Suspense fallback={<div className="text-center p-4">Cargando...</div>}>
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
                </Suspense>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <Divider className="my-4" />
      <div className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};