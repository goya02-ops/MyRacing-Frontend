import type { Constructor } from '../types/entityMeta';

/**
 * Constantes centralizadas para las queryKeys de React Query.
 * Usar estas constantes en lugar de strings hardcodeados para evitar errores
 * y mantener consistencia en toda la aplicación.
 */

/**
 * Namespace de las listas de entidades genéricas.
 * No usar `cls.name` a pelo: en el bundle de producción los nombres de clase
 * se minifican y las keys de entidades distintas colisionarían en la caché.
 */
export const ENTITY_KEY = 'entity';

export const QUERY_KEYS = {
  // Perfil de usuario
  PROFILE: 'userProfile',

  // Membresía
  MEMBERSHIP: 'currentMembership',

  // Pagos
  PAYMENT_STATUS: 'paymentStatus',

  // Carreras y combinaciones
  COMBINATIONS: 'currentCombinations',
  RACES_FOR_COMBINATION: 'racesForCombination',

  // Admin - Simulador
  SIMULATOR_VERSIONS: 'simulatorVersions',
} as const;

/**
 * Genera la queryKey de la lista de una entidad genérica.
 * Único punto de entrada para las keys de entidades: la usan
 * useEntityQuery, useEntityMutation y useAdminCRUD para que el cacheo
 * y la invalidación hablen siempre el mismo idioma.
 */
export const createEntityKey = <T>(cls: Constructor<T>) =>
  [ENTITY_KEY, cls.name] as const;

/**
 * Genera una queryKey para pagos con ID dinámico
 */
export const createPaymentStatusKey = (paymentId: string) => 
  [QUERY_KEYS.PAYMENT_STATUS, paymentId] as const;

/**
 * Genera una queryKey para carreras de una combinación
 */
export const createRacesForCombinationKey = (combinationId: number) =>
  [QUERY_KEYS.RACES_FOR_COMBINATION, combinationId] as const;
