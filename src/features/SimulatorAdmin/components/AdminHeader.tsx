import { Button, Badge } from '../../../components/tremor/TremorComponents';

interface AdminHeaderProps {
  listLength: number;
  onNew: () => void;
}

export function AdminHeader({ listLength, onNew }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Simuladores</h2>
        <Badge variant="neutral">Total: {listLength}</Badge>
      </div>
      <Button onClick={onNew} className="w-full sm:w-auto">
        + Nuevo Simulador
      </Button>
    </div>
  );
}
