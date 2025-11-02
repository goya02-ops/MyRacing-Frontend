import {
  Label,
  Select,
  SelectItem,
  Input,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '../../../components/tremor/TremorComponents';

import { useCombinationAdminContext } from '../../../context/CombinationAdminContext';

type UserTypeFilter = 'ALL' | 'PREMIUM' | 'COMÚN';
type EntityFilter = number | 'ALL';

interface FilterPanelProps {
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

export default function CombinationFilterPanel({
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
  const { simulators, categories, circuits } = useCombinationAdminContext();

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
