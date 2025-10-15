import type { Combination } from '../types/entities.ts';

export default function createHabdlers(
  setSelectedSimulator: React.Dispatch<
    React.SetStateAction<number | undefined>
  >,
  setForm: React.Dispatch<React.SetStateAction<Combination>>
) {
  const handleSimulatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const simId = e.target.value ? Number(e.target.value) : undefined;
    setSelectedSimulator(simId);
    setForm((prev) => ({
      ...prev,
      categoryVersion: undefined,
      circuitVersion: undefined,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'userType' ? value : value ? Number(value) : undefined,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : 0) : value,
    }));
  };

  return {
    handleSimulatorChange,
    handleSelectChange,
    handleInputChange,
  };
}
