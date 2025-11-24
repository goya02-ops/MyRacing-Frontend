import { lazy, Suspense } from 'react';
import { useCategoryAdmin } from '../hooks/useCategoryAdmin';
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
} from '../../../components/tremor/TremorComponents';
import { useScrollToElement } from '../../../hooks/useScrollToElement';
import { CategoryRow } from '../components/CategoryRow';

const CategoryForm = lazy(() => import('../components/CategoryForm'));

export default function CategoryAdmin() {
  const {
    list,
    editing,
    isCreating,
    loading,
    handleSave,
    handleCancel,
    handleNewCategory,
    handleEditCategory,
  } = useCategoryAdmin();

  const formContainerRef = useScrollToElement<HTMLDivElement>(editing);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-400">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <Card className="text-gray-200">
    
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Categorías</h2>
          <Badge variant="neutral">Total: {list.length}</Badge>
        </div>
        <Button onClick={handleNewCategory} className="w-full sm:w-auto">
          + Nueva Categoría
        </Button>
      </div>

      {/* FORMULARIO DE CREACIÓN */}
      <div ref={formContainerRef}>
        {isCreating && editing && (
          <div className="mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                Crear Nueva Categoría
              </h3>
              <Suspense
                fallback={
                  <div className="text-center p-4">Cargando formulario...</div>
                }
              >
                <CategoryForm
                  initial={editing}
                  onCancel={handleCancel}
                  onSave={handleSave}
                />
              </Suspense>
            </div>
            <Divider className="my-6" />
          </div>
        )}
      </div>

      {/* TABLA DE LISTADO */}
      {list.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No hay categorías para mostrar
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Denominación</TableHeaderCell>
                <TableHeaderCell>Abreviatura</TableHeaderCell>
                <TableHeaderCell>Descripción</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Acciones
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  editing={editing}
                  isCreating={isCreating}
                  handleEditCategory={handleEditCategory}
                  handleCancel={handleCancel}
                  handleSave={handleSave}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}