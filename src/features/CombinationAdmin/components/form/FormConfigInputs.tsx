import type { ChangeEvent } from 'react';
import { Combination } from '../../../../types/entities';
import { Input, Label } from '../../../../components/tremor/TremorComponents';

interface Props {
  form: Pick<
    Combination,
    'lapsNumber' | 'obligatoryStopsQuantity' | 'raceIntervalMinutes'
  >;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function FormConfigInputs({ form, onInputChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="lapsNumber">Número de Vueltas</Label>
        <Input
          id="lapsNumber"
          type="number"
          name="lapsNumber"
          value={form.lapsNumber}
          onChange={onInputChange}
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
          onChange={onInputChange}
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
          onChange={onInputChange}
          min="1"
          placeholder="Ej: 30"
          required
        />
      </div>
    </div>
  );
}
