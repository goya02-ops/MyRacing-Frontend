import {
  lazy,
  useCallback,
  useState,
  Suspense,
  useMemo,
  useEffect,
} from 'react';
import { Combination, Simulator, Category, Circuit } from '../types/entities';

import { saveEntity, fetchEntities } from '../services/apiService.ts';
import useCombinationAdmin from '../hooks/useCombinationAdmin';
import { isDuplicateCombination } from '../utils/combination/duplicate';
import { normalizeCombination } from '../utils/combination/normalize';
import {
  getCategoryName,
  getCircuitName,
  getSimulatorName,
} from '../utils/combination/getters';
import { useScrollToElement } from '../hooks/useScrollToElement.ts';

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
  Label,
  Select,
  SelectItem,
  Input,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '../components/tremor/TremorComponents';

const CombinationForm = lazy(() => import('../components/CombinationForm'));

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

interface FilterPanelProps {
  simulators: Simulator[];
  categories: Category[];
  circuits: Circuit[];
  filterSimulatorId: EntityFilter;
  setFilterSimulatorId: (v: EntityFilter) => void;
  filterCategoryId: EntityFilter;
  setFilterCategoryId: (v: EntityFilter) => void;
  filterCircuitId: EntityFilter;
  setFilterCircuitId: (v: EntityFilter) => void;
  filterUserType: UserTypeFilter;
  setFilterUserType: (v: UserTypeFilter) => void;
  filterDateFrom: string;
  setFilterDateFrom: (v: string) => void;
  filterDateTo: string;
  setFilterDateTo: (v: string) => void;
}

