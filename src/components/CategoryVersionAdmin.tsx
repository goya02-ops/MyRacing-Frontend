// src/components/CategoryVersionAdmin.tsx

import { useEffect, useState } from 'react';
import { CategoryVersion, Category, Simulator } from '../types/entities';
import { fetchEntities, saveEntity } from '../services/service';
import CategoryVersionForm from './CategoryVersionForm';

export default function CategoryVersionAdmin() {
  const [list, setList] = useState<CategoryVersion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [editing, setEditing] = useState<CategoryVersion | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar todas las entidades al inicio
  useEffect(() => {
    Promise.all([
      fetchEntities(CategoryVersion),
      fetchEntities(Category),
      fetchEntities(Simulator),
    ])
      .then(([cvList, catList, simList]) => {
        setList(cvList || []);
        setCategories(catList || []);
        setSimulators(simList || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error cargando datos:', error);
        setLoading(false);
      });
  }, []);

  // Función para verificar duplicados (solo por categoría y simulador)
  const isDuplicate = (cv: CategoryVersion): boolean => {
    return list.some((item) => {
      // Extraer IDs si son objetos
      const itemCategoryId = typeof item.category === 'object' ? item.category.id : item.category;
      const itemSimulatorId = typeof item.simulator === 'object' ? item.simulator.id : item.simulator;
      const cvCategoryId = typeof cv.category === 'object' ? cv.category.id : cv.category;
      const cvSimulatorId = typeof cv.simulator === 'object' ? cv.simulator.id : cv.simulator;

      return (
        itemCategoryId === cvCategoryId &&
        itemSimulatorId === cvSimulatorId &&
        item.id !== cv.id // Excluir el mismo registro si estamos editando
      );
    });
  };

  const handleSave = async (categoryVersion: CategoryVersion) => {
    // Normalizar el objeto antes de guardar (asegurar que sean solo IDs)
    const normalized: CategoryVersion = {
      ...categoryVersion,
      category: typeof categoryVersion.category === 'object' ? categoryVersion.category.id : categoryVersion.category,
      simulator: typeof categoryVersion.simulator === 'object' ? categoryVersion.simulator.id : categoryVersion.simulator,
    };

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

  // Funciones helper para mostrar nombres en la tabla
  const getCategoryName = (categoryId?: number | any): string => {
    // Si es un objeto, extraer el id
    const id = typeof categoryId === 'object' ? categoryId?.id : categoryId;
    const cat = categories.find((c) => c.id === id);
    return cat ? `${cat.denomination} (${cat.abbreviation})` : 'N/A';
  };

  const getSimulatorName = (simulatorId?: number | any): string => {
    // Si es un objeto, extraer el id
    const id = typeof simulatorId === 'object' ? simulatorId?.id : simulatorId;
    const sim = simulators.find((s) => s.id === id);
    return sim ? sim.name : 'N/A';
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
              <td>{getCategoryName(cv.category)}</td>
              <td>{getSimulatorName(cv.simulator)}</td>
              <td>{cv.status}</td>
              <td>
                <button onClick={() => {
                  // Normalizar el objeto antes de editar (extraer solo IDs)
                  const normalized: CategoryVersion = {
                    ...cv,
                    category: typeof cv.category === 'object' ? cv.category.id : cv.category,
                    simulator: typeof cv.simulator === 'object' ? cv.simulator.id : cv.simulator,
                  };
                  setEditing(normalized);
                }}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
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