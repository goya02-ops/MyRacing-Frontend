import React from 'react';
import { Card } from '../../../components/tremor/Card';

interface UserStats {
  totalRaces: number;
  victories: number;
  podiums: number;
  lastRaceDate: string;
}

interface UserStatsCardProps {
  stats: UserStats;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({ stats }) => {
  const { totalRaces, victories, podiums, lastRaceDate } = stats;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-t-4 border-t-blue-500">
        <p className="text-sm">Total de Carreras</p>
        <p className="text-3xl font-semibold">{totalRaces}</p>
      </Card>

      <Card className="border-t-4 border-t-yellow-500">
        <p className="text-sm">Victorias 🥇</p>
        <p className="text-3xl font-semibold">{victories}</p>
      </Card>

      <Card className="border-t-4 border-t-orange-500">
        <p className="text-sm">Podios 🏆</p>
        <p className="text-3xl font-semibold">{podiums}</p>
      </Card>

      <Card className="border-t-4 border-t-green-500">
        <p className="text-sm">Última Carrera</p>
        <p className="text-lg font-semibold">{lastRaceDate || 'N/A'}</p>
      </Card>
    </div>
  );
};
