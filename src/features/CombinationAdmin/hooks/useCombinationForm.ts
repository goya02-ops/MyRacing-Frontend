import {
  Combination,
  CategoryVersion,
  CircuitVersion,
  Simulator,
} from '../../../types/entities.ts';
import { useState, useEffect, useCallback } from 'react';
import { fetchOne } from '../../../services/apiService.ts';

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

// Helper para formatear fechas a datetime-local
function formatDateTimeLocal(date: string | Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function useCombinationForm({
  initial,
}: UseCombinationFormProps): UseCombinationFormReturn {
  const [form, setForm] = useState<Combination>({
    ...initial,
    dateFrom: formatDateTimeLocal(initial.dateFrom), 
    dateTo: formatDateTimeLocal(initial.dateTo),     
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
        console.error('Error fetching simulator versions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSimulatorData();
  }, [selectedSimulator]);

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
    categoryVersions,
    circuitVersions,
    loading,
    handleSimulatorChange,
    handleSelectChange,
    handleInputChange,
    getIdValue,
  };
}