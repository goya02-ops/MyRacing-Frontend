import { describe, expect, it } from 'vitest';
import { formatDateTime } from './dateUtils';

describe('formatDateTime', () => {
  it('retorna N/A para null y undefined', () => {
    expect(formatDateTime(null)).toBe('N/A');
    expect(formatDateTime(undefined)).toBe('N/A');
  });

  it('retorna Fecha inválida para valores no parseables', () => {
    expect(formatDateTime('no-es-una-fecha')).toBe('Fecha inválida');
  });

  it('formatea una fecha válida en formato es-AR (robusto al ICU)', () => {
    const result = formatDateTime(new Date(2026, 9, 8, 15, 30));

    // Propiedades robustas al ICU: contiene el año y matchea dd/mm/aaaa
    expect(result).toContain('2026');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('acepta strings ISO válidos', () => {
    const result = formatDateTime('2026-10-08T15:30:00');

    expect(result).toContain('2026');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
