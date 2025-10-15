import { useState, useEffect } from 'react';
import { Combination } from '../types/entities';
import { fetchEntities } from '../services/service';

export default function AvailableRaces() {
  const [combinations, setCombinations] = useState<Combination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntities(Combination)
      .then(setCombinations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando combinaciones...</div>;

  return (
    <section>
      <h2>Carreras por Combinación</h2>
      
      {combinations.length === 0 ? (
        <p>No hay carreras disponibles.</p>
      ) : (
        combinations.map((combination) => (
          <div key={combination.id} style={{marginBottom: '20px', border: '1px solid #ccc', padding: '10px'}}>
            <h3>Combinación #{combination.id}</h3>
            <p>
              {combination.dateFrom} - {combination.dateTo} | 
              {combination.lapsNumber} vueltas | 
              {combination.obligatoryStopsQuantity} paradas
            </p>
            
            {/* Carreras - con validación para el error */}
            {combination.races && Array.isArray(combination.races) && combination.races.length > 0 ? (
              combination.races.map((race: any) => (
                <div key={race.id} style={{marginLeft: '20px', marginTop: '10px'}}>
                  <strong>{race.description || `Carrera #${race.id}`}</strong>
                  <br />
                  Fecha: {new Date(race.raceDateTime).toLocaleDateString()} | 
                  Límite: {new Date(race.registrationDeadline).toLocaleDateString()}
                  <button disabled style={{marginLeft: '10px', opacity: 0.5}}>
                    Inscribirse
                  </button>
                </div>
              ))
            ) : (
              <p style={{marginLeft: '20px', fontStyle: 'italic'}}>No hay carreras en esta combinación</p>
            )}
          </div>
        ))
      )}
    </section>
  );
}