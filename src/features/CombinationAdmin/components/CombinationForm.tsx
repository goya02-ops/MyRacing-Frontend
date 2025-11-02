import { Combination, Simulator } from '../../../types/entities';
import { useCombinationForm } from '../hooks/useCombinationForm';
import createHandlers from '../handlers/combinationFormHandlers';
import {
  Label,
  Select,
  SelectItem,
  Input,
  Button,
  Divider,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '../../../components/tremor/TremorComponents';

interface CombinationFormProps {
  initial: Combination;
  simulators: Simulator[];
  onSave: (combination: Combination) => void;
  onCancel: () => void;
}

export default function CombinationForm({
  initial,
  simulators,
  onSave,
  onCancel,
}: CombinationFormProps) {
  const {
    form,
    setForm,
    selectedSimulator,
    setSelectedSimulator,
    categoryVersions,
    circuitVersions,
    loading,
  } = useCombinationForm(initial);

  const { handleInputChange, handleSelectChange, handleSimulatorChange } =
    createHandlers(setSelectedSimulator, setForm);

  const getIdValue = (field: 'categoryVersion' | 'circuitVersion') => {
    const val = form[field];
    return typeof val === 'object' && val ? val.id || '' : val || '';
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="simulator">1. Simulador</Label>

          <Select
            name="simulator"
            value={selectedSimulator?.toString() || ''}
            onValueChange={(value) => {
              const event = {
                target: { name: 'simulator', value },
              } as React.ChangeEvent<HTMLSelectElement>;
              handleSimulatorChange(event);
            }}
            required
          >
            <SelectTrigger id="simulator">
              <SelectValue placeholder="Seleccione un simulador" />
            </SelectTrigger>
            <SelectContent>
              {simulators.map((sim) => (
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
            value={getIdValue('categoryVersion').toString()}
            onValueChange={(value) => {
              const event = {
                target: { name: 'categoryVersion', value },
              } as React.ChangeEvent<HTMLSelectElement>;
              handleSelectChange(event);
            }}
            disabled={!selectedSimulator || loading}
            required
          >
            <SelectTrigger id="categoryVersion">
              <SelectValue
                placeholder={
                  !selectedSimulator
                    ? 'Primero seleccione un simulador'
                    : loading
                    ? 'Cargando...'
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
            value={getIdValue('circuitVersion').toString()}
            onValueChange={(value) => {
              const event = {
                target: { name: 'circuitVersion', value },
              } as React.ChangeEvent<HTMLSelectElement>;
              handleSelectChange(event);
            }}
            disabled={!selectedSimulator || loading}
            required
          >
            <SelectTrigger id="circuitVersion">
              <SelectValue
                placeholder={
                  !selectedSimulator
                    ? 'Primero seleccione un simulador'
                    : loading
                    ? 'Cargando...'
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

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dateFrom">Fecha y Hora de Inicio</Label>
          <Input
            id="dateFrom"
            type="datetime-local"
            name="dateFrom"
            value={form.dateFrom}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="dateTo">Fecha y Hora de Fin</Label>
          <Input
            id="dateTo"
            type="datetime-local"
            name="dateTo"
            value={form.dateTo}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="lapsNumber">Número de Vueltas</Label>
          <Input
            id="lapsNumber"
            type="number"
            name="lapsNumber"
            value={form.lapsNumber}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>

        <div>
          <Label htmlFor="obligatoryStopsQuantity">Paradas Obligatorias</Label>
          <Input
            id="obligatoryStopsQuantity"
            type="number"
            name="obligatoryStopsQuantity"
            value={form.obligatoryStopsQuantity}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>

        <div>
          <Label htmlFor="raceIntervalMinutes">Intervalo (minutos)</Label>
          <Input
            id="raceIntervalMinutes"
            type="number"
            name="raceIntervalMinutes"
            value={form.raceIntervalMinutes}
            onChange={handleInputChange}
            min="1"
            placeholder="Ej: 30"
            required
          />
        </div>
      </div>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="userType">Tipo de Usuario</Label>

          <Select
            name="userType"
            value={form.userType}
            onValueChange={(value) => {
              const event = {
                target: { name: 'userType', value },
              } as React.ChangeEvent<HTMLSelectElement>;
              handleSelectChange(event);
            }}
            required
          >
            <SelectTrigger id="userType">
              <SelectValue placeholder="Seleccione un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Común">Común</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar
        </Button>
      </div>
    </form>
  );
}
