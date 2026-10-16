import { Combination } from '../../types/entities';

export const toId = (v: unknown): number | undefined =>
  typeof v === 'object' && v ? (v as { id?: number }).id : (v as number | undefined);

export function normalizeCombination(comb: Combination): Combination {
  return {
    ...comb,
    categoryVersion: toId(comb.categoryVersion) as any,
    circuitVersion: toId(comb.circuitVersion) as any,
  };
}
