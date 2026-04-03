import {
  Input,
  Label,
} from '../../../../components/tremor/TremorComponents';

interface Props {
  dateFrom: string;
  dateTo: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormDatePickers({ dateFrom, dateTo, onInputChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="dateFrom">Fecha y Hora de Inicio</Label>
        <Input
          id="dateFrom"
          type="datetime-local"
          name="dateFrom"
          value={dateFrom}
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
          value={dateTo}
          onChange={onInputChange}
          required
        />
      </div>
    </div>
  );
}