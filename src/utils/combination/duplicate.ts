import { Combination } from '../../types/entities';

export function isDuplicateCombination(
  list: Combination[],
  comb: Combination
): boolean {
  const getId = (v: unknown) =>
    typeof v === 'object' && v !== null ? (v as any).id : v;

  return list.some((item) => {
    const itemCatId = getId(item.categoryVersion);
    const itemCircId = getId(item.circuitVersion);
    const combCatId = getId(comb.categoryVersion);
    const combCircId = getId(comb.circuitVersion);

    return (
      itemCatId === combCatId &&
      itemCircId === combCircId &&
      item.dateFrom === comb.dateFrom &&
      item.dateTo === comb.dateTo &&
      item.id !== comb.id
    );
  });
}
