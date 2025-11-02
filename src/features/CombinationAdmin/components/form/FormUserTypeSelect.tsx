import {
  Label,
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '../../../../components/tremor/TremorComponents';

interface Props {
  userType: string;
  onSelectChange: (name: string, value: string) => void;
}

export function FormUserTypeSelect({ userType, onSelectChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="userType">Tipo de Usuario</Label>
        <Select
          name="userType"
          value={userType}
          onValueChange={(v) => onSelectChange('userType', v)}
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
  );
}
