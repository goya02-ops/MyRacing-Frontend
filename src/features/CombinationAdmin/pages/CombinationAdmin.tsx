import { lazy, useCallback, useState, Suspense, useMemo } from 'react';
import { Combination } from '../../../types/entities.ts';

// Hooks
import { useCombinationAdmin } from '../hooks/useCombinationAdmin.ts';
import { useCombinationDependencies } from '../hooks/useCombinationDependencies.ts';
import { useScrollToElement } from '../../../hooks/useScrollToElement.ts';
import { CombinationAdminProvider } from '../../../context/CombinationAdminContext.tsx';

// Utils
import { isDuplicateCombination } from '../../../utils/combination/duplicate.ts';
import { normalizeCombination } from '../../../utils/combination/normalize.ts';

import {
  Card,
  Button,
  Badge,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '../../../components/tremor/TremorComponents';
import CombinationFilterPanel from '../components/CombinationFilterPanel.tsx';
import Spinner from '../../../components/Spinner.tsx';

// Componentes Lazy
const CombinationList = lazy(() => import('../components/CombinationList.tsx'));
const CombinationForm = lazy(() => import('../components/CombinationForm.tsx'));

type UserTypeFilter = 'ALL' | 'PREMIUM' | 'COMÚN';
type EntityFilter = number | 'ALL';

const getSimulatorIdFromCombination = (
  comb: Combination
): number | undefined => {
  if (comb.categoryVersion?.simulator) {
    return typeof comb.categoryVersion.simulator === 'object'
      ? comb.categoryVersion.simulator.id
      : (comb.categoryVersion.simulator as number);
  }
  if (comb.circuitVersion?.simulator) {
    return typeof comb.circuitVersion.simulator === 'object'
      ? comb.circuitVersion.simulator.id
      : (comb.circuitVersion.simulator as number);
  }
  return undefined;
};
const getCategoryIdFromCombination = (
  comb: Combination
): number | undefined => {
  if (comb.categoryVersion?.category) {
    return typeof comb.categoryVersion.category === 'object'
      ? comb.categoryVersion.category.id
      : (comb.categoryVersion.category as number);
  }
  return undefined;
};
const getCircuitIdFromCombination = (comb: Combination): number | undefined => {
  if (comb.circuitVersion?.circuit) {
    return typeof comb.circuitVersion.circuit === 'object'
      ? comb.circuitVersion.circuit.id
      : (comb.circuitVersion.circuit as number);
  }
  return undefined;
};

export default function CombinationAdmin() {
  const crud = useCombinationAdmin();
  const { simulators, categories, circuits, loadingDependencies } =
    useCombinationDependencies();

  const {
    list,
    editing,
    loading: loadingCombinations,
    handleSave: genericHandleSave,
    handleCancel: genericHandleCancel,
    handleNew: genericHandleNew,
    handleEdit: genericHandleEdit,
  } = crud;

  const [isCreating, setIsCreating] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterSimulatorId, setFilterSimulatorId] =
    useState<EntityFilter>('ALL');
  const [filterCategoryId, setFilterCategoryId] = useState<EntityFilter>('ALL');
  const [filterCircuitId, setFilterCircuitId] = useState<EntityFilter>('ALL');
  const [filterUserType, setFilterUserType] = useState<UserTypeFilter>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const formContainerRef = useScrollToElement<HTMLDivElement>(editing);

  const handleSave = useCallback(
    async (combination: Combination) => {
      const normalized = normalizeCombination(combination);
      if (isDuplicateCombination(list, normalized)) {
        alert('Esta combinación ya existe con las mismas fechas.');
        return;
      }
      await genericHandleSave(normalized);
      setIsCreating(false);
    },
    [list, genericHandleSave]
  );

  const handleNewCombination = () => {
    genericHandleNew();
    setIsCreating(true);
  };
  const handleEditCombination = (combination: Combination) => {
    genericHandleEdit(combination);
    setIsCreating(false);
  };
  const handleCancel = () => {
    genericHandleCancel();
    setIsCreating(false);
  };

  const filteredList = useMemo(() => {
    return list.filter((comb: Combination) => {
      const simId = getSimulatorIdFromCombination(comb);
      const catId = getCategoryIdFromCombination(comb);
      const circId = getCircuitIdFromCombination(comb);
      const userType = comb.userType?.toUpperCase() as UserTypeFilter;
      const combDateFrom = comb.dateFrom
        ? new Date(comb.dateFrom).getTime()
        : 0;
      const combDateTo = comb.dateTo
        ? new Date(comb.dateTo).getTime()
        : Infinity;
      const filterStartDate = filterDateFrom
        ? new Date(filterDateFrom).getTime()
        : 0;
      const filterEndDate = filterDateTo
        ? new Date(filterDateTo).getTime()
        : Infinity;
      const matchSimulator =
        filterSimulatorId === 'ALL' ||
        (simId !== undefined && simId === filterSimulatorId);
      const matchCategory =
        filterCategoryId === 'ALL' ||
        (catId !== undefined && catId === filterCategoryId);
      const matchCircuit =
        filterCircuitId === 'ALL' ||
        (circId !== undefined && circId === filterCircuitId);
      const matchUserType =
        filterUserType === 'ALL' || userType === filterUserType;
      const matchDates =
        combDateFrom <= filterEndDate && combDateTo >= filterStartDate;
      return (
        matchSimulator &&
        matchCategory &&
        matchCircuit &&
        matchUserType &&
        matchDates
      );
    });
  }, [
    list,
    filterSimulatorId,
    filterCategoryId,
    filterCircuitId,
    filterUserType,
    filterDateFrom,
    filterDateTo,
  ]);

  if (loadingCombinations || loadingDependencies) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner>Cargando dependencias...</Spinner>
      </div>
    );
  }

  return (
    <CombinationAdminProvider
      value={{ simulators, categories, circuits, loadingDependencies }}
    >
      <div className="space-y-6">
        <Card className="text-gray-200">
          {/* Header (Botones y Título) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                Administrar Combinaciones
              </h2>
              <Badge variant="neutral">
                Total: {filteredList.length} / {list.length}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFiltersVisible((prev) => !prev)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border border-orange-500/60
                ${
                  filtersVisible
                    ? 'bg-transparent text-orange-300 hover:text-orange-400 hover:border-orange-400'
                    : 'bg-transparent text-gray-300 hover:text-white hover:border-gray-500'
                }
              `}
              >
                {filtersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
              <Button
                onClick={handleNewCombination}
                className="w-full sm:w-auto"
              >
                + Nueva Combinación
              </Button>
            </div>
          </div>

          {filtersVisible && (
            <CombinationFilterPanel
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

          <div ref={formContainerRef}>
            {isCreating && editing && (
              <div className="mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-orange-400">
                    Crear Nueva Combinación
                  </h3>
                  <Suspense
                    fallback={
                      <div className="text-center p-4">
                        Cargando formulario...
                      </div>
                    }
                  >
                    <CombinationForm
                      initial={editing as Combination}
                      onSave={handleSave}
                      onCancel={handleCancel}
                    />
                  </Suspense>
                </div>
                <Divider className="my-6" />
              </div>
            )}
          </div>

          {list.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No hay combinaciones registradas
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Simulador</TableHeaderCell>
                    <TableHeaderCell>Categoría</TableHeaderCell>
                    <TableHeaderCell>Circuito</TableHeaderCell>
                    <TableHeaderCell>Desde</TableHeaderCell>
                    <TableHeaderCell>Hasta</TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Config.
                    </TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Usuario
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Acciones
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  <Suspense
                    fallback={
                      <TableRow>
                        <TableCell colSpan={8} className="text-center p-4">
                          <Spinner>Cargando combinaciones...</Spinner>
                        </TableCell>
                      </TableRow>
                    }
                  >
                    <CombinationList
                      list={list}
                      filteredList={filteredList}
                      editing={editing}
                      isCreating={isCreating}
                      handleEditCombination={handleEditCombination}
                      handleCancel={handleCancel}
                      handleSave={handleSave}
                    />
                  </Suspense>
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </CombinationAdminProvider>
  );
}
