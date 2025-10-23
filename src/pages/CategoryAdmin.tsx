import { lazy, useState, useEffect, Suspense } from 'react';
import { Category } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/apiMyRacing.ts';
import {
  Card,
  Button,
  Badge,
  Divider
} from '../components/tremor/TremorComponents';

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-400">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <Card className="text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Categorías</h2>
          <Badge variant="neutral">Total: {list.length}</Badge>
        </div>
        <Button onClick={handleNewCategory}>
          + Nueva Categoría
        </Button>
      </div>


      {isCreating && editing && (
        <div className="mb-6">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Crear Nueva Categoría</h3>
            <Suspense fallback={<div className="text-center p-4">Cargando formulario...</div>}>
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

      <div className="hidden md:flex text-sm font-semibold text-gray-400 pb-2 px-4">
        <div className="w-1/4">Denominación</div>
        <div className="w-1/4">Abreviatura</div>
        <div className="w-2/4">Descripción</div>
        <div className="w-1/4 text-right">Acciones</div>
      </div>

      <div className="space-y-2">
        {list.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No hay categorías para mostrar
          </div>
        ) : (
          list.map((c) => (
            <div key={c.id} className="space-y-2">
             
              <div className="flex flex-col md:flex-row items-start md:items-center py-4 px-4 hover:bg-gray-900/50 rounded-lg border-b border-gray-700/50">
                <div className="w-full md:w-1/4 mb-2 md:mb-0 font-medium">{c.denomination}</div>
                <div className="w-full md:w-1/4 mb-2 md:mb-0">{c.abbreviation}</div>
                <div className="w-full md:w-2/4 mb-2 md:mb-0 truncate">{c.description}</div>
                <div className="w-full md:w-1/4 flex justify-end">
                  <Button
                    variant={editing?.id === c.id && !isCreating ? 'primary' : 'ghost'}
                    onClick={() => editing?.id === c.id && !isCreating ? handleCancel() : handleEditCategory(c)}
                  >
                    {editing?.id === c.id && !isCreating ? 'Cancelar' : 'Editar'}
                  </Button>
                </div>
              </div>

              
              {editing?.id === c.id && !isCreating && (
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-2">
                  <h3 className="text-lg font-semibold mb-4 text-orange-400">Editar Categoría</h3>
                  <Suspense fallback={<div className="text-center p-4">Cargando formulario...</div>}>
                    <CategoryForm
                      initial={editing as Category}  
                      onCancel={handleCancel}
                      onSave={handleSave}
                    />
                  </Suspense>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}