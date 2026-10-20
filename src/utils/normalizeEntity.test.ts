import { describe, expect, it } from 'vitest';
import { normalizeRelations } from './normalizeEntity';

describe('normalizeEntity - normalizeRelations', () => {
  describe('casos de uso válidos con relaciones', () => {
    it('mantiene la relación cuando es un objeto con únicamente id', () => {
      const input = {
        name: 'Gran Premio',
        circuit: { id: 10 },
      };

      const result = normalizeRelations(input);

      expect(result).toEqual({
        name: 'Gran Premio',
        circuit: { id: 10 },
      });
    });

    it('conserva propiedades adicionales si el objeto de relación no tiene solo id', () => {
      const input = {
        name: 'Carrera',
        circuit: { id: 10, name: 'Monza' },
      };

      const result = normalizeRelations(input);

      expect(result).toEqual({
        name: 'Carrera',
        circuit: { id: 10, name: 'Monza' },
      });
    });

    it('maneja múltiples relaciones anidadas simultáneas', () => {
      const input = {
        id: 1,
        title: 'Inscripción',
        user: { id: 5 },
        race: { id: 8 },
        status: 'CONFIRMED',
      };

      const result = normalizeRelations(input);

      expect(result).toEqual({
        id: 1,
        title: 'Inscripción',
        user: { id: 5 },
        race: { id: 8 },
        status: 'CONFIRMED',
      });
    });

    it('funciona correctamente dentro de arrays de objetos', () => {
      const input = [
        { id: 1, circuit: { id: 10 } },
        { id: 2, circuit: { id: 20 } },
      ];

      const result = normalizeRelations(input);

      expect(result).toEqual([
        { id: 1, circuit: { id: 10 } },
        { id: 2, circuit: { id: 20 } },
      ]);
    });
  });

  describe('inmutabilidad y clonado profundo', () => {
    it('retorna una nueva referencia y no muta el objeto original', () => {
      const original = {
        name: 'Original',
        relation: { id: 4 },
      };

      const result = normalizeRelations(original);

      expect(result).toEqual(original);
      expect(result).not.toBe(original);
      expect(result.relation).not.toBe(original.relation);
    });
  });

  describe('casos borde y valores primitivos', () => {
    it('maneja un objeto vacío', () => {
      expect(normalizeRelations({})).toEqual({});
    });

    it('maneja objetos con valores primitivos diversos (boolean, string, number, null)', () => {
      const input = {
        active: false,
        count: 0,
        text: '',
        extra: null,
      };

      expect(normalizeRelations(input)).toEqual(input);
    });

    it('maneja valores primitivos de entrada directos', () => {
      expect(normalizeRelations(123)).toBe(123);
      expect(normalizeRelations('texto')).toBe('texto');
      expect(normalizeRelations(true)).toBe(true);
    });

    it('maneja null retornando null', () => {
      expect(normalizeRelations(null)).toBeNull();
    });

    it('lanza SyntaxError si se pasa undefined (comportamiento inherente de JSON.parse)', () => {
      expect(() => normalizeRelations(undefined)).toThrow();
    });

    it('maneja objetos con id pero cuyo valor es null, undefined o string', () => {
      expect(normalizeRelations({ id: null })).toEqual({ id: null });
      expect(normalizeRelations({ id: 'uuid-123' })).toEqual({ id: 'uuid-123' });
    });
  });
});
