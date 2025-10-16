import { lazy, useState, useEffect } from 'react';
import { Simulator, CategoryVersion, CircuitVersion, Category, Circuit } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/apiMyRacing.ts';

const SimulatorForm = lazy(() => import('../components/SimulatorForm'));
const CategoryVersionForm = lazy(() => import('../components/CategoryVersionForm'));
const CircuitVersionForm = lazy(() => import('../components/CircuitVersionForm'));

type ActiveManager = {
  type: 'category' | 'circuit' | null;
  simulator: Simulator | null;
};

export default function SimulatorAdmin() {
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [editingSimulator, setEditingSimulator] = useState<Simulator | null>(null);
  const [activeManager, setActiveManager] = useState<ActiveManager>({ type: null, simulator: null });
  const [categoryVersions, setCategoryVersions] = useState<CategoryVersion[]>([]);
  const [circuitVersions, setCircuitVersions] = useState<CircuitVersion[]>([]);
  const [editingVersion, setEditingVersion] = useState<CategoryVersion | CircuitVersion | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);

  useEffect(() => {
    fetchEntities(Simulator).then(setSimulators).catch(console.error);
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
    const shouldFetch = editingVersion && categories.length === 0 && circuits.length === 0;
    if (!shouldFetch) return;
    const fetchFormData = async () => {
      try {
        setCategories(await fetchEntities(Category));
        setCircuits(await fetchEntities(Circuit));
      } catch (error) { console.error('Error fetching form data:', error); }
    };
    fetchFormData();
  }, [editingVersion, categories, circuits]);

  const getRelationId = (entity: any, relationName: string): number | null => {
    const relation = entity[relationName];
    if (relation === null || relation === undefined) return null;
    return typeof relation === 'object' ? relation.id : relation;
  };

  const handleSaveEntity = async <T extends { id?: number }>(
    entityClass: new () => T,
    entity: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    onSuccess: () => void,
    duplicateCheck?: (entity: T) => boolean
  ) => {
    if (duplicateCheck && duplicateCheck(entity)) {
      alert('Esta combinación ya existe.');
      return;
    }
    try {
      const saved = await saveEntity(entityClass, entity);
      setter(prev => prev.some(item => item.id === saved.id)
          ? prev.map(item => (item.id === saved.id ? saved : item))
          : [...prev, saved]
      );
      onSuccess();
    } catch (error) {
      console.error('Error guardando:', error);
      alert(`Error al guardar: ${error}`);
    }
  };

  const handleManagerChange = (type: 'category' | 'circuit' | null, simulator: Simulator | null) => {
    setEditingVersion(null);
    setActiveManager({ type, simulator });
  };

  const renderVersionManager = () => {
    if (!activeManager.simulator) return null;

    if (activeManager.type === 'category') {
      const isDuplicate = (version: CategoryVersion) => {
        return categoryVersions.some(item =>
          getRelationId(item, 'category') === getRelationId(version, 'category') &&
          getRelationId(item, 'simulator') === getRelationId(version, 'simulator') &&
          item.id !== version.id
        );
      };

      return (
        <div style={{ marginTop: '40px' }}>
          <h3>Versiones de Categoría del Simulador {activeManager.simulator.name}</h3>
          <button onClick={() => {
            const newVersion = new CategoryVersion();
            newVersion.simulator = activeManager.simulator!;
            setEditingVersion(newVersion);
          }}>+ Nueva Versión de Categoría</button>
          <table>
            <thead><tr><th>Categoría</th><th>Simulador</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {categoryVersions.map(v => (
                <tr key={v.id}>
                  <td>{(v.category as Category)?.denomination || `ID: ${v.category}`}</td>
                  <td>{(v.simulator as Simulator)?.name || `ID: ${v.simulator}`}</td>
                  <td>{v.status}</td>
                  <td><button onClick={() => setEditingVersion(v)}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {editingVersion && 'category' in editingVersion && (
            <CategoryVersionForm
              initial={editingVersion}
              categories={categories}
              simulators={[activeManager.simulator!]}
              onSave={(v) => handleSaveEntity(CategoryVersion, v, setCategoryVersions, () => setEditingVersion(null), isDuplicate)}
              onCancel={() => setEditingVersion(null)}
            />
          )}
          
          <button onClick={() => handleManagerChange(null, null)}>Cerrar</button>
        </div>
      );
    }

    if (activeManager.type === 'circuit') {
      const isDuplicate = (version: CircuitVersion) => {
        return circuitVersions.some(item =>
          getRelationId(item, 'circuit') === getRelationId(version, 'circuit') &&
          getRelationId(item, 'simulator') === getRelationId(version, 'simulator') &&
          item.id !== version.id
        );
      };

      return (
        <div style={{ marginTop: '40px' }}>
          <h3>Versiones de Circuito del Simulador {activeManager.simulator.name}</h3>
          <button onClick={() => {
            const newVersion = new CircuitVersion();
            newVersion.simulator = activeManager.simulator!;
            setEditingVersion(newVersion);
          }}>+ Nueva Versión de Circuito</button>
          <table>
            <thead><tr><th>Circuito</th><th>Simulador</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {circuitVersions.map(v => (
                <tr key={v.id}>
                  <td>{(v.circuit as Circuit)?.denomination || `ID: ${v.circuit}`}</td>
                  <td>{(v.simulator as Simulator)?.name || `ID: ${v.simulator}`}</td>
                  <td>{v.status}</td>
                  <td><button onClick={() => setEditingVersion(v)}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {editingVersion && 'circuit' in editingVersion && (
            <CircuitVersionForm
              initial={editingVersion}
              circuits={circuits}
              simulators={[activeManager.simulator!]}
              onSave={(v) => handleSaveEntity(CircuitVersion, v, setCircuitVersions, () => setEditingVersion(null), isDuplicate)}
              onCancel={() => setEditingVersion(null)}
            />
          )}
          
          <button onClick={() => handleManagerChange(null, null)}>Cerrar</button>
        </div>
      );
    }

    return null;
  };

  return (
    <section>
      <h2>Administrar Simuladores</h2>
      <button onClick={() => setEditingSimulator(new Simulator())}>+ Nuevo Simulador</button>
      <table>
        <thead><tr><th>Nombre</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {simulators.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.status}</td>
              <td>
                <button onClick={() => setEditingSimulator(s)}>Editar</button>
                <button onClick={() => handleManagerChange('category', s)}>Ver Categorías</button>
                <button onClick={() => handleManagerChange('circuit', s)}>Ver Circuitos</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingSimulator && (
        <SimulatorForm
          initial={editingSimulator}
          onCancel={() => setEditingSimulator(null)}
          onSave={(sim) => handleSaveEntity(Simulator, sim, setSimulators, () => setEditingSimulator(null))}
        />
      )}

      {renderVersionManager()}
    </section>
  );
}