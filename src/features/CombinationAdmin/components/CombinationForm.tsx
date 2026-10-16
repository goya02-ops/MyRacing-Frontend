import { Combination } from '../../../types/entities';
import { useCombinationForm } from '../hooks/useCombinationForm';
import { Button, Divider } from '../../../components/tremor/TremorComponents';
import { useCombinationAdminContext } from '../../../context/CombinationAdminContext.tsx';

import { FormDependencySelects } from './form/FormDependencySelects';
import { FormDatePickers } from './form/FormDatePickers.tsx';
import { FormConfigInputs } from './form/FormConfigInputs';
import { FormUserTypeSelect } from './form/FormUserTypeSelect';

export default function CombinationForm() {
  const { editing, handleSave, handleCancel } = useCombinationAdminContext();

  const initial = editing as Combination;

  const {
    form,
    selectedSimulator,
    categoryVersions,
    circuitVersions,
    loading,
    handleSimulatorChange,
    handleSelectChange,
    handleInputChange,
  } = useCombinationForm({ initial });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave(form);
      }}
      className="space-y-6"
    >
      <FormDependencySelects
        form={form}
        selectedSimulator={selectedSimulator}
        categoryVersions={categoryVersions}
        circuitVersions={circuitVersions}
        loadingVersions={loading}
        onSimulatorChange={handleSimulatorChange}
        onSelectChange={handleSelectChange}
      />

      <Divider />

      <FormDatePickers form={form} onInputChange={handleInputChange} />

      <Divider />

      <FormConfigInputs form={form} onInputChange={handleInputChange} />

      <Divider />

      <FormUserTypeSelect form={form} onSelectChange={handleSelectChange} />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar
        </Button>
      </div>
    </form>
  );
}
