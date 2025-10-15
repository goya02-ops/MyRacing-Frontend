import { lazy, useCallback } from 'react';
import { Combination } from '../types/entities';
import { saveEntity } from '../services/apiMyRacing';
import useCombinationAdmin from '../hooks/useCombinationAdmin';
import { isDuplicateCombination } from '../utils/combination/duplicate';
import { normalizeCombination } from '../utils/combination/normalize';
import {
  getCategoryName,
  getCircuitName,
  getSimulatorName,
} from '../utils/combination/getters';

const CombinationForm = lazy(() => import('../components/CombinationForm'));

export default function CombinationAdmin() {
  const { list, setList, editing, setEditing, simulators, loading } =
    useCombinationAdmin();

  const handleSave = useCallback(
    async (combination: Combination) => {
      const normalized = normalizeCombination(combination);

      if (isDuplicateCombination(list, normalized)) {
        alert('Esta combinación ya existe con las mismas fechas.');
        return;
      }

      try {
        const saved = await saveEntity(Combination, normalized);
        setList((prev) =>
          prev.some((c) => c.id === saved.id)
            ? prev.map((c) => (c.id === saved.id ? saved : c))
            : [...prev, saved]
        );
        setEditing(null);
      } catch (error) {
        console.error('Error guardando:', error);
        alert('Error al guardar la combinación');
      }
    },
    [list, setList, setEditing]
  );

  if (loading) return <div>Cargando...</div>;

  return (
    <section>
      <h2>Administrar Combinaciones</h2>
      <button onClick={() => setEditing(new Combination())}>
        + Nueva Combinación
      </button>

      <table>
        <thead>
          <tr>
            <th>Simulador</th>
            <th>Categoría</th>
            <th>Circuito</th>
            <th>Fecha Desde</th>
            <th>Fecha Hasta</th>
            <th>Vueltas</th>
            <th>Paradas Obligatorias</th>
            <th>Intervalo (min)</th>
            <th>Tipo Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map((comb) => (
            <tr key={comb.id}>
              <td>{getSimulatorName(comb)}</td>
              <td>{getCategoryName(comb)}</td>
              <td>{getCircuitName(comb)}</td>
              <td>{comb.dateFrom}</td>
              <td>{comb.dateTo}</td>
              <td>{comb.lapsNumber}</td>
              <td>{comb.obligatoryStopsQuantity}</td>
              <td>{comb.raceIntervalMinutes}</td>
              <td>{comb.userType}</td>
              <td>
                <button onClick={() => setEditing(comb)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && simulators && (
        <CombinationForm
          initial={editing}
          simulators={simulators}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </section>
  );
}
