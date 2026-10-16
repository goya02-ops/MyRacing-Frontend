import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CombinationCard } from './CombinationCard';
import { useRaceInscription } from '../hooks/useRaceInscription';
import { Combination, Race, User } from '../../../types/entities';

// Se mockea el hook para observar que se invoque SIEMPRE (hook incondicional)
// y que el botón dispare el handler (botón vivo).
const handleInscription = vi.hoisted(() => vi.fn());
vi.mock('../hooks/useRaceInscription', () => ({
  useRaceInscription: vi.fn(() => ({
    loading: false,
    success: false,
    handleInscription,
  })),
}));

// El contexto se controla a mano para simular "sin sesión" / "con sesión".
const auth = vi.hoisted(() => ({ user: null as User | null }));
vi.mock('../../../context/UserContext.tsx', () => ({
  useUser: () => ({ user: auth.user, setUser: vi.fn(), logout: vi.fn() }),
}));

const mockUseRaceInscription = vi.mocked(useRaceInscription);

const combination = {
  id: 5,
  dateFrom: '2026-01-01',
  dateTo: '2026-12-31',
  lapsNumber: 3,
  obligatoryStopsQuantity: 1,
  userType: 'Común',
  raceIntervalMinutes: 30,
} as unknown as Combination;

const nextRace = { id: 7, combination: { id: 5 } } as unknown as Race;

describe('CombinationCard (BE #55)', () => {
  beforeEach(() => {
    mockUseRaceInscription.mockClear();
    handleInscription.mockClear();
    auth.user = { id: 1, userName: 'piloto' } as User;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('invoca el hook aunque no haya sesión (hook incondicional)', () => {
    auth.user = null;

    render(<CombinationCard combination={combination} nextRace={nextRace} />);

    expect(mockUseRaceInscription).toHaveBeenCalled();
  });

  it('al hacer click en Inscribirse dispara la inscripción (botón vivo)', async () => {
    render(<CombinationCard combination={combination} nextRace={nextRace} />);

    await userEvent.click(
      screen.getByRole('button', { name: /inscribirse/i }),
    );

    expect(handleInscription).toHaveBeenCalledTimes(1);
  });
});
