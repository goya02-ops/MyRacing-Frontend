import { describe, it, expect } from 'vitest';
import { createEntityKey, ENTITY_KEY, QUERY_KEYS } from './queryKeys';
import { Simulator, Category } from '../types/entities';

describe('queryKeys (BE #57: createEntityKey)', () => {
  it('prefija la key con el namespace de entidades', () => {
    expect(createEntityKey(Simulator)).toEqual([ENTITY_KEY, 'Simulator']);
  });

  it('da una key distinta a cada clase', () => {
    expect(createEntityKey(Simulator)).not.toEqual(createEntityKey(Category));
  });

  it('es estable: la misma clase produce siempre la misma key', () => {
    expect(createEntityKey(Simulator)).toEqual(createEntityKey(Simulator));
  });

  it('no usa los mismos literales que las keys hardcodeadas de features', () => {
    const featureKeys: string[] = [
      QUERY_KEYS.PROFILE,
      QUERY_KEYS.MEMBERSHIP,
      QUERY_KEYS.COMBINATIONS,
      QUERY_KEYS.RACES_FOR_COMBINATION,
      QUERY_KEYS.SIMULATOR_VERSIONS,
      QUERY_KEYS.PAYMENT_STATUS,
    ];

    expect(featureKeys).not.toContain(ENTITY_KEY);
    expect(createEntityKey(Simulator)[0]).toBe(ENTITY_KEY);
  });
});