function CombinationFilterPanel({
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
}: FilterPanelProps) {
  return (
    <div className="mb-6 space-y-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Simulador</Label>
          <Select
            value={String(filterSimulatorId)}
            onValueChange={(v) =>
              setFilterSimulatorId(v === 'ALL' ? 'ALL' : Number(v))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {simulators.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Categoría</Label>
          <Select
            value={String(filterCategoryId)}
            onValueChange={(v) =>
              setFilterCategoryId(v === 'ALL' ? 'ALL' : Number(v))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.denomination}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Filtro Circuito */}
        <div>
          <Label>Circuito</Label>
          <Select
            value={String(filterCircuitId)}
            onValueChange={(v) =>
              setFilterCircuitId(v === 'ALL' ? 'ALL' : Number(v))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {circuits.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.denomination}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Filtro Tipo Usuario */}
        <div>
          <Label>Tipo Usuario</Label>
          <Select
            value={filterUserType}
            onValueChange={(v) => setFilterUserType(v as UserTypeFilter)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="COMÚN">Común</SelectItem>
              <SelectItem value="PREMIUM">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Filtros de Fecha */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Vigente Desde</Label>
          <Input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
        </div>
        <div>
          <Label>Vigente Hasta</Label>
          <Input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
// --- FIN: Componente de Filtro ---

export default function CombinationAdmin() {
  // Hook (de 'develop', pero 'list' y 'setList' se usan en 'HEAD')
  const {
    list,
    setList,
    editing,
    setEditing,
    simulators,
    loading: loadingHook,
  } = useCombinationAdmin();

  // States (de 'develop')
  const [isCreating, setIsCreating] = useState(false);

  // States (de 'HEAD')
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterSimulatorId, setFilterSimulatorId] =
    useState<EntityFilter>('ALL');
  const [filterCategoryId, setFilterCategoryId] = useState<EntityFilter>('ALL');
  const [filterCircuitId, setFilterCircuitId] = useState<EntityFilter>('ALL');
  const [filterUserType, setFilterUserType] = useState<UserTypeFilter>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // --- INICIO: Lógica Faltante (para 'HEAD') ---
  // El 'useCombinationAdmin' no provee 'categories' ni 'circuits'.
  // Los cargamos aquí para que los filtros funcionen.
  const [categories, setCategories] = useState<Category[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);

  useEffect(() => {
    // Cargamos las dependencias para los filtros
    Promise.all([fetchEntities(Category), fetchEntities(Circuit)])
      .then(([cats, circs]) => {
        setCategories(cats || []);
        setCircuits(circs || []);
        setLoadingDependencies(false);
      })
      .catch(console.error);
  }, []);

  const uniqueCategoriesForSelect = useMemo(
    () => categories || [],
    [categories]
  );
  const uniqueCircuitsForSelect = useMemo(() => circuits || [], [circuits]);
  // --- FIN: Lógica Faltante ---

  // Ref (de 'develop')
  const formContainerRef = useScrollToElement<HTMLDivElement>(editing);

  // Handlers (de 'HEAD' y 'develop' fusionados)
  const handleSave = useCallback(
    async (combination: Combination) => {
      const normalized = normalizeCombination(combination);
      if (isDuplicateCombination(list, normalized)) {
        alert('Esta combinación ya existe con las mismas fechas.');
        return;
      }
      try {
        const saved = await saveEntity(Combination, normalized);
        // 'setList' de 'HEAD' es compatible
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
    [list, setList, setEditing] // 'setEditing' viene del hook
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

  // 'filteredList' (de 'HEAD')
  const filteredList = useMemo(() => {
    return list.filter((comb: Combination) => {
      const simId = getSimulatorIdFromCombination(comb);
      const catId = getCategoryIdFromCombination(comb);
      const circId = getCircuitIdFromCombination(comb);
      const userType = comb.userType?.toUpperCase() as UserTypeFilter;

      // Lógica de fechas (de 'HEAD')
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

      // Lógica de 'match' (de 'HEAD')
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
      // Corregido: las fechas se comparan como rangos
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

  // Estado de carga (fusionado)
  if (loadingHook || loadingDependencies || simulators === null) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-400">Cargando dependencias...</p>
      </div>
    );
  }

  // --- INICIO: RENDERIZADO (Fusionado) ---
  return (
    <div className="space-y-6">
      <Card className="text-gray-200">
        {/* Header (fusionado) */}
        <div
          className="
          flex flex-col sm:flex-row    
          justify-between 
          items-start sm:items-center  
          mb-6                         
          gap-4 sm:gap-0               
        "
        >
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Administrar Combinaciones</h2>
            <Badge variant="neutral">
              Total: {filteredList.length} / {list.length}
            </Badge>
          </div>
          {/* Botones de Header (fusionados) */}
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
            <Button onClick={handleNewCombination} className="w-full sm:w-auto">
              + Nueva Combinación
            </Button>
          </div>
        </div>

        {/* Panel de Filtros (de 'HEAD') */}
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

        {/* Formularios (de 'develop') */}
        <div ref={formContainerRef}>
          {isCreating && editing && simulators && (
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
                    simulators={simulators}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                </Suspense>
              </div>
              <Divider className="my-6" />
            </div>
          )}

          {!isCreating && editing && simulators && (
            <div className="mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-orange-400">
                  Editar Combinación
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
                    simulators={simulators}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                </Suspense>
              </div>
              <Divider className="my-6" />
            </div>
          )}
        </div>

        {/* Estructura de Tabla (de 'develop') */}
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

              {/* ... pero usando 'filteredList' de 'HEAD' */}
              <TableBody>
                {filteredList.map((comb) => (
                  <TableRow key={comb.id}>
                    <TableCell className="font-medium">
                      {getSimulatorName(comb)}
                    </TableCell>
                    <TableCell>{getCategoryName(comb)}</TableCell>
                    <TableCell>{getCircuitName(comb)}</TableCell>
                    <TableCell>
                      {comb.dateFrom
                        ? new Date(comb.dateFrom).toLocaleDateString('es-AR')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {comb.dateTo
                        ? new Date(comb.dateTo).toLocaleDateString('es-AR')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge
                          variant="neutral"
                          title="Vueltas"
                        >{`V: ${comb.lapsNumber}`}</Badge>
                        <Badge
                          variant="neutral"
                          title="Paradas"
                        >{`P: ${comb.obligatoryStopsQuantity}`}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          comb.userType === 'Premium' ? 'warning' : 'default'
                        }
                      >
                        {comb.userType?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={
                          editing?.id === comb.id && !isCreating
                            ? 'primary'
                            : 'ghost'
                        }
                        onClick={() =>
                          editing?.id === comb.id && !isCreating
                            ? handleCancel()
                            : handleEditCombination(comb)
                        }
                      >
                        {editing?.id === comb.id && !isCreating
                          ? 'Cancelar'
                          : 'Editar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
