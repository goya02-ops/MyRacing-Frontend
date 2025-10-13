import { useEffect, useState } from 'react';
import { Combination, CategoryVersion, CircuitVersion, Simulator } from '../types/entities';
import { fetchEntities } from '../services/service';

interface CombinationFormProps {
  initial: Combination;
  simulators: Simulator[];
  onSave: (combination: Combination) => void;
  onCancel: () => void;
}

export default function CombinationForm({ 
  initial, 
  simulators,
  onSave, 
  onCancel 
}: CombinationFormProps) {
  const [form, setForm] = useState<Combination>({
    ...initial,
    raceIntervalMinutes: initial.raceIntervalMinutes || 30
  });
  const [selectedSimulator, setSelectedSimulator] = useState<number | undefined>(undefined);
  const [categoryVersions, setCategoryVersions] = useState<CategoryVersion[]>([]);
  const [circuitVersions, setCircuitVersions] = useState<CircuitVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Detectar el simulador automáticamente cuando se carga un registro existente
  useEffect(() => {
    if (initial.id && initial.categoryVersion && typeof initial.categoryVersion === 'object') {
      const simulator = initial.categoryVersion.simulator;
      const simId = typeof simulator === 'object' ? simulator.id : simulator;
      setSelectedSimulator(simId);
    } else {
      setInitialLoadDone(true);
    }
  }, [initial]);

  // Traer CategoryVersions y CircuitVersions cuando se selecciona un simulador
  useEffect(() => {
    if (selectedSimulator) {
      setLoadingVersions(true);
      Promise.all([
        fetchEntities(CategoryVersion),
        fetchEntities(CircuitVersion),
      ])
        .then(([catVersions, circVersions]) => {
          // Filtrar por simulador seleccionado
          const filteredCatVersions = catVersions.filter(cv => {
            const simId = typeof cv.simulator === 'object' ? cv.simulator.id : cv.simulator;
            return simId === selectedSimulator;
          });
          const filteredCircVersions = circVersions.filter(cv => {
            const simId = typeof cv.simulator === 'object' ? cv.simulator.id : cv.simulator;
            return simId === selectedSimulator;
          });
          
          setCategoryVersions(filteredCatVersions);
          setCircuitVersions(filteredCircVersions);
          
          // Si estamos editando, mantener los valores originales
          if (initial.id && !initialLoadDone) {
            setForm(prev => ({
              ...prev,
              categoryVersion: initial.categoryVersion,
              circuitVersion: initial.circuitVersion,
            }));
            setInitialLoadDone(true);
          }
        })
        .catch(error => {
          console.error('Error fetching versions:', error);
        })
        .finally(() => {
          setLoadingVersions(false);
        });
    }
  }, [selectedSimulator, initial, initialLoadDone]);

  const handleSimulatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const simId = e.target.value ? Number(e.target.value) : undefined;
    setSelectedSimulator(simId);
    // Reseteamos las selecciones cuando cambia el simulador
    setForm(prev => ({
      ...prev,
      categoryVersion: undefined,
      circuitVersion: undefined,
    }));
    // Limpiamos las listas
    setCategoryVersions([]);
    setCircuitVersions([]);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: name === 'userType' ? value : (value ? Number(value) : undefined)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: type === 'number' ? (value ? Number(value) : 0) : value
    }));
  };

  // Función auxiliar para obtener el valor actual de categoryVersion
  const getCategoryVersionValue = () => {
    if (typeof form.categoryVersion === 'object' && form.categoryVersion) {
      return form.categoryVersion.id || '';
    }
    return form.categoryVersion || '';
  };

  // Función auxiliar para obtener el valor actual de circuitVersion
  const getCircuitVersionValue = () => {
    if (typeof form.circuitVersion === 'object' && form.circuitVersion) {
      return form.circuitVersion.id || '';
    }
    return form.circuitVersion || '';
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <label>
        1. Simulador:
        <select
          name="simulator"
          value={selectedSimulator || ''}
          onChange={handleSimulatorChange}
          required
        >
          <option value="">Seleccione un simulador</option>
          {simulators.map((sim) => (
            <option key={sim.id} value={sim.id}>
              {sim.name}
            </option>
          ))}
        </select>
      </label>

      {loadingVersions && <p>Cargando versiones...</p>}

      <label>
        2. Versión de Categoría:
        <select
          name="categoryVersion"
          value={getCategoryVersionValue()}
          onChange={handleSelectChange}
          required
          disabled={!selectedSimulator || loadingVersions}
        >
          <option value="">
            {!selectedSimulator 
              ? 'Primero seleccione un simulador' 
              : loadingVersions
              ? 'Cargando...'
              : 'Seleccione una categoría'}
          </option>
          {categoryVersions.map((cv) => {
            const categoryInfo = typeof cv.category === 'object' 
              ? `${cv.category.denomination} (${cv.category.abbreviation})` 
              : `Cat ID: ${cv.category}`;
            
            return (
              <option key={cv.id} value={cv.id}>
                {categoryInfo} - {cv.status}
              </option>
            );
          })}
        </select>
      </label>

      <label>
        3. Versión de Circuito:
        <select
          name="circuitVersion"
          value={getCircuitVersionValue()}
          onChange={handleSelectChange}
          required
          disabled={!selectedSimulator || loadingVersions}
        >
          <option value="">
            {!selectedSimulator 
              ? 'Primero seleccione un simulador' 
              : loadingVersions
              ? 'Cargando...'
              : 'Seleccione un circuito'}
          </option>
          {circuitVersions.map((cv) => {
            const circuitInfo = typeof cv.circuit === 'object'
              ? cv.circuit.denomination
              : `Circ ID: ${cv.circuit}`;
            
            return (
              <option key={cv.id} value={cv.id}>
                {circuitInfo}
              </option>
            );
          })}
        </select>
      </label>

      <label>
        Fecha y Hora de Inicio:
        <input
          type="datetime-local"
          name="dateFrom"
          value={form.dateFrom}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Fecha y Hora de Fin:
        <input
          type="datetime-local"
          name="dateTo"
          value={form.dateTo}
          onChange={handleInputChange}
          required
        />
      </label>

      <label>
        Número de Vueltas:
        <input
          type="number"
          name="lapsNumber"
          value={form.lapsNumber}
          onChange={handleInputChange}
          min="1"
          required
        />
      </label>

      <label>
        Cantidad de Paradas Obligatorias:
        <input
          type="number"
          name="obligatoryStopsQuantity"
          value={form.obligatoryStopsQuantity}
          onChange={handleInputChange}
          min="0"
          required
        />
      </label>

      <label>
        Intervalo entre Carreras (minutos):
        <input
          type="number"
          name="raceIntervalMinutes"
          value={form.raceIntervalMinutes}
          onChange={handleInputChange}
          min="1"
          placeholder="Ej: 30 (cada media hora)"
          required
        />
      </label>

      <label>
        Tipo de Usuario:
        <select
          name="userType"
          value={form.userType}
          onChange={handleSelectChange}
          required
        >
          <option value="">Seleccione un tipo</option>
          <option value="Común">Común</option>
          <option value="Premium">Premium</option>
        </select>
      </label>

      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}