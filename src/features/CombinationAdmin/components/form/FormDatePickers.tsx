import type { ChangeEvent } from 'react';
import { Combination } from '../../../../types/entities';
import {
  Input,
  Label,
} from '../../../../components/tremor/TremorComponents';

interface Props {
  form: Pick<Combination, 'dateFrom' | 'dateTo'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function FormDatePickers({ form, onInputChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="dateFrom">Fecha y Hora de Inicio</Label>
        <Input
          id="dateFrom"
          type="datetime-local"
          name="dateFrom"
          value={form.dateFrom}
          onChange={onInputChange}
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
          onChange={onInputChange}
          required
        />
      </div>
    </div>
  );
}
