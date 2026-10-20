import { describe, expect, it } from 'vitest';
import {
  QUERY_KEYS,
  createPaymentStatusKey,
  createRacesForCombinationKey,
} from './queryKeys';

describe('queryKeys', () => {
  describe('QUERY_KEYS constants', () => {
    it('contiene todas las claves definidas con sus valores esperados', () => {
      expect(QUERY_KEYS).toEqual({
        ENTITY: '[cls.name]',
        PROFILE: 'userProfile',
        MEMBERSHIP: 'currentMembership',
        PAYMENT_STATUS: 'paymentStatus',
        COMBINATIONS: 'currentCombinations',
        RACES_FOR_COMBINATION: 'racesForCombination',
        SIMULATOR_VERSIONS: 'simulatorVersions',
      });
    });

    it('cada constante es un string no vacío', () => {
      Object.entries(QUERY_KEYS).forEach(([key, value]) => {
        expect(typeof value, `La key ${key} debe ser string`).toBe('string');
        expect(value.length, `La key ${key} no debe estar vacía`).toBeGreaterThan(0);
      });
    });
  });

  describe('createPaymentStatusKey', () => {
    it('genera la tupla correcta para un ID de pago válido', () => {
      const result = createPaymentStatusKey('pay_abc123');
      expect(result).toEqual(['paymentStatus', 'pay_abc123']);
      expect(result[0]).toBe(QUERY_KEYS.PAYMENT_STATUS);
    });

    it('maneja strings vacíos como ID de pago', () => {
      const result = createPaymentStatusKey('');
      expect(result).toEqual(['paymentStatus', '']);
    });

    it('maneja valores no string o atípicos de forma consistente', () => {
      const resultNull = createPaymentStatusKey(null as unknown as string);
      expect(resultNull).toEqual(['paymentStatus', null]);

      const resultUndefined = createPaymentStatusKey(undefined as unknown as string);
      expect(resultUndefined).toEqual(['paymentStatus', undefined]);
    });
  });

  describe('createRacesForCombinationKey', () => {
    it('genera la tupla correcta para un ID de combinación numérico válido', () => {
      const result = createRacesForCombinationKey(42);
      expect(result).toEqual(['racesForCombination', 42]);
      expect(result[0]).toBe(QUERY_KEYS.RACES_FOR_COMBINATION);
    });

    it('maneja el valor 0 como ID válido', () => {
      const result = createRacesForCombinationKey(0);
      expect(result).toEqual(['racesForCombination', 0]);
    });

    it('maneja números negativos y valores de borde numéricos', () => {
      const resultNegative = createRacesForCombinationKey(-1);
      expect(resultNegative).toEqual(['racesForCombination', -1]);

      const resultNaN = createRacesForCombinationKey(NaN);
      expect(resultNaN[0]).toBe('racesForCombination');
      expect(Number.isNaN(resultNaN[1])).toBe(true);
    });

    it('maneja valores nulos o indefinidos si se fuerzan los tipos', () => {
      const resultNull = createRacesForCombinationKey(null as unknown as number);
      expect(resultNull).toEqual(['racesForCombination', null]);

      const resultUndefined = createRacesForCombinationKey(undefined as unknown as number);
      expect(resultUndefined).toEqual(['racesForCombination', undefined]);
    });
  });
});
