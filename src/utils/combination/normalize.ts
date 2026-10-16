import { Combination } from '../../types/entities';
import { toId } from '../entityId';

export function normalizeCombination(comb: Combination): Combination {
  return {
    ...comb,
    categoryVersion: toId(comb.categoryVersion) as any,
    circuitVersion: toId(comb.circuitVersion) as any,
  };
}
