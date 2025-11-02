import {
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/tremor/TremorComponents.tsx';
import { Race } from '../../../types/entities.ts';
import { useUser } from '../../../context/UserContext.tsx';
import { RaceListItem } from './RaceListItem.tsx';

type Props = {
  nextFiveRaces: Race[];
  races: Race[];
};

export default function RaceList({ nextFiveRaces, races }: Props) {
  const now = new Date();
  const { user } = useUser();

  const upcoming = [...nextFiveRaces];
  const past = races.filter((r) => new Date(r.raceDateTime) < now).reverse();

  const tabs = [
    { key: 'upcoming', label: 'Próximas', data: upcoming },
    { key: 'past', label: 'Pasadas', data: past },
  ];

  return (
    <Card className="bg-gray-900 p-0 shadow-md">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-50">Carreras</h3>
        <p className="text-sm text-gray-400">
          Consultá las próximas y las que ya finalizaron
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-gray-900 px-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="group">
              <div className="sm:flex sm:items-center sm:space-x-2">
                <span className="group-data-[state=active]:text-gray-50">
                  {tab.label}
                </span>
                <span className="hidden rounded-md bg-[#090E1A] px-2 py-1 text-xs font-semibold tabular-nums ring-1 ring-inset ring-gray-700 group-data-[state=active]:text-gray-300 sm:block">
                  {tab.data.length}
                </span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <ul
          role="list"
          className="rounded-b-md bg-gray-950 max-h-96 overflow-y-auto custom-scroll"
        >
          {tabs.map((tab) => (
            <TabsContent
              key={tab.key}
              value={tab.key}
              className="space-y-4 px-6 pb-6 pt-6"
            >
              {tab.data.length === 0 && (
                <p className="text-sm text-gray-400">
                  No hay carreras {tab.label.toLowerCase()}.
                </p>
              )}
              {tab.data.map((race) => (
                <RaceListItem key={race.id} race={race} user={user} />
              ))}
            </TabsContent>
          ))}
        </ul>
      </Tabs>
    </Card>
  );
}
