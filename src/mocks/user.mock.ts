import { User } from '../types/entities'; 
import type { RaceUser } from '../pages/UserRacesAdmin';

export const MOCK_USER_PROFILE: User = {
    id: 1,
    userName: 'maxi_simracer',
    realName: 'Maximiliano Goya',
    email: 'maxi.goya@myracing.com',
    password: '', 
    type: 'premium', 
};

export const MOCK_RACE_RESULTS: RaceUser[] = [
    {
        id: 101,
  registrationDateTime: '2025-09-01',
  startPosition: 15,
  finishPosition: 12,
  race: 'Nürburgring GP', 
  user: 'maxi_simracer',
    },
    {
        id: 101,
  registrationDateTime: '2025-09-02',
  startPosition: 9,
  finishPosition: 10,
  race: 'Monza Sprint', 
  user: 'maxi_simracer',
    },
    {
        id: 101,
  registrationDateTime: '2025-09-03',
  startPosition: 5,
  finishPosition: 1,
  race: 'Spa Endurance', 
  user: 'maxi_simracer',
    },
];
