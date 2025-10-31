// src/hooks/useCircuitAdmin.ts

import { useState, useEffect, useCallback } from 'react';
import { Circuit } from '../types/entities.ts';
import { fetchEntities, saveEntity } from '../services/apiService.ts';

// Estructura de datos que devuelve el hook
interface CircuitAdminLogic {
  list: Circuit[];
  editing: Circuit | null;
  isCreating: boolean;
  loading: boolean;
  handleSave: (circuit: Circuit) => Promise<void>;
  handleNewCircuit: () => void;
  handleEditCircuit: (circuit: Circuit) => void;
  handleCancel: () => void;
}

export function useCircuitAdmin(): CircuitAdminLogic {
  const [list, setList] = useState<Circuit[]>([]);
  const [editing, setEditing] = useState<Circuit | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // LÓGICA 1: Carga inicial de datos
  useEffect(() => {
    setLoading(true);
    fetchEntities(Circuit)
      .then((data) => setList(data || [])) // Aseguramos que sea un array
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // LÓGICA 2: Handler de guardado (Crear o Actualizar)
  const handleSave = useCallback(async (circuit: Circuit) => {
    try {
      const saved = await saveEntity(Circuit, circuit);

      // Actualiza la lista local (actualización optimista)
      setList((prev) =>
        prev.some((c) => c.id === saved.id)
          ? prev.map((c) => (c.id === saved.id ? saved : c))
          : [...prev, saved]
      );

      // Cierra los formularios
      setEditing(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error al guardar el circuito:', error);
      alert('Error al guardar el circuito.');
    }
  }, []); // El array vacío indica que esta función no se recalcula

  // LÓGICA 3: Handlers de estado de la UI
  const handleNewCircuit = useCallback(() => {
    setEditing(new Circuit()); // Asume que la clase 'Circuit' inicializa los campos
    setIsCreating(true);
  }, []);

  const handleEditCircuit = useCallback((circuit: Circuit) => {
    setEditing(circuit);
    setIsCreating(false);
  }, []);

  const handleCancel = useCallback(() => {
    setEditing(null);
    setIsCreating(false);
  }, []);

  // 4. Retorno de los estados y handlers
  return {
    list,
    editing,
    isCreating,
    loading,
    handleSave,
    handleNewCircuit,
    handleEditCircuit,
    handleCancel,
  };
}
