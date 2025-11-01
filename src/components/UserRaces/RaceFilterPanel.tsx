import React from 'react';



interface RaceFilterPanelProps {
    minFinishPosition: number | '';
    setMinFinishPosition: (pos: number | '') => void;
    raceDateFrom: string;
    setRaceDateFrom: (date: string) => void;
}

const RaceFilterPanel: React.FC<RaceFilterPanelProps> = ({
    minFinishPosition, setMinFinishPosition, raceDateFrom, setRaceDateFrom
}) => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
        
        {/* Filtro de Posición Máxima (SELECT) - SIN CRUZ */}
        <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">
                Posición Máx.
            </label>
            <div className="relative">
                <select
                    value={minFinishPosition}
                    onChange={(e) => setMinFinishPosition(e.target.value === '' ? '' : Number(e.target.value))}
                    // Dejamos el pr-8 del contenedor en blanco para que la cruz no moleste
                    className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 appearance-none"
                >
                    <option value="">Todas</option>
                    <option value={1}>Ganadores (Puesto 1)</option>
                    <option value={3}>Podio (Puesto ≤ 3)</option>
                    <option value={10}>Top 10 (Puesto ≤ 10)</option>
                </select>
                {/* ❌ BLOQUE DE LA CRUZ ELIMINADO */}
            </div>
        </div>
        
        {/* Filtro de Fecha de Carrera (INPUT DATE) - CON CRUZ */}
        <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">
                Carreras desde (Fecha)
            </label>
            <div className="relative">
                <input
                    type="date"
                    value={raceDateFrom}
                    onChange={(e) => setRaceDateFrom(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 pr-8"
                />
                {/* CRUZ DE RESETEO (Fecha) */}
                {raceDateFrom && (
                    <button
                        type="button"
                        onClick={() => setRaceDateFrom('')}
                        className="absolute right-0 top-0 h-full w-8 flex items-center justify-center text-gray-400 hover:text-white"
                        aria-label="Limpiar filtro de fecha"
                    >
                        &times;
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default RaceFilterPanel;