import { vi } from 'vitest';
import type { CombinationAdminContextType } from '../../context/CombinationAdminContext';
import {
  Category,
  CategoryVersion,
  Circuit,
  CircuitVersion,
  Combination,
  Simulator,
} from '../../types/entities';

export function simulatorFixture(id = 1, name = 'rFactor 2'): Simulator {
  return { id, name, status: 'Activo' };
}

export function combinationFixture(
  overrides: Partial<Combination> = {},
): Combination {
  const categoryVersion: CategoryVersion = {
    id: 10,
    status: 'Activa',
    category: {
      id: 3,
      denomination: 'GT3',
      abbreviation: 'GT3',
      description: '',
    } as Category,
    simulator: simulatorFixture(),
  };

  const circuitVersion: CircuitVersion = {
    id: 20,
    status: 'Activa',
    simulator: simulatorFixture(),
    circuit: {
      id: 5,
      denomination: 'Interlagos',
      abbreviation: 'INT',
      description: '',
    } as Circuit,
  };

  return {
    id: 1,
    dateFrom: '2026-01-01T08:00',
    dateTo: '2026-01-31T18:00',
    lapsNumber: 10,
    obligatoryStopsQuantity: 1,
    userType: 'Común',
    raceIntervalMinutes: 30,
    categoryVersion,
    circuitVersion,
    ...overrides,
  } as Combination;
}

export function makeCombinationAdminContextValue(
  overrides: Partial<CombinationAdminContextType> = {},
): CombinationAdminContextType {
  const combination = combinationFixture();
  return {
    simulators: [simulatorFixture()],
    categories: [],
    circuits: [],
    loadingDependencies: false,
    list: [combination],
    filteredList: [combination],
    editing: null,
    isCreating: false,
    handleSave: vi.fn(),
    handleCancel: vi.fn(),
    handleEditCombination: vi.fn(),
    ...overrides,
  };
}
