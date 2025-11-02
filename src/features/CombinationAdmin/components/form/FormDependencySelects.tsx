import {
  Simulator,
  CategoryVersion,
  CircuitVersion,
} from '../../../../types/entities';
import {
  Label,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '../../../../components/tremor/TremorComponents';

interface Props {
  simulators: Simulator[];
  selectedSimulator: number | undefined;
  loadingSimulators: boolean;
  loadingVersions: boolean;
  categoryVersions: CategoryVersion[];
  circuitVersions: CircuitVersion[];
  formValues: {
    categoryVersion: string;
    circuitVersion: string;
  };
  onSimulatorChange: (value: string) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function FormDependencySelects({
  simulators,
  selectedSimulator,
  loadingSimulators,
  loadingVersions,
  categoryVersions,
  circuitVersions,
  formValues,
  onSimulatorChange,
  onSelectChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="simulator">1. Simulador</Label>
        <Select
          name="simulator"
          value={selectedSimulator?.toString() || ''}
          onValueChange={onSimulatorChange}
          disabled={loadingSimulators}
          required
        >
          <SelectTrigger id="simulator">
            <SelectValue placeholder="Seleccione un simulador" />
          </SelectTrigger>
          <SelectContent>
            {simulators.map((sim: Simulator) => (
              <SelectItem key={sim.id} value={sim.id!.toString()}>
                {sim.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="categoryVersion">2. Categoría</Label>
        <Select
          name="categoryVersion"
          value={formValues.categoryVersion}
          onValueChange={(v) => onSelectChange('categoryVersion', v)}
          disabled={!selectedSimulator || loadingVersions}
          required
        >
          <SelectTrigger id="categoryVersion">
            <SelectValue
              placeholder={
                !selectedSimulator
                  ? 'Primero seleccione un simulador'
                  : loadingVersions
                  ? 'Cargando versiones...'
                  : 'Seleccione una categoría'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {categoryVersions.map((cv) => {
              const info =
                typeof cv.category === 'object'
                  ? `${cv.category.denomination} (${cv.category.abbreviation})`
                  : `Cat ID: ${cv.category}`;
              return (
                <SelectItem key={cv.id} value={cv.id!.toString()}>
                  {info} - {cv.status}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="circuitVersion">3. Circuito</Label>
        <Select
          name="circuitVersion"
          value={formValues.circuitVersion}
          onValueChange={(v) => onSelectChange('circuitVersion', v)}
          disabled={!selectedSimulator || loadingVersions}
          required
        >
          <SelectTrigger id="circuitVersion">
            <SelectValue
              placeholder={
                !selectedSimulator
                  ? 'Primero seleccione un simulador'
                  : loadingVersions
                  ? 'Cargando versiones...'
                  : 'Seleccione un circuito'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {circuitVersions.map((cv) => {
              const info =
                typeof cv.circuit === 'object'
                  ? cv.circuit.denomination
                  : `Circ ID: ${cv.circuit}`;
              return (
                <SelectItem key={cv.id} value={cv.id!.toString()}>
                  {info}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
