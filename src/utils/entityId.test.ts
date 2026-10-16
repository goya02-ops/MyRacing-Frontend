import { describe, it, expect } from 'vitest';
import { toId } from './entityId';

describe('entityId.toId (BE #57: unifica toId/getId)', () => {
  it('devuelve el valor tal cual cuando ya es un id', () => {
    expect(toId(10)).toBe(10);
    expect(toId(0)).toBe(0);
  });

  it('extrae el id de una entidad expandida', () => {
    expect(toId({ id: 7, denomination: 'Turismo Carretera' })).toBe(7);
  });

  it('devuelve undefined cuando la entidad no tiene id', () => {
    expect(toId({})).toBeUndefined();
  });

  it('no explota con null ni undefined', () => {
    expect(toId(null)).toBeUndefined();
    expect(toId(undefined)).toBeUndefined();
  });

  it('trata null como "sin id" aunque typeof null === "object"', () => {
    expect(toId(null)).toBeUndefined();
    expect(toId({ id: 1 })).toBe(1);
  });
});
