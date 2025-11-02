import React, { lazy, Suspense } from 'react';
import { Combination } from '../../../types/entities';
import {
  getCategoryName,
  getCircuitName,
  getSimulatorName,
} from '../../../utils/combination/getters';
import {
  Button,
  Badge,
  TableRow,
  TableCell,
} from '../../../components/tremor/TremorComponents';
import Spinner from '../../../components/Spinner';

const CombinationForm = lazy(() => import('../components/CombinationForm'));

// 1. Props limpias: no recibe 'simulators'
interface CombinationListProps {
  list: Combination[];
  filteredList: Combination[];
  editing: Combination | null;
  isCreating: boolean;
  handleEditCombination: (combination: Combination) => void;
  handleCancel: () => void;
  handleSave: (combination: Combination) => void;
}

export const CombinationList: React.FC<CombinationListProps> = ({
  filteredList,
  editing,
  isCreating,
  handleEditCombination,
  handleCancel,
  handleSave,
}) => {
  return (
    <>
      {filteredList.map((comb) => (
        <React.Fragment key={comb.id}>
          <TableRow>
            <TableCell className="font-medium">
              {getSimulatorName(comb)}
            </TableCell>
            <TableCell>{getCategoryName(comb)}</TableCell>
            <TableCell>{getCircuitName(comb)}</TableCell>
            <TableCell>
              {comb.dateFrom
                ? new Date(comb.dateFrom).toLocaleDateString('es-AR')
                : 'N/A'}
            </TableCell>
            <TableCell>
              {comb.dateTo
                ? new Date(comb.dateTo).toLocaleDateString('es-AR')
                : 'N/A'}
            </TableCell>
            <TableCell className="text-center">
              <div className="flex flex-col items-center gap-1">
                <Badge
                  variant="neutral"
                  title="Vueltas"
                >{`V: ${comb.lapsNumber}`}</Badge>
                <Badge
                  variant="neutral"
                  title="Paradas"
                >{`P: ${comb.obligatoryStopsQuantity}`}</Badge>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Badge
                variant={comb.userType === 'Premium' ? 'warning' : 'default'}
              >
                {comb.userType?.toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant={
                  editing?.id === comb.id && !isCreating ? 'primary' : 'ghost'
                }
                onClick={() =>
                  editing?.id === comb.id && !isCreating
                    ? handleCancel()
                    : handleEditCombination(comb)
                }
              >
                {editing?.id === comb.id && !isCreating ? 'Cancelar' : 'Editar'}
              </Button>
            </TableCell>
          </TableRow>

          {editing?.id === comb.id && !isCreating && (
            <TableRow>
              <TableCell colSpan={8} className="p-0">
                <div className="bg-gray-900/50 p-4 border-t-2 border-orange-500">
                  <h3 className="text-lg font-semibold mb-4 text-orange-400">
                    Editar Combinación
                  </h3>
                  <Suspense
                    fallback={
                      <div className="text-center p-4">
                        <Spinner>Cargando formulario...</Spinner>
                      </div>
                    }
                  >
                    <CombinationForm
                      initial={editing as Combination}
                      onSave={handleSave}
                      onCancel={handleCancel}
                    />
                  </Suspense>
                </div>
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default CombinationList;
