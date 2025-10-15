import { Combination, Simulator } from '../types/entities';
import { useCombinationForm } from '../hooks/useCombinationForm.ts';
import createHandlers from '../handlers/combinationFormHandlers.ts';

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
  onCancel,
}: CombinationFormProps) {
  const {
    form,
    setForm,
    selectedSimulator,
    setSelectedSimulator,
    categoryVersions,
    circuitVersions,
    loading,
  } = useCombinationForm(initial);

  const { handleInputChange, handleSelectChange, handleSimulatorChange } =
    createHandlers(setSelectedSimulator, setForm);

  const getIdValue = (field: 'categoryVersion' | 'circuitVersion') => {
    const val = form[field];
    return typeof val === 'object' && val ? val.id || '' : val || '';
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

      {loading && <p>Cargando versiones...</p>}

      <label>
        2. Categoría:
        <select
          name="categoryVersion"
          value={getIdValue('categoryVersion')}
          onChange={handleSelectChange}
          required
          disabled={!selectedSimulator || loading}
        >
          <option value="">
            {!selectedSimulator
              ? 'Primero seleccione un simulador'
              : loading
              ? 'Cargando...'
              : 'Seleccione una categoría'}
          </option>
          {categoryVersions.map((cv) => {
            const info =
              typeof cv.category === 'object'
                ? `${cv.category.denomination} (${cv.category.abbreviation})`
                : `Cat ID: ${cv.category}`;
            return (
              <option key={cv.id} value={cv.id}>
                {info} - {cv.status}
              </option>
            );
          })}
        </select>
      </label>

      <label>
        3. Circuito:
        <select
          name="circuitVersion"
          value={getIdValue('circuitVersion')}
          onChange={handleSelectChange}
          required
          disabled={!selectedSimulator || loading}
        >
          <option value="">
            {!selectedSimulator
              ? 'Primero seleccione un simulador'
              : loading
              ? 'Cargando...'
              : 'Seleccione un circuito'}
          </option>
          {circuitVersions.map((cv) => {
            const info =
              typeof cv.circuit === 'object'
                ? cv.circuit.denomination
                : `Circ ID: ${cv.circuit}`;
            return (
              <option key={cv.id} value={cv.id}>
                {info}
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
