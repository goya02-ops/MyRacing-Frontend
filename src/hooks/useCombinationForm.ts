import {
  Combination,
  CategoryVersion,
  CircuitVersion,
  Simulator,
} from '../types/entities.ts';
import { useState, useEffect } from 'react';
import { fetchOne } from '../services/apiService.ts';

interface useCombinationForm {
  form: Combination;
  setForm: React.Dispatch<React.SetStateAction<Combination>>;
  selectedSimulator: number | undefined;
  setSelectedSimulator: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  categoryVersions: CategoryVersion[];
  circuitVersions: CircuitVersion[];
  loading: boolean;
}

export function useCombinationForm(initial: Combination): useCombinationForm {
  const [form, setForm] = useState<Combination>({
    ...initial,
    raceIntervalMinutes: initial.raceIntervalMinutes || 30,
  });
  const [selectedSimulator, setSelectedSimulator] = useState<
    number | undefined
  >(() => {
    if (
      initial.id &&
      initial.categoryVersion &&
      typeof initial.categoryVersion === 'object'
    ) {
      const sim = initial.categoryVersion.simulator;
      return typeof sim === 'object' ? sim.id : sim;
    }
    return undefined;
  });

  const [categoryVersions, setCategoryVersions] = useState<CategoryVersion[]>(
    []
  );
  const [circuitVersions, setCircuitVersions] = useState<CircuitVersion[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch the selected simulator and set category/circuit versions from its properties
  useEffect(() => {
    const fetchSimulatorData = async () => {
      if (!selectedSimulator) {
        setCategoryVersions([]);
        setCircuitVersions([]);
        return;
      }
      setLoading(true);
      try {
        const simulator = (await fetchOne(Simulator as any, {
          id: selectedSimulator,
        })) as Simulator;

        setCategoryVersions(
          Array.isArray(simulator.categories) ? simulator.categories : []
        );
        setCircuitVersions(
          Array.isArray(simulator.circuits) ? simulator.circuits : []
        );
      } catch (error) {
        setCategoryVersions([]);
        setCircuitVersions([]);
        console.error('Error fetching simulator:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSimulatorData();
  }, [selectedSimulator]);
  return {
    form,
    setForm,
    selectedSimulator,
    setSelectedSimulator,
    categoryVersions,
    circuitVersions,
    loading,
  };
}
