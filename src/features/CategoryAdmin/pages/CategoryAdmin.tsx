import { lazy, Suspense, useState, useCallback } from 'react';
import { Category } from '../../../types/entities.ts';
import { useEntityQuery } from '../../../hooks/useEntityQuery.ts';
import { useEntityMutation } from '../../../hooks/useEntityMutation.ts';

import {
  Card,
  Button,
  Badge,
  Divider,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
} from '../../../components/tremor/TremorComponents.tsx';
import { useScrollToElement } from '../../../hooks/useScrollToElement.ts';
import { CategoryRow } from '../components/CategoryRow.tsx';

const CategoryForm = lazy(() => import('../components/CategoryForm.tsx'));

export default function CategoryAdmin() {
  const { list, isLoading } = useEntityQuery(Category);

  const { saveEntity } = useEntityMutation(Category);

  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const formContainerRef = useScrollToElement<HTMLDivElement>(editing);

  const handleCancel = useCallback(() => {
    setEditing(null);
    setIsCreating(false);
  }, []);

  const handleSave = useCallback(
    async (category: Category) => {
      try {
        await saveEntity(category);
        handleCancel();
      } catch (error: any) {
        console.error('Error al guardar categoría:', error);
        alert(`Error al guardar: ${error.message || String(error)}`);
      }
    },
    [saveEntity, handleCancel]
  );

  const handleNewCategory = useCallback(() => {
    setEditing(new Category());
    setIsCreating(true);
  }, []);

  const handleEditCategory = useCallback((category: Category) => {
    setEditing({ ...category });
    setIsCreating(false);
  }, []);

  if (isLoading) {
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

      <div ref={formContainerRef}>
        {editing && (
          <div className="mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                {isCreating
                  ? 'Crear Nueva Categoría'
                  : `Editar Categoría: ${editing.denomination}`}
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
              {list.map((c) => (
                <CategoryRow
                  key={c.id}
                  category={c}
                  editing={editing}
                  isCreating={isCreating}
                  handleEditCategory={handleEditCategory}
                  handleCancel={handleCancel}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
