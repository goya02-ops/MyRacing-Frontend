import {
  Input,
  Label,
} from '../../../../components/tremor/TremorComponents';

interface Props {
  dateFrom: string;
  dateTo: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing?: boolean; 
}

export function FormDatePickers({ dateFrom, dateTo, onInputChange, isEditing = false }: Props) {
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
          disabled={isEditing} // Deshabilitar cuando estamos editando
          required
          className={isEditing ? 'opacity-60 cursor-not-allowed' : ''}
        />
        {isEditing && (
          <p className="text-xs text-gray-500 mt-1">
            La fecha de inicio no puede modificarse
          </p>
        )}
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