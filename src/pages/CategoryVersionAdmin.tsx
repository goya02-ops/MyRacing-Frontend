// src/components/CategoryVersionAdmin.tsx

import { lazy, useEffect, useState } from 'react';
import { CategoryVersion, Category, Simulator } from '../types/entities';
import { fetchEntities, saveEntity } from '../services/apiMyRacing';
const CategoryVersionForm = lazy(
  () => import('../components/CategoryVersionForm')
);

export default function CategoryVersionAdmin() {
  const [list, setList] = useState<CategoryVersion[]>([]);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [simulators, setSimulators] = useState<Simulator[] | null>(null);
  const [editing, setEditing] = useState<CategoryVersion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchEntities(CategoryVersion).then(setList).catch(console.error);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Capturar circuitos y simuladores para el formulario
  useEffect(() => {
    //Solo cargar si se está editando y no se han cargado ya
    if (editing && !categories && !simulators) {
      const fetchData = async () => {
        try {
          await fetchEntities(Category).then(setCategories);
          const sims = await fetchEntities(Simulator);
          //Mostrar solo aquellos que estén activos
          setSimulators(sims.filter((s) => s.status === 'Activo'));
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [editing, categories, simulators]);

  // Función para verificar duplicados (solo por categoría y simulador)
  const isDuplicate = (cv: CategoryVersion): boolean => {
    return list.some((item) => {
      // Extraer IDs si son objetos
      const itemCategoryId =
        typeof item.category === 'object' ? item.category.id : item.category;
      const itemSimulatorId =
        typeof item.simulator === 'object' ? item.simulator.id : item.simulator;
      const cvCategoryId =
        typeof cv.category === 'object' ? cv.category.id : cv.category;
      const cvSimulatorId =
        typeof cv.simulator === 'object' ? cv.simulator.id : cv.simulator;

      return (
        itemCategoryId === cvCategoryId &&
        itemSimulatorId === cvSimulatorId &&
        item.id !== cv.id // Excluir el mismo registro si estamos editando
      );
    });
  };

  function normalizeCategoryVersion(cv: CategoryVersion): CategoryVersion {
    return {
      ...cv,
      category: typeof cv.category === 'object' ? cv.category.id! : cv.category,
      simulator:
        typeof cv.simulator === 'object' ? cv.simulator.id! : cv.simulator,
    };
  }

  const handleSave = async (categoryVersion: CategoryVersion) => {
    // Normalizar el objeto antes de guardar (asegurar que sean solo IDs)
    const normalized = normalizeCategoryVersion(categoryVersion);

    // Verificar duplicado
    if (isDuplicate(normalized)) {
      alert('Esta combinación de Categoría y Simulador ya existe.');
      return;
    }

    try {
      const saved = await saveEntity(CategoryVersion, normalized);
      setList((prev) =>
        prev.some((c) => c.id === saved.id)
          ? prev.map((c) => (c.id === saved.id ? saved : c))
          : [...prev, saved]
      );
      setEditing(null);
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error al guardar la versión de categoría');
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <section>
      <h2>Administrar Versiones de Categoría</h2>
      <button onClick={() => setEditing(new CategoryVersion())}>
        + Nueva Versión de Categoría
      </button>

      <table>
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Simulador</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map((cv) => (
            <tr key={cv.id}>
              <td>
                {typeof cv.category === 'object'
                  ? cv.category.denomination
                  : `ID ${cv.category}`}
              </td>
              <td>
                {typeof cv.simulator === 'object'
                  ? cv.simulator.name
                  : `ID ${cv.simulator}`}
              </td>
              <td>{cv.status}</td>
              <td>
                <button
                  onClick={() => {
                    setEditing(cv);
                  }}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && categories && simulators && (
        <CategoryVersionForm
          initial={editing}
          categories={categories}
          simulators={simulators}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </section>
  );
}
