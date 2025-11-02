import { Combination } from '../../types/entities';

export const getCircuitName = (c: Combination) =>
  c.circuitVersion?.circuit?.denomination || 'Pista N/A';

export const getCategoryName = (c: Combination) =>
  c.categoryVersion?.category?.denomination || 'Clase N/A';

export const getSimulatorName = (c: Combination) =>
  c.categoryVersion?.simulator?.name || 'Simulador N/A';
