import { Circuit } from '../../../types/entities.ts';
import {
  Button,
  TableRow,
  TableCell,
} from '../../../components/tremor/TremorComponents';

interface CircuitRowProps {
  circuit: Circuit;
  editing: Circuit | null;
  isCreating: boolean;

  // Handlers que vienen del hook
  handleEditCircuit: (circuit: Circuit) => void;
  handleCancel: () => void;
}

export const CircuitRow: React.FC<CircuitRowProps> = ({
  circuit,
  editing,
  isCreating,
  handleEditCircuit,
  handleCancel,
}) => {
  const isThisRowEditing = editing?.id === circuit.id && !isCreating;

  return (
    <TableRow>
      <TableCell className="font-medium">{circuit.denomination}</TableCell>
      <TableCell>{circuit.abbreviation}</TableCell>
      <TableCell className="truncate max-w-xs">{circuit.description}</TableCell>
      <TableCell className="text-right">
        <Button
          variant={isThisRowEditing ? 'primary' : 'ghost'}
          onClick={() =>
            isThisRowEditing ? handleCancel() : handleEditCircuit(circuit)
          }
        >
          {isThisRowEditing ? 'Cancelar' : 'Editar'}
        </Button>
      </TableCell>
    </TableRow>
  );
};
