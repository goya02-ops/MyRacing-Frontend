import { lazy, Suspense } from 'react';
import { Combination } from '../../../types/entities.ts';

import { useCombinationDependencies } from '../hooks/useCombinationDependencies.ts';
import { useCombinationAdminPage } from '../hooks/useCombinationAdminPage.ts';
import { CombinationAdminProvider } from '../../../context/CombinationAdminContext.tsx';

import {
  Card,
  Button,
  Badge,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '../../../components/tremor/TremorComponents';
import CombinationFilterPanel from '../components/CombinationFilterPanel.tsx';
import Spinner from '../../../components/Spinner.tsx';

const CombinationList = lazy(() => import('../components/CombinationList.tsx'));
const CombinationForm = lazy(() => import('../components/CombinationForm.tsx'));

export default function CombinationAdmin() {
  const { simulators, categories, circuits, loadingDependencies } =
    useCombinationDependencies();

  const {
    list,
    filteredList,
    editing,
    loading: loadingCombinations,
    isCreating,
    filtersVisible,
    setFiltersVisible,
    filters,
    formContainerRef,
    handleSave,
    handleNewCombination,
    handleEditCombination,
    handleCancel,
  } = useCombinationAdminPage();

  if (loadingCombinations || loadingDependencies) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner>Cargando dependencias...</Spinner>
      </div>
    );
  }

  return (
    <CombinationAdminProvider
      value={{ simulators, categories, circuits, loadingDependencies }}
    >
      <div className="space-y-6">
        <Card className="text-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                Administrar Combinaciones
              </h2>
              <Badge variant="neutral">
                Total: {filteredList.length} / {list.length}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFiltersVisible((prev) => !prev)}
                className={`... (clases del botón de filtro) ...`}
              >
                {filtersVisible ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
              <Button
                onClick={handleNewCombination}
                className="w-full sm:w-auto"
              >
                + Nueva Combinación
              </Button>
            </div>
          </div>

          {filtersVisible && <CombinationFilterPanel filters={filters} />}

          <div ref={formContainerRef}>
            {isCreating && editing && (
              <div className="mb-6">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-orange-400">
                    Crear Nueva Combinación
                  </h3>
                  <Suspense
                    fallback={
                      <div className="text-center p-4">
                        Cargando formulario...
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
                <Divider className="my-6" />
              </div>
            )}
          </div>

          {list.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No hay combinaciones registradas
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Simulador</TableHeaderCell>
                    <TableHeaderCell>Categoría</TableHeaderCell>
                    <TableHeaderCell>Circuito</TableHeaderCell>
                    <TableHeaderCell>Desde</TableHeaderCell>
                    <TableHeaderCell>Hasta</TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Config.
                    </TableHeaderCell>
                    <TableHeaderCell className="text-center">
                      Usuario
                    </TableHeaderCell>
                    <TableHeaderCell className="text-right">
                      Acciones
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <Suspense
                    fallback={
                      <TableRow>
                        <TableCell colSpan={8} className="text-center p-4">
                          <Spinner>Cargando combinaciones...</Spinner>
                        </TableCell>
                      </TableRow>
                    }
                  >
                    <CombinationList
                      list={list}
                      filteredList={filteredList}
                      editing={editing}
                      isCreating={isCreating}
                      handleEditCombination={handleEditCombination}
                      handleCancel={handleCancel}
                      handleSave={handleSave}
                    />
                  </Suspense>
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </CombinationAdminProvider>
  );
}
