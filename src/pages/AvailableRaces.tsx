import { useState, useEffect, lazy, Suspense } from 'react';
import { Combination, Simulator } from '../types/entities';
import { fetchCurrentRaces } from '../services/apiMyRacing.ts';
import { Card } from '../components/Card.tsx'; 

const ListRaces = lazy(() => import('../components/ListRaces.tsx'));


export default function AvailableRaces() {
  const [allCombinations, setAllCombinations] = useState<Combination[]>([]);
  const [simulatorsWithRaces, setSimulatorsWithRaces] = useState<Simulator[]>([]);
  const [selectedSimulator, setSelectedSimulator] = useState<Simulator | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<Combination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentRaces()
      .then((combs) => {
        setAllCombinations(combs);
        // Derivar simuladores unicos con combinaciones vigentes
        const simsMap = new Map<number, Simulator>();
        combs.forEach((c) => {
            if (c.categoryVersion?.simulator) {
              simsMap.set(c.categoryVersion.simulator.id!, c.categoryVersion.simulator);
            }
            if (c.circuitVersion?.simulator) {
              simsMap.set(c.circuitVersion.simulator.id!, c.circuitVersion.simulator);
            }
        });
        setSimulatorsWithRaces(Array.from(simsMap.values()));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filtrar combinaciones según simulador seleccionado
  const combinations = selectedSimulator
    ? allCombinations.filter(
        (c) =>
          c.categoryVersion?.simulator?.id === selectedSimulator.id ||
          c.circuitVersion?.simulator?.id === selectedSimulator.id
      )
    : allCombinations;

  // Handler para seleccionar una tarjeta (muestra el ListRaces)
  const handleSelectCombination = (combination: Combination) => {
    setSelectedCombination(combination);
  };
  
  // Helper para obtener nombres de forma segura
  const getTrackName = (c: Combination) => c.circuitVersion?.circuit?.denomination || 'Pista N/A';
  const getClassName = (c: Combination) => c.categoryVersion?.category?.denomination || 'Clase N/A';
  const getSimulatorName = (c: Combination) => c.categoryVersion?.simulator?.name || 'Simulador N/A';

  return (
    <section className="p-8 bg-gray-50 min-h-screen"> 
      
      {/* TÍTULO */}
      <h2 className="text-center text-3xl font-bold mb-8">
        CARRERAS DISPONIBLES
      </h2>

      {/* 1. FILTROS DE SIMULADOR */}
      <div className="flex justify-center mb-8 gap-3 flex-wrap">
        {loading ? (
          <p className="text-gray-500">Cargando simuladores...</p>
        ) : simulatorsWithRaces.length === 0 ? (
          <p className="text-gray-500">No hay combinaciones vigentes.</p>
        ) : (
          <>
            <button
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!selectedSimulator ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setSelectedSimulator(null)}
            >
                Mostrar Todos
            </button>
            {simulatorsWithRaces.map((sim) => (
              <button
                key={sim.id}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${selectedSimulator?.id === sim.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setSelectedSimulator(sim)}
              >
                {sim.name}
              </button>
            ))}
          </>
        )}
      </div>
      

      {/* 2. GALERÍA DE TARJETAS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-auto max-w-7xl">
        
        {combinations.length === 0 && !loading ? (
            <p className="col-span-full text-center text-gray-500">
                No hay combinaciones disponibles para el filtro actual.
            </p>
        ) : (
          combinations.map((combination) => (
            <Card 
              key={combination.id}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleSelectCombination(combination)}
            >
              <div className="flex justify-between items-start mb-3">
                <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${combination.userType === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                >
                    {combination.userType.toUpperCase()}
                </span>
                <p className="text-xs text-gray-500">
                    {new Date(combination.dateFrom).toLocaleDateString()} - {new Date(combination.dateTo).toLocaleDateString()}
                </p>
              </div>

              <p className="text-xl font-semibold text-gray-900 mt-1 mb-1">
                {getClassName(combination)}
              </p>
              <p className="text-sm text-gray-500">
                @ {getTrackName(combination)} ({getSimulatorName(combination)})
              </p>

              <div className="flex justify-between mt-4 border-t pt-3 border-gray-100">
                <div className="flex flex-col items-center w-1/3">
                    <p className="text-lg">🏁</p>
                    <p className="font-medium text-xs">{combination.lapsNumber} VUELTAS</p>
                </div>
                <div className="flex flex-col items-center w-1/3">
                    <p className="text-lg">🛑</p>
                    <p className="font-medium text-xs">
                        {combination.obligatoryStopsQuantity} PARADA(S)
                    </p>
                </div>
                <div className="flex flex-col items-center w-1/3">
                    <p className="text-lg">🕒</p>
                    <p className="font-medium text-xs">
                        {combination.raceIntervalMinutes} MIN INT.
                    </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      
      {/* 3. DETALLE DE CARRERAS (ListRaces) */}
      {selectedCombination && (
        <div className="mt-12 pt-6 border-t border-gray-300">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Carreras Programadas para: {getClassName(selectedCombination)}
          </h3>
          <Suspense fallback={<div>Cargando lista de carreras...</div>}>
            <ListRaces combination={selectedCombination} />
          </Suspense>
        </div>
      )}

    </section>
  );
}
