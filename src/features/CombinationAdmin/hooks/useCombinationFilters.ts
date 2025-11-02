import { useMemo, useState } from 'react';
import { Combination } from '../../../types/entities.ts';

const getSimulatorIdFromCombination = (
  comb: Combination
): number | undefined => {
  if (comb.categoryVersion?.simulator) {
    return typeof comb.categoryVersion.simulator === 'object'
      ? comb.categoryVersion.simulator.id
      : (comb.categoryVersion.simulator as number);
  }
  if (comb.circuitVersion?.simulator) {
    return typeof comb.circuitVersion.simulator === 'object'
      ? comb.circuitVersion.simulator.id
      : (comb.circuitVersion.simulator as number);
  }
  return undefined;
};
const getCategoryIdFromCombination = (
  comb: Combination
): number | undefined => {
  if (comb.categoryVersion?.category) {
    return typeof comb.categoryVersion.category === 'object'
      ? comb.categoryVersion.category.id
      : (comb.categoryVersion.category as number);
  }
  return undefined;
};
const getCircuitIdFromCombination = (comb: Combination): number | undefined => {
  if (comb.circuitVersion?.circuit) {
    return typeof comb.circuitVersion.circuit === 'object'
      ? comb.circuitVersion.circuit.id
      : (comb.circuitVersion.circuit as number);
  }
  return undefined;
};

export type UserTypeFilter = 'ALL' | 'PREMIUM' | 'COMÚN';
export type EntityFilter = number | 'ALL';

export interface CombinationFilterLogic {
  filteredList: Combination[];
  filterSimulatorId: EntityFilter;
  setFilterSimulatorId: (v: EntityFilter) => void;
  filterCategoryId: EntityFilter;
  setFilterCategoryId: (v: EntityFilter) => void;
  filterCircuitId: EntityFilter;
  setFilterCircuitId: (v: EntityFilter) => void;
  filterUserType: UserTypeFilter;
  setFilterUserType: (v: UserTypeFilter) => void;
  filterDateFrom: string;
  setFilterDateFrom: (v: string) => void;
  filterDateTo: string;
  setFilterDateTo: (v: string) => void;
}

export function useCombinationFilters(
  list: Combination[]
): CombinationFilterLogic {
  const [filterSimulatorId, setFilterSimulatorId] =
    useState<EntityFilter>('ALL');
  const [filterCategoryId, setFilterCategoryId] = useState<EntityFilter>('ALL');
  const [filterCircuitId, setFilterCircuitId] = useState<EntityFilter>('ALL');
  const [filterUserType, setFilterUserType] = useState<UserTypeFilter>('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const filteredList = useMemo(() => {
    return list.filter((comb: Combination) => {
      const simId = getSimulatorIdFromCombination(comb);
      const catId = getCategoryIdFromCombination(comb);
      const circId = getCircuitIdFromCombination(comb);
      const userType = comb.userType?.toUpperCase() as UserTypeFilter;
      const combDateFrom = comb.dateFrom
        ? new Date(comb.dateFrom).getTime()
        : 0;
      const combDateTo = comb.dateTo
        ? new Date(comb.dateTo).getTime()
        : Infinity;
      const filterStartDate = filterDateFrom
        ? new Date(filterDateFrom).getTime()
        : 0;
      const filterEndDate = filterDateTo
        ? new Date(filterDateTo).getTime()
        : Infinity;
      const matchSimulator =
        filterSimulatorId === 'ALL' ||
        (simId !== undefined && simId === filterSimulatorId);
      const matchCategory =
        filterCategoryId === 'ALL' ||
        (catId !== undefined && catId === filterCategoryId);
      const matchCircuit =
        filterCircuitId === 'ALL' ||
        (circId !== undefined && circId === filterCircuitId);
      const matchUserType =
        filterUserType === 'ALL' || userType === filterUserType;
      const matchDates =
        combDateFrom <= filterEndDate && combDateTo >= filterStartDate;
      return (
        matchSimulator &&
        matchCategory &&
        matchCircuit &&
        matchUserType &&
        matchDates
      );
    });
  }, [
    list,
    filterSimulatorId,
    filterCategoryId,
    filterCircuitId,
    filterUserType,
    filterDateFrom,
    filterDateTo,
  ]);

  return {
    filteredList,
    filterSimulatorId,
    setFilterSimulatorId,
    filterCategoryId,
    setFilterCategoryId,
    filterCircuitId,
    setFilterCircuitId,
    filterUserType,
    setFilterUserType,
    filterDateFrom,
    setFilterDateFrom,
    filterDateTo,
    setFilterDateTo,
  };
}
