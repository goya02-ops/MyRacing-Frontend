import { useState, useEffect } from 'react';
// Importamos la clase base Race
import { Race, Combination } from '../types/entities'; 

// 1. DEFINICIÓN DE LA INTERFAZ LOCAL (Para incluir el 'id' heredado)
// Esto resuelve el error "Property 'id' does not exist on type 'Race'"
interface RaceWithId extends Race {
    id?: number; 
}

// 2. DEFINICIÓN DE LAS PROPS USANDO LA INTERFAZ LOCAL
interface RaceFormProps {
  initial: RaceWithId; // Acepta la instancia que incluye el 'id'
  combinations: Combination[]; // Lista de Combinations para el select
  onSave: (race: RaceWithId) => void; // onSave debe devolver el tipo que incluye 'id'
  onCancel: () => void;
}

export default function RaceForm({ 
  initial, 
  combinations, 
  onSave, 
  onCancel 
}: RaceFormProps) {
  
  // 3. Inicialización del estado con el tipo correcto (RaceWithId)
  const [form, setForm] = useState<RaceWithId>(initial);

  // Asegura que el estado se actualice cuando la prop 'initial' cambia (para edición)
  useEffect(() => {
    setForm(initial);
  }, [initial]);

  // Maneja cambios en campos de texto/número/fecha
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: value
    }));
  };

  // 4. Maneja el cambio en el select de Combination
  const handleCombinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Al guardar, el backend solo necesita el ID de la Combination.
    // Convertimos el string 'value' a Number.
    const combinationId = Number(value);
    
    setForm((prev) => ({ 
      ...prev, 
      [name]: combinationId
    }));
  };

  // 5. Obtiene el ID actual de la combination para el select
  const getCurrentCombinationId = () => {
    // Si la combinación está poblada (es un objeto)
    if (typeof form.combination === 'object' && form.combination) {
      return form.combination.id;
    }
    // Si ya es el ID (número) o undefined
    return form.combination || ''; 
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      {/* USO DEL ID: No da error porque 'form' es de tipo RaceWithId */}
      <h3>{form.id ? 'Editar' : 'Crear'} Carrera</h3>
      
      {/* Campo 1: Fecha y Hora de la Carrera */}
      <label>
        Fecha y Hora de la Carrera:
        <input
          type="datetime-local"
          name="raceDateTime"
          value={form.raceDateTime}
          onChange={handleInputChange}
          required
        />
      </label>

      {/* Campo 2: Fecha Límite de Inscripción */}
      <label>
        Fecha Límite de Inscripción:
        <input
          type="datetime-local"
          name="registrationDeadline"
          value={form.registrationDeadline}
          onChange={handleInputChange}
          required
        />
      </label>

      {/* Campo 3: Selección de Combination (Reglas del Evento) */}
      <label>
        Combinación de Reglas:
        <select
          name="combination"
          value={getCurrentCombinationId()}
          onChange={handleCombinationChange}
          required
        >
          <option value="">Seleccione una combinación</option>
          {combinations.map((comb) => (
            <option key={comb.id} value={comb.id}>
              {comb.id} - {comb.name || 'Sin nombre'}
            </option>
          ))}
        </select>
      </label>

      <button type="submit">Guardar Carrera</button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}