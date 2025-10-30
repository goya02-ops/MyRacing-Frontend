import { lazy, useState, useEffect, Suspense } from 'react';
import { Category } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/apiMyRacing.ts';
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
} from '../components/tremor/TremorComponents';
import { useScrollToElement } from '../hooks/useScrollToElement.ts';

const CategoryForm = lazy(() => import('../components/CategoryForm.tsx'));

export default function CategoryAdmin() {
  const [list, setList] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEntities(Category)
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (category: Category) => {
    const saved = await saveEntity(Category, category);
    setList((prev) =>
      prev.some((c) => c.id === saved.id)
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [...prev, saved]
    );
    setEditing(null);
    setIsCreating(false);
  };

  const handleNewCategory = () => {
    setEditing(new Category());
    setIsCreating(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditing(category);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditing(null);
    setIsCreating(false);
  };

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
      <div
        className="
        flex flex-col sm:flex-row    
        justify-between 
        items-start sm:items-center  
        mb-6                         
        gap-4 sm:gap-0               
      "
      >
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Categorías</h2>
          <Badge variant="neutral">Total: {list.length}</Badge>
        </div>
        <Button onClick={handleNewCategory} className="w-full sm:w-auto">
          + Nueva Categoría
        </Button>
      </div>
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
                  initial={editing as Category}
                  onCancel={handleCancel}
                  onSave={handleSave}
                />
              </Suspense>
            </div>
            <Divider className="my-6" />
          </div>
        )}

        {!isCreating && editing && (
          <div className="mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-orange-400">
                Editar Categoría: {editing.denomination}
              </h3>
              <Suspense
                fallback={
                  <div className="text-center p-4">Cargando formulario...</div>
                }
              >
                <CategoryForm
                  initial={editing as Category}
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
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.denomination}
                  </TableCell>
                  <TableCell>{c.abbreviation}</TableCell>
                  <TableCell className="truncate max-w-xs">
                    {c.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={
                        editing?.id === c.id && !isCreating
                          ? 'primary'
                          : 'ghost'
                      }
                      onClick={() =>
                        editing?.id === c.id && !isCreating
                          ? handleCancel()
                          : handleEditCategory(c)
                      }
                    >
                      {editing?.id === c.id && !isCreating
                        ? 'Cancelar'
                        : 'Editar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
