import { Combination } from '../../types/entities';

const toId = (v: unknown) => (typeof v === 'object' && v ? (v as any).id : v);

export function normalizeCombination(comb: Combination): Combination {
  return {
    ...comb,
    categoryVersion: toId(comb.categoryVersion) as any,
    circuitVersion: toId(comb.circuitVersion) as any,
  };
}
