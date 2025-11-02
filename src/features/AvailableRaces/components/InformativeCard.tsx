import { lazy } from 'react';
import { Combination, Race } from '../../../types/entities.ts';
import { Card } from '../../../components/tremor/TremorComponents.tsx';
import { GiFullMotorcycleHelmet } from 'react-icons/gi';

const Spinner = lazy(() => import('../../../components/Spinner.tsx'));

const srcImage =
  'https://images.unsplash.com/photo-1690811200593-8563dfe35e85?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470';

type Props = {
  selectedCombination: Combination;
  nextRace: Race | null;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
};

export default function InformativeCard({
  selectedCombination,
  nextRace,
  countdown,
}: Props) {
  return (
    <>
      <div className="lg:col-span-2">
        <Card className="relative h-full overflow-hidden rounded-3xl">
          <img
            className="w-full h-full object-cover rounded-xl"
            src={srcImage}
            alt="Cars"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex flex-col justify-between items-start p-6 md:p-10 text-left">
            <div>
              <h2 className="text-xl md:text-7xl font-bold text-white drop-shadow-lg">
                {selectedCombination.categoryVersion?.category?.denomination}
              </h2>
              <p className="mt-1 text-sm md:text-4xl text-gray-400">
                {selectedCombination.categoryVersion?.simulator?.name}
              </p>
              <p className="mt-1 text-sm md:text-4xl text-gray-400">
                {selectedCombination.circuitVersion?.circuit?.denomination}
              </p>
            </div>

            {nextRace &&
              (!countdown ? (
                <Spinner />
              ) : (
                <>
                  <h1 className="text-2xl md:text-4xl font-extrabold text-gray-200 drop-shadow-md">
                    Registro cierra en: {countdown.days}d {countdown.hours}h{' '}
                    {countdown.minutes}m {countdown.seconds}s
                  </h1>
                  {
                    <div className="absolute top-6 right-6 md:top-10 md:right-10 flex items-center gap-2 bg-black/60 px-3 py-2 rounded-full">
                      <GiFullMotorcycleHelmet className="text-white text-xl md:text-3xl" />
                      <span className="text-white text-lg md:text-2xl font-semibold">
                        {nextRace.raceUsers.length}
                      </span>
                    </div>
                  }
                </>
              ))}
          </div>
        </Card>
      </div>
    </>
  );
}
