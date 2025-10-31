import { useEffect, useState } from 'react';
import { Race, Combination } from '../types/entities';
import { fetchEntities, saveEntity } from '../services/apiService';
import RaceForm from './RaceForm';

interface RaceWithId extends Race {
  id?: number;
  combination?: any;
}

export default function RaceAdmin() {
  const [list, setList] = useState<RaceWithId[]>([]);
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [editing, setEditing] = useState<RaceWithId | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.all([fetchEntities(Race as any), fetchEntities(Combination)])
      .then(([raceList, combList]) => {
        setList((raceList as RaceWithId[]) || []);
        setCombinations(combList || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error cargando datos de carreras/combinaciones:', error);
        setLoading(false);
      });
  }, []);

  const handleSave = async (race: RaceWithId) => {
    const normalized: RaceWithId = {
      ...race,
      combination:
        typeof race.combination === 'object'
          ? race.combination.id
          : race.combination,
    };

    try {
      const saved = await saveEntity(Race as any, normalized);

      setList((prev) => {
        const savedWithId = saved as RaceWithId;
        return prev.some((r) => r.id === savedWithId.id)
          ? prev.map((r) => (r.id === savedWithId.id ? savedWithId : r))
          : [...prev, savedWithId];
      });
      setEditing(null);
    } catch (error) {
      console.error('Error guardando carrera:', error);
      alert('Error al guardar la carrera');
    }
  };

  const getCombinationName = (combinationId?: number | any): string => {
    const id =
      typeof combinationId === 'object' ? combinationId?.id : combinationId;
    const comb = combinations.find((c) => c.id === id);
    return comb ? `ID ${comb.id} (${comb.id|| 'Reglas'}` : 'N/A';
  };

  if (loading) {
    return <div>Cargando Carreras...</div>;
  }

  return (
    <section>
      <h2>Administrar Carreras (Races)</h2>

      <button
        onClick={() =>
          setEditing({
            raceDateTime: '',
            registrationDeadline: '',
            combination: undefined,
          } as RaceWithId)
        }
      >
        + Nueva Carrera
      </button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha/Hora Carrera</th>
            <th>Fecha Límite Insc.</th>
            <th>Reglas (Combination)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map((race) => (
            <tr key={race.id}>
              <td>{race.id}</td>
              <td>{race.raceDateTime}</td>
              <td>{race.registrationDeadline}</td>
              <td>{getCombinationName(race.combination)}</td>
              <td>
                <button
                  onClick={() => {
                    const normalized: RaceWithId = {
                      ...race,
                      combination:
                        typeof race.combination === 'object'
                          ? race.combination.id
                          : race.combination,
                    };
                    setEditing(normalized);
                  }}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <RaceForm
          initial={editing}
          combinations={combinations}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </section>
  );
}
