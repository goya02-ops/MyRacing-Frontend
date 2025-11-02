import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Button,
} from '../../../components/tremor/TremorComponents';
import { CategoryVersion, CircuitVersion } from '../../../types/entities';

interface VersionListProps {
  isCategory: boolean;
  versions: (CategoryVersion | CircuitVersion)[];
  editingVersion: CategoryVersion | CircuitVersion | null;
  isCreatingVersion: boolean;
  handleEditVersion: (version: CategoryVersion | CircuitVersion) => void;
  handleCancelVersion: () => void;
}

export function VersionList({
  isCategory,
  versions,
  editingVersion,
  isCreatingVersion,
  handleEditVersion,
  handleCancelVersion,
}: VersionListProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Denominación</TableHeaderCell>
            <TableHeaderCell>Estado</TableHeaderCell>
            <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {versions.map((v: any) => (
            <TableRow key={v.id}>
              <TableCell className="font-medium">
                {(isCategory
                  ? v.category?.denomination
                  : v.circuit?.denomination) || 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant={v.status === 'Activo' ? 'success' : 'error'}>
                  {v.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant={
                    editingVersion?.id === v.id && !isCreatingVersion
                      ? 'primary'
                      : 'ghost'
                  }
                  onClick={() =>
                    editingVersion?.id === v.id && !isCreatingVersion
                      ? handleCancelVersion()
                      : handleEditVersion(v)
                  }
                >
                  {editingVersion?.id === v.id && !isCreatingVersion
                    ? 'Cancelar'
                    : 'Editar'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
