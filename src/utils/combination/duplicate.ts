import { Combination } from '../../types/entities';
import { toId } from '../entityId';

export function isDuplicateCombination(
  list: Combination[],
  comb: Combination
): boolean {
  return list.some((item) => {
    const itemCatId = toId(item.categoryVersion);
    const itemCircId = toId(item.circuitVersion);
    const combCatId = toId(comb.categoryVersion);
    const combCircId = toId(comb.circuitVersion);

    return (
      itemCatId === combCatId &&
      itemCircId === combCircId &&
      item.dateFrom === comb.dateFrom &&
      item.dateTo === comb.dateTo &&
      item.id !== comb.id
    );
  });
}
