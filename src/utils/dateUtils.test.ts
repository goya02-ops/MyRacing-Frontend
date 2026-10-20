import { describe, expect, it, vi } from 'vitest';
import { formatDateTime } from './dateUtils';

describe('dateUtils - formatDateTime', () => {
  describe('casos nulos, undefined y strings vacíos', () => {
    it('retorna "N/A" cuando el valor es null', () => {
      expect(formatDateTime(null)).toBe('N/A');
    });

    it('retorna "N/A" cuando el valor es undefined', () => {
      expect(formatDateTime(undefined)).toBe('N/A');
    });

    it('retorna "N/A" cuando el valor es un string vacío', () => {
      expect(formatDateTime('')).toBe('N/A');
    });
  });

  describe('casos con fechas inválidas', () => {
    it('retorna "Fecha inválida" cuando se pasa un string no representativo de fecha', () => {
      expect(formatDateTime('fecha-invalida')).toBe('Fecha inválida');
    });

    it('retorna "Fecha inválida" para una fecha inexistente', () => {
      expect(formatDateTime('2024-99-99')).toBe('Fecha inválida');
    });

    it('retorna "Fecha inválida" cuando se pasa una instancia de Date inválida', () => {
      const invalidDate = new Date('invalida');
      expect(formatDateTime(invalidDate)).toBe('Fecha inválida');
    });
  });

  describe('casos de uso válidos', () => {
    it('formatea correctamente una instancia de Date válida', () => {
      const date = new Date(2026, 9, 20, 15, 30);
      const formatted = formatDateTime(date);
      const expected = date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      expect(formatted).toBe(expected);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('formatea correctamente un string de fecha en formato ISO', () => {
      const isoString = '2026-05-15T12:00:00.000Z';
      const expectedDate = new Date(isoString);
      const formatted = formatDateTime(isoString);
      const expected = expectedDate.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      expect(formatted).toBe(expected);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('manejo de excepciones imprevistas', () => {
    it('captura el error y retorna "Error de formato" si toLocaleString falla', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const dateSpy = vi.spyOn(Date.prototype, 'toLocaleString').mockImplementation(() => {
        throw new Error('Simulated formatting error');
      });

      expect(formatDateTime('2026-01-01')).toBe('Error de formato');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error al formatear fecha:',
        expect.any(Error)
      );

      dateSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
