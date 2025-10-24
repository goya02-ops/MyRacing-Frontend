import { lazy, useCallback, useState, Suspense, useMemo } from 'react';
import { Combination } from '../types/entities'; 
import { saveEntity } from '../services/apiMyRacing';
import useCombinationAdmin from '../hooks/useCombinationAdmin';
import { isDuplicateCombination } from '../utils/combination/duplicate';
import { normalizeCombination } from '../utils/combination/normalize';
import {
  Card,
  Button,
  Badge,
  Divider,
} from '../components/tremor/TremorComponents'; 
import CombinationFilterPanel from '../components/Combination/CombinationFilterPanel';
import CombinationList from '../components/Combination/CombinationList';

const CombinationForm = lazy(() => import('../components/CombinationForm'));

type UserTypeFilter = 'ALL' | 'PREMIUM' | 'COMÚN';
type EntityFilter = number | 'ALL';

const getSimulatorIdFromCombination = (comb: Combination): number | undefined => {
  if (comb.categoryVersion?.simulator) {
    return typeof comb.categoryVersion.simulator === 'object' 
      ? comb.categoryVersion.simulator.id 
      : comb.categoryVersion.simulator as number;
  }
  if (comb.circuitVersion?.simulator) {
    return typeof comb.circuitVersion.simulator === 'object'
      ? comb.circuitVersion.simulator.id
      : comb.circuitVersion.simulator as number;
  }
  return undefined;
};

const getCategoryIdFromCombination = (comb: Combination): number | undefined => {
  if (comb.categoryVersion?.category) {
    return typeof comb.categoryVersion.category === 'object'
      ? comb.categoryVersion.category.id
      : comb.categoryVersion.category as number;
  }
  return undefined;
};

const getCircuitIdFromCombination = (comb: Combination): number | undefined => {
  if (comb.circuitVersion?.circuit) {
    return typeof comb.circuitVersion.circuit === 'object'
      ? comb.circuitVersion.circuit.id
      : comb.circuitVersion.circuit as number;
  }
  return undefined;
};

export default function CombinationAdmin() {
  const { list, setList, editing, setEditing, simulators, categories, circuits, loading } = useCombinationAdmin();
  const [isCreating, setIsCreating] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [filterSimulatorId, setFilterSimulatorId] = useState<EntityFilter>('ALL');
  const [filterCategoryId, setFilterCategoryId] = useState<EntityFilter>('ALL');
  const [filterCircuitId, setFilterCircuitId] = useState<EntityFilter>('ALL');
  const [filterUserType, setFilterUserType] = useState<UserTypeFilter>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const uniqueCategoriesForSelect = useMemo(() => categories || [], [categories]);
  const uniqueCircuitsForSelect = useMemo(() => circuits || [], [circuits]);

  const handleSave = useCallback(
    async (combination: Combination) => {
      const normalized = normalizeCombination(combination);
      if (isDuplicateCombination(list, normalized)) {
        alert('Esta combinación ya existe con las mismas fechas.');
        return;
      }
      try {
        const saved = await saveEntity(Combination, normalized);
        setList((prev: Combination[]) => 
          prev.some((c: Combination) => c.id === saved.id)
            ? prev.map((c: Combination) => (c.id === saved.id ? saved : c))
            : [...prev, saved]
        );
        setEditing(null);
        setIsCreating(false);
      } catch (error) {
        console.error('Error guardando:', error);
        alert('Error al guardar la combinación');
      }
    },
    [list, setList, setEditing]
  );

  const handleNewCombination = () => {
    setEditing(new Combination());
    setIsCreating(true);
  };

  const handleEditCombination = (combination: Combination) => {
    setEditing(combination);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setIsCreating(false);
  };

  const filteredList = useMemo(() => {
    return list.filter((comb: Combination) => {
      const simId = getSimulatorIdFromCombination(comb);
      const catId = getCategoryIdFromCombination(comb);
      const circId = getCircuitIdFromCombination(comb);
      const userType = comb.userType?.toUpperCase();

      const combDateFrom = comb.dateFrom ? new Date(comb.dateFrom).getTime() : 0;
      const combDateTo = comb.dateTo ? new Date(comb.dateTo).getTime() : Infinity;
      const filterStartDate = filterDateFrom ? new Date(filterDateFrom).getTime() : 0;
      const filterEndDate = filterDateTo ? new Date(filterDateTo).getTime() : Infinity;

      const matchSimulator = filterSimulatorId === 'ALL' || (simId !== undefined && simId === filterSimulatorId);
      const matchCategory = filterCategoryId === 'ALL' || (catId !== undefined && catId === filterCategoryId);
      const matchCircuit = filterCircuitId === 'ALL' || (circId !== undefined && circId === filterCircuitId);
      const matchUserType = filterUserType === 'ALL' || userType === filterUserType;
      const matchDates = (combDateFrom <= filterEndDate) && (combDateTo >= filterStartDate);

      return matchSimulator && matchCategory && matchCircuit && matchUserType && matchDates;
    });
  }, [list, filterSimulatorId, filterCategoryId, filterCircuitId, filterUserType, filterDateFrom, filterDateTo]);

  if (loading || simulators === null || categories === null || circuits === null) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-400">Cargando dependencias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="text-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Administrar Combinaciones</h2>
            <Badge variant="neutral">Total: {filteredList.length} / {list.length}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersVisible(prev => !prev)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border border-orange-500/60
                ${filtersVisible 
                  ? 'bg-transparent text-orange-300 hover:text-orange-400 hover:border-orange-400'  
                  : 'bg-transparent text-gray-300 hover:text-white hover:border-gray-500'}
              `}
            >
              {filtersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            <Button onClick={handleNewCombination}>
              + Nueva Combinación
            </Button>
          </div>
        </div>

        {filtersVisible && (
          <CombinationFilterPanel
            simulators={simulators}
            categories={uniqueCategoriesForSelect}
            circuits={uniqueCircuitsForSelect}
            filterSimulatorId={filterSimulatorId}
            setFilterSimulatorId={setFilterSimulatorId}
            filterCategoryId={filterCategoryId}
            setFilterCategoryId={setFilterCategoryId}
            filterCircuitId={filterCircuitId}
            setFilterCircuitId={setFilterCircuitId}
            filterUserType={filterUserType}
            setFilterUserType={setFilterUserType}
            filterDateFrom={filterDateFrom}
            setFilterDateFrom={setFilterDateFrom}
            filterDateTo={filterDateTo}
            setFilterDateTo={setFilterDateTo}
          />
        )}

        {isCreating && editing && simulators && (
          <div className="mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Crear Nueva Combinación</h3>
              <Suspense fallback={<div className="text-center p-4">Cargando formulario...</div>}>
                <CombinationForm
                  initial={editing as Combination}
                  simulators={simulators}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </Suspense>
            </div>
            <Divider className="my-6" />
          </div>
        )}

        <CombinationList
          list={list}
          filteredList={filteredList}
          editing={editing}
          isCreating={isCreating}
          simulators={simulators}
          handleEditCombination={handleEditCombination}
          handleCancel={handleCancel}
          handleSave={handleSave}
        />
      </Card>
    </div>
  );
}
