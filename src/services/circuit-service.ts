import type { Circuit } from '../type.d.ts';

export async function fetchCircuits(): Promise<Circuit[]> {
  const res = await fetch('/api/circuits');
  if (!res.ok) throw new Error('Error al obtener circuitos');
  const data = await res.json();

  if (!Array.isArray(data)) {
    console.error('Respuesta inesperada:', data);
    throw new Error('La respuesta no es un array');
  }

  return data;
}

export async function saveCircuit(circuit: Circuit): Promise<Circuit> {
  const method = circuit.id ? 'PUT' : 'POST';
  const url = circuit.id ? `/api/circuits/${circuit.id}` : '/api/circuits';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(circuit),
  });

  if (!res.ok) throw new Error('Error al guardar circuito');
  return res.json();
}
