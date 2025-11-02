import { Button } from '../../../components/tremor/TremorComponents';

interface VersionHeaderProps {
  title: string;
  simulatorName: string;
  onNewVersion: () => void;
}

export function VersionHeader({
  title,
  simulatorName,
  onNewVersion,
}: VersionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
      <h3 className="text-lg font-semibold">
        Versiones de {title} para{' '}
        <span className="text-orange-400">{simulatorName}</span>
      </h3>
      <Button onClick={onNewVersion} className="w-full sm:w-auto">
        + Nueva Versión
      </Button>
    </div>
  );
}
