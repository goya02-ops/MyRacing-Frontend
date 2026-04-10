/**
 * Constantes centralizadas para las queryKeys de React Query.
 * Usar estas constantes en lugar de strings hardcodeados para evitar errores
 * y mantener consistencia en toda la aplicación.
 */
export const QUERY_KEYS = {
  // Entidades genéricas (usa cls.name como parte de la key)
  ENTITY: '[cls.name]',

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
 * Genera una queryKey para pagos con ID dinámico
 */
export const createPaymentStatusKey = (paymentId: string) => 
  [QUERY_KEYS.PAYMENT_STATUS, paymentId] as const;

/**
 * Genera una queryKey para carreras de una combinación
 */
export const createRacesForCombinationKey = (combinationId: number) =>
  [QUERY_KEYS.RACES_FOR_COMBINATION, combinationId] as const;
