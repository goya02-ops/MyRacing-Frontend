import { Combination } from '../../types/entities';

export function getCategoryName(comb: Combination): string {
  const cv = comb.categoryVersion as any;
  const cat = cv && typeof cv === 'object' ? cv.category : null;
  if (cat && typeof cat === 'object')
    return cat.denomination || cat.abbreviation || 'Sin nombre';
  return 'N/A';
}

export function getCircuitName(comb: Combination): string {
  const cv = comb.circuitVersion as any;
  const circ = cv && typeof cv === 'object' ? cv.circuit : null;
  if (circ && typeof circ === 'object')
    return circ.denomination || circ.abbreviation || 'Sin nombre';
  return 'N/A';
}

export function getSimulatorName(comb: Combination): string {
  const cv = comb.categoryVersion as any;
  const sim = cv && typeof cv === 'object' ? cv.simulator : null;
  if (sim && typeof sim === 'object') return sim.name || 'Sin nombre';
  return 'N/A';
}
