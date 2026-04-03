import { lazy, Suspense } from 'react';
import { Category } from '../../../types/entities';
import {
  TableRow,
  TableCell,
  Button,
} from '../../../components/tremor/TremorComponents';

// Importación Lazy del formulario para mejorar rendimiento
const CategoryForm = lazy(() => import('./CategoryForm'));

interface CategoryRowProps {
  category: Category;
  editing: Category | null;
  isCreating: boolean;
  handleEditCategory: (category: Category) => void;
  handleCancel: () => void;
  handleSave: (category: Category) => void;
}

export function CategoryRow({
  category,
  editing,
  isCreating,
  handleEditCategory,
  handleCancel,
  handleSave,
}: CategoryRowProps) {
  // Verificacion si esta fila específica es la que se está editando
  const isEditingThis = editing?.id === category.id && !isCreating;

  return (
    <>
      {/* Fila de Datos */}
      <TableRow>
        <TableCell className="font-medium">{category.denomination}</TableCell>
        <TableCell>{category.abbreviation}</TableCell>
        <TableCell className="truncate max-w-xs">
          {category.description}
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant={isEditingThis ? 'primary' : 'ghost'}
            onClick={() =>
              isEditingThis ? handleCancel() : handleEditCategory(category)
            }
          >
            {isEditingThis ? 'Cancelar' : 'Editar'}
          </Button>
        </TableCell>
      </TableRow>

      {/* Formulario de Edición Inline (Solo visible si se edita esta fila) */}
      {isEditingThis && (
        <TableRow>
          <TableCell colSpan={4} className="p-0">
            <div className="bg-gray-900/50 p-4 border-t-2 border-orange-500">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                Editar Categoría
              </h3>
              <Suspense
                fallback={
                  <div className="text-center p-4">Cargando formulario...</div>
                }
              >
                <CategoryForm
                  initial={editing as Category}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </Suspense>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}