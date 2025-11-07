import { useQuery } from '@tanstack/react-query';
import { fetchOne } from '../../../services/apiService.ts'; 
import {
  Combination,
  CategoryVersion,
  CircuitVersion,
  Simulator,
} from '../../../types/entities.ts';
import { useState, useCallback, useMemo } from 'react';

interface UseCombinationFormProps {
  initial: Combination;
}

interface UseCombinationFormReturn {
  form: Combination;
  selectedSimulator: number | undefined;
  categoryVersions: CategoryVersion[];
  circuitVersions: CircuitVersion[];
  loading: boolean;
  handleSimulatorChange: (value: string) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getIdValue: (field: 'categoryVersion' | 'circuitVersion') => number | '';
}

const fetchSimulatorDetails = async (selectedSimulator: number) => {
    const simulator = (await fetchOne(Simulator as any, {
      id: selectedSimulator,
    })) as Simulator;
    
    const categoryVersions = Array.isArray(simulator.categories) ? simulator.categories : [];
    const circuitVersions = Array.isArray(simulator.circuits) ? simulator.circuits : [];

    return { categoryVersions, circuitVersions };
};


export function useCombinationForm({
  initial,
}: UseCombinationFormProps): UseCombinationFormReturn {
    
  const initialSimulatorId = useMemo(() => {
    if (initial.id && initial.categoryVersion && typeof initial.categoryVersion === 'object') {
        const sim = initial.categoryVersion.simulator;
        return typeof sim === 'object' ? sim.id : sim;
    }
    return undefined;
  }, [initial]);
  
  const [form, setForm] = useState<Combination>({
    ...initial,
    raceIntervalMinutes: initial.raceIntervalMinutes || 30,
  });

  const [selectedSimulator, setSelectedSimulator] = useState<number | undefined>(initialSimulatorId);
  
  const { data, isLoading: loadingVersions } = useQuery({
    queryKey: ['simulatorVersions', selectedSimulator],
    queryFn: () => fetchSimulatorDetails(selectedSimulator!), 
    enabled: !!selectedSimulator, 
    staleTime: Infinity, 
  });

  const categoryVersions = data?.categoryVersions || [];
  const circuitVersions = data?.circuitVersions || [];
  const loading = loadingVersions; 

  const handleSimulatorChange = useCallback(
    (value: string) => {
      const simId = value ? Number(value) : undefined;
      setSelectedSimulator(simId);
      
      setForm((prev) => ({
        ...prev,
        categoryVersion: undefined,
        circuitVersion: undefined,
      }));
    },
    [setForm, setSelectedSimulator]
  );

  const handleSelectChange = useCallback(
    (name: string, value: string) => {
      setForm((prev) => ({
        ...prev,
        [name]: name === 'userType' ? value : value ? Number(value) : undefined,
      }));
    },
    [setForm]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: type === 'number' ? (value ? Number(value) : 0) : value,
      }));
    },
    [setForm]
  );
  
  const getIdValue = (field: 'categoryVersion' | 'circuitVersion') => {
    const val = form[field];
    return typeof val === 'object' && val ? val.id || '' : val || '';
  };

  return {
    form,
    selectedSimulator,
    categoryVersions: categoryVersions as CategoryVersion[],
    circuitVersions: circuitVersions as CircuitVersion[],
    loading,
    handleSimulatorChange,
    handleSelectChange,
    handleInputChange,
    getIdValue,
  };
}