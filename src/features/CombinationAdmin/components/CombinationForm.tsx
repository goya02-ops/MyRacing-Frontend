import { Combination } from '../../../types/entities';
import { useCombinationForm } from '../hooks/useCombinationForm';
import { Button, Divider } from '../../../components/tremor/TremorComponents';
import { useCombinationAdminContext } from '../../../context/CombinationAdminContext.tsx';

import { FormDependencySelects } from './form/FormDependencySelects';
import { FormDatePickers } from './form/FormDatePickers.tsx';
import { FormConfigInputs } from './form/FormConfigInputs';
import { FormUserTypeSelect } from './form/FormUserTypeSelect';

interface CombinationFormProps {
  initial: Combination;
  onSave: (combination: Combination) => void;
  onCancel: () => void;
}

export default function CombinationForm({
  initial,
  onSave,
  onCancel,
}: CombinationFormProps) {
  const { simulators, loadingDependencies } = useCombinationAdminContext();

  const {
    form,
    selectedSimulator,
    categoryVersions,
    circuitVersions,
    loading,
    handleSimulatorChange,
    handleSelectChange,
    handleInputChange,
    getIdValue,
  } = useCombinationForm({ initial });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-6"
    >
      <FormDependencySelects
        simulators={simulators}
        selectedSimulator={selectedSimulator}
        loadingSimulators={loadingDependencies}
        loadingVersions={loading}
        categoryVersions={categoryVersions}
        circuitVersions={circuitVersions}
        formValues={{
          categoryVersion: getIdValue('categoryVersion').toString(),
          circuitVersion: getIdValue('circuitVersion').toString(),
        }}
        onSimulatorChange={handleSimulatorChange}
        onSelectChange={handleSelectChange}
      />

      <Divider />

      <FormDatePickers
        dateFrom={form.dateFrom}
        dateTo={form.dateTo}
        onInputChange={handleInputChange}
      />

      <Divider />

      <FormConfigInputs
        lapsNumber={form.lapsNumber}
        stops={form.obligatoryStopsQuantity}
        interval={form.raceIntervalMinutes}
        onInputChange={handleInputChange}
      />

      <Divider />

      <FormUserTypeSelect
        userType={form.userType}
        onSelectChange={handleSelectChange}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar
        </Button>
      </div>
    </form>
  );
}
