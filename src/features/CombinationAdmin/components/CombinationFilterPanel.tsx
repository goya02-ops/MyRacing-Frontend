import React from 'react';
import { Simulator, Category, Circuit } from '../../../types/entities';
import { Label } from '../../../components/tremor/TremorComponents';

type UserTypeFilter = 'ALL' | 'PREMIUM' | 'COMÚN';
type EntityFilter = number | 'ALL';

interface CombinationFilterPanelProps {
  simulators: Simulator[];
  categories: Category[];
  circuits: Circuit[];
  filterSimulatorId: EntityFilter;
  setFilterSimulatorId: (value: EntityFilter) => void;
  filterCategoryId: EntityFilter;
  setFilterCategoryId: (value: EntityFilter) => void;
  filterCircuitId: EntityFilter;
  setFilterCircuitId: (value: EntityFilter) => void;
  filterUserType: UserTypeFilter;
  setFilterUserType: (value: UserTypeFilter) => void;
  filterDateFrom: string;
  setFilterDateFrom: (value: string) => void;
  filterDateTo: string;
  setFilterDateTo: (value: string) => void;
}

const CombinationFilterPanel: React.FC<CombinationFilterPanelProps> = ({
  simulators,
  categories,
  circuits,
  filterSimulatorId,
  setFilterSimulatorId,
  filterCategoryId,
  setFilterCategoryId,
  filterCircuitId,
  setFilterCircuitId,
  filterUserType,
  setFilterUserType,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
}) => {
  const inputClasses =
    'w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500 pr-8';

  const handleSelectChange = (setter: (value: any) => void, value: string) => {
    setter(value === 'ALL' ? 'ALL' : Number(value));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
      <div>
        <Label htmlFor="filterSim" className="text-white">
          Simulador
        </Label>
        <select
          id="filterSim"
          value={
            filterSimulatorId === 'ALL' ? 'ALL' : filterSimulatorId.toString()
          }
          onChange={(e) =>
            handleSelectChange(setFilterSimulatorId, e.target.value)
          }
          className={inputClasses}
        >
          <option value="ALL">Todos</option>
          {simulators.map((sim) => (
            <option key={sim.id} value={sim.id!.toString()}>
              {sim.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="filterCat" className="text-white">
          Categoría
        </Label>
        <select
          id="filterCat"
          value={
            filterCategoryId === 'ALL' ? 'ALL' : filterCategoryId.toString()
          }
          onChange={(e) =>
            handleSelectChange(setFilterCategoryId, e.target.value)
          }
          className={inputClasses}
        >
          <option value="ALL">Todas</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id!.toString()}>
              {cat.denomination}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="filterCirc" className="text-white">
          Circuito
        </Label>
        <select
          id="filterCirc"
          value={filterCircuitId === 'ALL' ? 'ALL' : filterCircuitId.toString()}
          onChange={(e) =>
            handleSelectChange(setFilterCircuitId, e.target.value)
          }
          className={inputClasses}
        >
          <option value="ALL">Todos</option>
          {circuits.map((circ) => (
            <option key={circ.id} value={circ.id!.toString()}>
              {circ.denomination}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="filterUser" className="text-white">
          Tipo de Usuario
        </Label>
        <select
          id="filterUser"
          value={filterUserType}
          onChange={(e) => setFilterUserType(e.target.value as UserTypeFilter)}
          className={inputClasses}
        >
          <option value="ALL">Todos</option>
          <option value="PREMIUM">Premium</option>
          <option value="COMÚN">Común</option>
        </select>
      </div>

      <div>
        <Label htmlFor="filterDateFrom" className="text-white">
          Desde (vigencia)
        </Label>
        <div className="relative">
          <input
            id="filterDateFrom"
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className={inputClasses}
          />
          {filterDateFrom && (
            <button
              type="button"
              onClick={() => setFilterDateFrom('')}
              className="absolute right-0 top-0 h-full w-8 flex items-center justify-center text-gray-400 hover:text-white"
              aria-label="Limpiar filtro de fecha desde"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="filterDateTo" className="text-white">
          Hasta (vigencia)
        </Label>
        <div className="relative">
          <input
            id="filterDateTo"
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className={inputClasses}
          />
          {filterDateTo && (
            <button
              type="button"
              onClick={() => setFilterDateTo('')}
              className="absolute right-0 top-0 h-full w-8 flex items-center justify-center text-gray-400 hover:text-white"
              aria-label="Limpiar filtro de fecha hasta"
            >
              &times;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombinationFilterPanel;
